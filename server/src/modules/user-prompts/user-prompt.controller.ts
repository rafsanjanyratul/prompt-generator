import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import {
  createUserPromptSchema,
  deleteUserPromptService,
  listUserPromptsService,
  updateUserPromptSchema,
  updateUserPromptService,
  createUserPromptService,
} from './user-prompt.service.js'

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

export const createUserPromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createUserPromptSchema.parse(req.body)
    const prompt = await createUserPromptService(req.user!.id, payload)

    res.status(201).json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}

export const listUserPromptsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompts = await listUserPromptsService(req.user!.id)

    res.status(200).json({
      success: true,
      data: prompts,
    })
  } catch (error) {
    next(error)
  }
}

export const updateUserPromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateUserPromptSchema.parse(req.body)
    const promptId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const prompt = await updateUserPromptService(req.user!.id, promptId, payload)

    res.status(200).json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}

export const deleteUserPromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const prompt = await deleteUserPromptService(req.user!.id, promptId)

    res.status(200).json({
      success: true,
      data: {
        deleted: true,
        id: promptId,
        prompt,
      },
    })
  } catch (error) {
    next(error)
  }
}
