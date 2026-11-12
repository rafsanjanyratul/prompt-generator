import { createHash } from 'node:crypto'

import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import { env } from '../../config/env.js'
import { AIUsage } from '../billing/ai-usage.model.js'
import {
  captureCredits,
  markUsageUnknown,
  releaseCredits,
  reserveCredits,
} from '../billing/credit.service.js'
import { AIEnhancementError, AI_MODEL_ID, enhancePromptWithUsage } from './ai.service.js'

const RESERVATION_LEASE_MS = 2 * 60 * 1000

const enhancePromptSchema = z
  .object({
    idea: z.string().trim().min(1, 'Idea is required').max(1500, 'Idea must be 1500 characters or fewer'),
    requestId: z.string().uuid('A valid request ID is required'),
  })
  .strict()

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

type EnhancementOutcome = 'confirmed_failure' | 'unknown'

const sendEnhancementError = (
  res: Response,
  statusCode: number,
  message: string,
  outcome: EnhancementOutcome,
) => {
  res.status(statusCode).json({ success: false, message, outcome })
}

const getErrorStatusCode = (error: unknown, fallback: number) =>
  error instanceof Error &&
  'statusCode' in error &&
  typeof error.statusCode === 'number'
    ? error.statusCode
    : fallback

const formatValidationError = (error: z.ZodError) =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'body'
      return `${path}: ${issue.message}`
    })
    .join('; ')

const isDuplicateKeyError = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 11000

const rejectExistingRequest = (
  usage: {
    payloadHash: string
    status: 'pending' | 'succeeded' | 'failed' | 'unknown'
  },
  payloadHash: string,
): never => {
  if (usage.payloadHash !== payloadHash) {
    throw createHttpError(409, 'This request ID was already used with a different idea.')
  }

  if (usage.status === 'pending') {
    throw createHttpError(409, 'This enhancement request is already in progress.')
  }

  if (usage.status === 'succeeded') {
    throw createHttpError(
      409,
      'This enhancement request has already been processed. Use a new request ID for another enhancement.',
    )
  }

  if (usage.status === 'unknown') {
    throw createHttpError(
      409,
      'The outcome of this enhancement could not be confirmed. Do not retry this request ID.',
    )
  }

  throw createHttpError(
    409,
    'This enhancement request has already failed. Use a new request ID to try again.',
  )
}

const logBillingFailure = (operation: string) => {
  console.error(`AI enhancement billing ${operation} failed`)
}

export const enhancePromptController = async (req: Request, res: Response, next: NextFunction) => {
  let userId: string
  try {
    if (!req.user?.id) {
      throw createHttpError(401, 'Authentication token is required')
    }
    userId = req.user.id

    const { idea: submittedIdea, requestId } = enhancePromptSchema.parse(req.body)
    const idea = submittedIdea.replace(/\s+/g, ' ').trim()
    if (!idea) throw createHttpError(400, 'Idea is required')

    const payloadHash = createHash('sha256').update(idea).digest('hex')
    const existingUsage = await AIUsage.findOne({ userId, requestId })
    if (existingUsage?.status === 'unknown' && existingUsage.payloadHash === payloadHash) {
      sendEnhancementError(
        res,
        409,
        'The outcome of this enhancement is unresolved. This request ID is locked to prevent duplicate processing.',
        'unknown',
      )
      return
    }
    if (existingUsage) rejectExistingRequest(existingUsage, payloadHash)

    let usage
    try {
      usage = await AIUsage.create({
        userId,
        requestId,
        payloadHash,
        modelId: AI_MODEL_ID,
      })
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error

      const racedUsage = await AIUsage.findOne({ userId, requestId })
      if (!racedUsage) throw error
      if (racedUsage.status === 'unknown' && racedUsage.payloadHash === payloadHash) {
        sendEnhancementError(
          res,
          409,
          'The outcome of this enhancement is unresolved. This request ID is locked to prevent duplicate processing.',
          'unknown',
        )
        return
      }
      rejectExistingRequest(racedUsage, payloadHash)
      throw createHttpError(409, 'This enhancement request is already being processed.')
    }
    if (!usage) throw createHttpError(500, 'Unable to create the AI usage record')

    const reservationIdempotencyKey = `ai-reserve:${userId}:${requestId}`
    try {
      await reserveCredits({
        userId,
        aiUsageId: usage._id.toString(),
        amount: env.AI_ENHANCEMENT_CREDIT_COST,
        idempotencyKey: reservationIdempotencyKey,
        reservationExpiresAt: new Date(Date.now() + RESERVATION_LEASE_MS),
      })
    } catch (reservationError) {
      try {
        const latestUsage = await AIUsage.findOne({ _id: usage._id, userId })
        if (
          latestUsage?.status === 'pending' &&
          latestUsage.reservedCredits > 0 &&
          latestUsage.reservationAllocations.length > 0
        ) {
          await releaseCredits(userId, usage._id.toString())
        } else if (latestUsage?.status === 'pending') {
          const cleanupResult = await AIUsage.updateOne(
            {
              _id: usage._id,
              userId,
              status: 'pending',
              reservedCredits: 0,
              reservationAllocations: { $size: 0 },
            },
            {
              $set: {
                status: 'failed',
                completedAt: new Date(),
                reservationExpiresAt: null,
              },
            },
          )
          if (cleanupResult.matchedCount !== 1) {
            throw createHttpError(409, 'AI usage state changed during reservation cleanup')
          }
        }
      } catch {
        logBillingFailure('reservation cleanup')
        next(createHttpError(500, 'Unable to confirm the credit reservation state. Please contact support.'))
        return
      }

      sendEnhancementError(
        res,
        getErrorStatusCode(reservationError, 500),
        'Credits could not be reserved. Start a new enhancement attempt to try again.',
        'confirmed_failure',
      )
      return
    }

    let result
    try {
      result = await enhancePromptWithUsage(idea)
    } catch (providerError) {
      const providerOutcome =
        providerError instanceof AIEnhancementError && providerError.outcome === 'failed'
          ? 'confirmed_failure'
          : 'unknown'
      let outcome: EnhancementOutcome = providerOutcome
      try {
        if (providerOutcome === 'unknown') {
          await markUsageUnknown(userId, usage._id.toString())
        } else {
          await releaseCredits(userId, usage._id.toString())
        }
      } catch {
        logBillingFailure(providerOutcome === 'unknown' ? 'unknown outcome recording' : 'reservation release')
        outcome = 'unknown'
      }
      sendEnhancementError(
        res,
        getErrorStatusCode(providerError, 502),
        outcome === 'unknown'
          ? 'The enhancement outcome or credit reservation could not be confirmed. This request is locked to prevent duplicate processing.'
          : providerError instanceof Error
            ? providerError.message
            : 'The AI provider could not enhance this prompt.',
        outcome,
      )
      return
    }

    try {
      await captureCredits(userId, usage._id.toString(), {
        modelId: result.model,
        providerResponseId: result.responseId,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
      })
    } catch {
      try {
        const currentUsage = await AIUsage.findOne({ _id: usage._id, userId })
        if (currentUsage?.status === 'succeeded') {
          res.status(200).json({
            success: true,
            data: { prompt: result.prompt },
          })
          return
        }

        await markUsageUnknown(userId, usage._id.toString(), {
          modelId: result.model,
          providerResponseId: result.responseId,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
        })
      } catch {
        logBillingFailure('capture reconciliation recording')
      }

      logBillingFailure('capture')
      sendEnhancementError(
        res,
        503,
        'Enhancement completed but credit capture is pending. This request is locked to prevent duplicate processing.',
        'unknown',
      )
      return
    }

    res.status(200).json({
      success: true,
      data: { prompt: result.prompt },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}
