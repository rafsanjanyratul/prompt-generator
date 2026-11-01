import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import { loginUser, loginSchema, registerSchema, registerUser } from './auth.service.js'

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

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = registerSchema.parse(req.body)
    const { user, token } = await registerUser(payload)

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body)
    const { user, token } = await loginUser(payload)

    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}
