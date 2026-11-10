import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import { enhancePrompt } from './ai.service.js'

const enhancePromptSchema = z
  .object({
    idea: z.string().trim().min(1, 'Idea is required').max(1500, 'Idea must be 1500 characters or fewer'),
  })
  .strict()

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const formatValidationError = (error: z.ZodError) =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'body'
      return `${path}: ${issue.message}`
    })
    .join('; ')

export const enhancePromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idea } = enhancePromptSchema.parse(req.body)
    const prompt = await enhancePrompt(idea)

    res.status(200).json({
      success: true,
      data: { prompt },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}
