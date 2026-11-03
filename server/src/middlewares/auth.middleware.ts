import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { User } from '../modules/users/user.model.js'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Authentication token is required')
    }

    const token = authorizationHeader.replace('Bearer ', '').trim()

    if (!token) {
      throw createHttpError(401, 'Authentication token is required')
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub?: string }
    const userId = decoded.sub

    if (!userId) {
      throw createHttpError(401, 'Invalid authentication token')
    }

    const user = await User.findById(userId).select('name email role')

    if (!user) {
      throw createHttpError(401, 'User no longer exists')
    }

    const normalizedRole = user.role === 'admin' ? 'admin' : 'user'

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: normalizedRole,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(createHttpError(401, 'Authentication token has expired'))
      return
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(createHttpError(401, 'Invalid authentication token'))
      return
    }

    next(error)
  }
}

export const adminMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication token is required')
    }

    const user = await User.findById(req.user.id).select('role')

    if (!user) {
      throw createHttpError(401, 'User no longer exists')
    }

    if (user.role !== 'admin') {
      throw createHttpError(403, 'Admin access required')
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(createHttpError(401, 'Authentication token has expired'))
      return
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(createHttpError(401, 'Invalid authentication token'))
      return
    }

    if (error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number') {
      next(error)
      return
    }

    next(error)
  }
}
