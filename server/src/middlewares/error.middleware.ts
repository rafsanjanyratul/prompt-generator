import type { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (
  error: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error.statusCode ?? 500
  const message = statusCode === 500 ? 'Internal server error' : error.message
  const code = error.code

  res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  })
}
