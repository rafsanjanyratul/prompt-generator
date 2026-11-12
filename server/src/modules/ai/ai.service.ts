import OpenAI, { APIConnectionError, APIError } from 'openai'

import { env } from '../../config/env.js'

const REQUEST_TIMEOUT_MS = 20_000
const MAX_OUTPUT_TOKENS = 700
export const AI_MODEL_ID = 'gpt-6-luna'

export type EnhancedPromptResult = {
  prompt: string
  responseId?: string
  model: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export class AIEnhancementError extends Error {
  constructor(
    message: string,
    readonly outcome: 'failed' | 'unknown',
    readonly statusCode = 502,
  ) {
    super(message)
    this.name = 'AIEnhancementError'
  }
}

const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    })
  : null

const instructions = `Transform the user's idea into one detailed, professional image-generation prompt.

Preserve the user's core subject, intended scene, and meaning. Add fitting subject detail, environment and background, lighting and atmosphere, composition and camera perspective, realistic visual details, and image-quality guidance. Keep additions coherent with the idea; do not introduce contradictory, irrelevant, or excessive details. Return only the enhanced prompt, with no explanation, heading, or introductory text.`

export async function enhancePromptWithUsage(idea: string): Promise<EnhancedPromptResult> {
  if (!openai) {
    throw new AIEnhancementError('AI prompt enhancement is not configured.', 'failed', 503)
  }

  try {
    const response = await openai.responses.create({
      model: AI_MODEL_ID,
      instructions,
      input: idea,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    })
    const prompt = response.output_text.trim()

    if (!prompt) {
      throw new AIEnhancementError(
        'The AI provider returned an empty response. Please try again.',
        'failed',
      )
    }

    return {
      prompt,
      responseId: response.id || undefined,
      model: response.model,
      ...(response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : {}),
    }
  } catch (error) {
    if (error instanceof AIEnhancementError) throw error

    const outcome = error instanceof APIConnectionError || (error instanceof APIError && error.status >= 500)
      ? 'unknown'
      : 'failed'
    throw new AIEnhancementError(
      outcome === 'unknown'
        ? 'The AI provider outcome could not be confirmed. Do not retry this request ID.'
        : 'The AI provider could not enhance this prompt. Start a new enhancement attempt to try again.',
      outcome,
    )
  }
}

export async function enhancePrompt(idea: string): Promise<string> {
  const result = await enhancePromptWithUsage(idea)
  return result.prompt
}
