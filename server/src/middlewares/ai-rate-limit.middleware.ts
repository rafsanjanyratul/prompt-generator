import type { NextFunction, Request, Response } from 'express'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const CLEANUP_INTERVAL_MS = 5 * 60_000

const userRequests = new Map<string, { count: number; resetAt: number }>()
let nextCleanupAt = Date.now() + CLEANUP_INTERVAL_MS

export const aiRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required',
    })
    return
  }

  const now = Date.now()

  if (now >= nextCleanupAt) {
    for (const [id, limit] of userRequests) {
      if (limit.resetAt <= now) {
        userRequests.delete(id)
      }
    }
    nextCleanupAt = now + CLEANUP_INTERVAL_MS
  }

  let userLimit = userRequests.get(userId)
  if (!userLimit || userLimit.resetAt <= now) {
    userLimit = { count: 0, resetAt: now + WINDOW_MS }
    userRequests.set(userId, userLimit)
  }

  if (userLimit.count >= MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.max(1, Math.ceil((userLimit.resetAt - now) / 1000)))
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
    })
    return
  }

  userLimit.count += 1
  next()
}
