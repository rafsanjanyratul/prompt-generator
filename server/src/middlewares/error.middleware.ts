import type { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (
  error: Error & { statusCode?: number; code?: string; name?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = error.statusCode ?? 500
  let message = statusCode === 500 ? 'Internal server error' : error.message

  if (error.name === 'MulterError') {
    statusCode = 400

    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Image must be 5 MB or smaller.'
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Expected an image file in the "image" field.'
    } else {
      message = error.message
    }
  }

  const code = error.code

  res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  })
}
