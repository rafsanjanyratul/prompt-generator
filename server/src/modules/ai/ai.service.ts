import OpenAI from 'openai'

import { env } from '../../config/env.js'

const REQUEST_TIMEOUT_MS = 20_000
const MAX_OUTPUT_TOKENS = 700

const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    })
  : null

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const instructions = `Transform the user's idea into one detailed, professional image-generation prompt.

Preserve the user's core subject, intended scene, and meaning. Add fitting subject detail, environment and background, lighting and atmosphere, composition and camera perspective, realistic visual details, and image-quality guidance. Keep additions coherent with the idea; do not introduce contradictory, irrelevant, or excessive details. Return only the enhanced prompt, with no explanation, heading, or introductory text.`

export async function enhancePrompt(idea: string): Promise<string> {
  if (!openai) {
    throw createHttpError(503, 'AI prompt enhancement is not configured.')
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-6-luna',
      instructions,
      input: idea,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    })
    const prompt = response.output_text.trim()

    if (!prompt) {
      throw new Error('Empty response')
    }

    return prompt
  } catch {
    throw createHttpError(502, 'The AI provider could not enhance this prompt. Please try again.')
  }
}
