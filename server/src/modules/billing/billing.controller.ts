import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import { getActivePlans, getPlanById, validatePlanEligibility } from './plan.service.js'
import { activateFreeSubscription, getCurrentSubscription } from './subscription.service.js'
import { initiateDemoPayment, verifyDemoPayment, getPaymentById, getUserPayments } from './payment.service.js'
import { getCreditBalance, getCreditHistory, getAIUsageHistory } from './credit-info.service.js'
import { settleVerifiedCreditPayment } from './payment-settlement.service.js'

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

// Controllers

export const getPlansController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plans = await getActivePlans()
    res.json({ success: true, plans })
  } catch (error) {
    next(error)
  }
}

export const activateFreeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const bodySchema = z.object({
      planId: z.string().trim().min(1, 'Plan ID is required'),
    })

    const parseResult = bodySchema.safeParse(req.body)
    if (!parseResult.success) {
      throw createHttpError(400, formatValidationError(parseResult.error))
    }

    const { planId } = parseResult.data

    const plan = await validatePlanEligibility(planId)
    if (plan.planType !== 'free' || plan.purchaseType !== 'free') {
      throw createHttpError(400, 'Selected plan is not a free plan')
    }

    const subscription = await activateFreeSubscription(req.user.id, planId)

    res.json({
      success: true,
      subscription: {
        id: subscription._id.toString(),
        planId: subscription.planId.toString(),
        planName: subscription.planSnapshot.name,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const subscription = await getCurrentSubscription(req.user.id)

    if (!subscription) {
      res.json({ success: true, subscription: null })
      return
    }

    res.json({
      success: true,
      subscription: {
        id: subscription._id.toString(),
        planId: subscription.planId.toString(),
        planName: subscription.planSnapshot.name,
        planType: subscription.planSnapshot.planType,
        purchaseType: subscription.planSnapshot.purchaseType,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        creditEntitlement: subscription.planSnapshot.creditEntitlement,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const initiatePaidCheckoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const bodySchema = z.object({
      planId: z.string().trim().min(1, 'Plan ID is required'),
    })

    const parseResult = bodySchema.safeParse(req.body)
    if (!parseResult.success) {
      throw createHttpError(400, formatValidationError(parseResult.error))
    }

    const { planId } = parseResult.data

    const plan = await validatePlanEligibility(planId)
    if (plan.planType !== 'paid') {
      throw createHttpError(400, 'Selected plan is not a paid plan')
    }

    const payment = await initiateDemoPayment(req.user.id, planId, plan)

    res.json({
      success: true,
      payment: {
        id: payment._id.toString(),
        status: payment.status,
        verificationStatus: payment.verificationStatus,
        amount: payment.amount.toString(),
        currency: payment.currency,
        planName: payment.planSnapshot.name,
        creditEntitlement: payment.planSnapshot.creditEntitlement,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const verifyDemoPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const bodySchema = z.object({
      paymentId: z.string().trim().min(1, 'Payment ID is required'),
    })

    const parseResult = bodySchema.safeParse(req.body)
    if (!parseResult.success) {
      throw createHttpError(400, formatValidationError(parseResult.error))
    }

    const { paymentId } = parseResult.data

    const payment = await getPaymentById(paymentId)
    if (!payment || payment.userId.toString() !== req.user.id) {
      throw createHttpError(404, 'Payment transaction not found')
    }

    // Server-controlled demo payment outcome (90% success for demo purposes)
    const shouldSucceed = Math.random() < 0.9
    const verified = await verifyDemoPayment(paymentId, shouldSucceed)

    if (shouldSucceed && verified.verificationStatus === 'verified') {
      // Settle the payment atomically with subscription activation and credit grant
      const { settleVerifiedCreditPaymentWithSubscription } = await import(
        './payment-settlement.service.js'
      )
      const { payment: settled, subscription } = await settleVerifiedCreditPaymentWithSubscription(
        paymentId,
      )

      res.json({
        success: true,
        payment: {
          id: settled._id.toString(),
          status: settled.status,
          verificationStatus: settled.verificationStatus,
          provider: settled.provider,
          mode: settled.mode,
        },
        subscription: subscription
          ? {
              id: subscription._id.toString(),
              status: subscription.status,
            }
          : null,
      })
    } else {
      res.json({
        success: true,
        payment: {
          id: verified._id.toString(),
          status: verified.status,
          verificationStatus: verified.verificationStatus,
          provider: verified.provider,
          mode: verified.mode,
        },
      })
    }
  } catch (error) {
    next(error)
  }
}

export const getPaymentHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const payments = await getUserPayments(req.user.id)

    res.json({
      success: true,
      payments: payments.map((p) => ({
        id: p._id.toString(),
        planName: p.planSnapshot.name,
        amount: p.amount.toString(),
        currency: p.currency,
        status: p.status,
        verificationStatus: p.verificationStatus,
        provider: p.provider,
        mode: p.mode,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    next(error)
  }
}

export const getCreditBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const balance = await getCreditBalance(req.user.id)

    res.json({ success: true, ...balance })
  } catch (error) {
    next(error)
  }
}

export const getCreditHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const history = await getCreditHistory(req.user.id)

    res.json({ success: true, history })
  } catch (error) {
    next(error)
  }
}

export const getAIUsageHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const usage = await getAIUsageHistory(req.user.id)

    res.json({ success: true, usage })
  } catch (error) {
    next(error)
  }
}
