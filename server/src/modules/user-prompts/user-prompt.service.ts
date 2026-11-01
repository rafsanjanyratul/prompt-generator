import { z } from 'zod'

import { UserPrompt } from './user-prompt.model.js'

export const createUserPromptSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  prompt: z.string().trim().min(1, 'Prompt is required'),
  category: z.string().trim().min(1, 'Category is required'),
  style: z.string().trim().min(1, 'Style is required'),
  tags: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().optional().default(''),
})

export const updateUserPromptSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    prompt: z.string().trim().min(1, 'Prompt is required').optional(),
    category: z.string().trim().min(1, 'Category is required').optional(),
    style: z.string().trim().min(1, 'Style is required').optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    description: z.string().trim().optional(),
  })
  .strict()

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

export async function createUserPromptService(userId: string, input: z.infer<typeof createUserPromptSchema>) {
  return UserPrompt.create({
    user: userId,
    ...input,
  })
}

export async function listUserPromptsService(userId: string) {
  return UserPrompt.find({ user: userId }).sort({ createdAt: -1 })
}

export async function updateUserPromptService(userId: string, promptId: string, input: z.infer<typeof updateUserPromptSchema>) {
  const { _id, createdAt, updatedAt, user, ...safeInput } = input as Record<string, unknown>

  if (Object.keys(safeInput).length === 0) {
    throw createHttpError(400, 'At least one field must be provided for update')
  }

  const prompt = await UserPrompt.findById(promptId)

  if (!prompt) {
    throw createHttpError(404, 'User prompt was not found')
  }

  if (prompt.user.toString() !== userId) {
    throw createHttpError(403, 'You do not have permission to update this prompt')
  }

  const updatedPrompt = await UserPrompt.findByIdAndUpdate(
    promptId,
    { $set: safeInput },
    { new: true, runValidators: true },
  )

  if (!updatedPrompt) {
    throw createHttpError(404, 'User prompt was not found')
  }

  return updatedPrompt
}

export async function deleteUserPromptService(userId: string, promptId: string) {
  const prompt = await UserPrompt.findById(promptId)

  if (!prompt) {
    throw createHttpError(404, 'User prompt was not found')
  }

  if (prompt.user.toString() !== userId) {
    throw createHttpError(403, 'You do not have permission to delete this prompt')
  }

  const deletedPrompt = await UserPrompt.findByIdAndDelete(promptId)

  if (!deletedPrompt) {
    throw createHttpError(404, 'User prompt was not found')
  }

  return deletedPrompt
}
