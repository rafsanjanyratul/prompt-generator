import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import { env } from '../../config/env.js'
import { getActivePlans, validatePlanEligibility } from './plan.service.js'
import { activateFreeSubscription, getCurrentSubscription } from './subscription.service.js'
import {
  getUserPaymentStatus,
  getUserPayments,
  initiateSslCommerzPayment,
  processSslCommerzNotification,
  recordSslCommerzCancellation,
  recordSslCommerzFailure,
} from './payment.service.js'
import { getCreditBalance, getCreditHistory, getAIUsageHistory } from './credit-info.service.js'

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
    res.json({
      success: true,
      plans: plans.map((plan) => ({
        ...plan.toJSON(),
        priceAmount: plan.priceAmount.toString(),
      })),
    })
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
      planId: z.string().trim().regex(/^[\da-f]{24}$/i, 'Plan ID must be a valid plan identifier'),
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
      planId: z.string().trim().regex(/^[\da-f]{24}$/i, 'Plan ID must be a valid plan identifier'),
      customer: z.object({
        phone: z.string().trim().min(7).max(25)
          .regex(/^[+\d][\d\s().-]*$/)
          .refine((value) => value.replace(/\D/g, '').length >= 7, 'A valid phone number is required'),
        address: z.string().trim().min(1).max(50),
        city: z.string().trim().min(1).max(50),
        country: z.string().trim().min(1).max(50),
      }),
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

    if (plan.purchaseType !== 'one_time') {
      throw createHttpError(400, 'Only one-time plans are currently available for checkout')
    }

    const callbackUrl = (path: string) =>
      new URL(`/api/billing/payments/${path}`, env.API_BASE_URL).toString()
    const callbacks = {
      successUrl: callbackUrl('callback/success'),
      failUrl: callbackUrl('callback/fail'),
      cancelUrl: callbackUrl('callback/cancel'),
      ipnUrl: callbackUrl('ipn'),
    }
    const { payment, checkoutUrl } = await initiateSslCommerzPayment(
      req.user.id,
      planId,
      plan,
      {
        name: req.user.name,
        email: req.user.email,
        ...parseResult.data.customer,
      },
      callbacks,
    )

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
        checkoutUrl,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getPaymentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    const parseResult = z.object({
      paymentId: z.string().trim().min(1, 'Payment ID is required'),
    }).safeParse(req.params)
    if (!parseResult.success) {
      throw createHttpError(400, formatValidationError(parseResult.error))
    }

    const { paymentId } = parseResult.data
    const { payment, subscription } = await getUserPaymentStatus(req.user.id, paymentId)

    res.json({
      success: true,
      payment: {
        id: payment._id.toString(),
        planId: payment.planId.toString(),
        planName: payment.planSnapshot.name,
        amount: payment.amount.toString(),
        currency: payment.currency,
        creditEntitlement: payment.planSnapshot.creditEntitlement,
        status: payment.status,
        verificationStatus: payment.verificationStatus,
      },
      subscription: subscription
        ? {
            id: subscription._id.toString(),
            planName: subscription.planSnapshot.name,
            creditEntitlement: subscription.planSnapshot.creditEntitlement,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
}

const callbackSchema = z.object({
  tran_id: z.string().trim().min(1).max(30),
  val_id: z.string().trim().min(1).max(200).optional(),
  status: z.string().trim().max(32).optional(),
}).passthrough()

const getCallbackData = (body: unknown) => {
  const parsed = callbackSchema.safeParse(body)
  if (!parsed.success) {
    throw createHttpError(400, formatValidationError(parsed.error))
  }
  return parsed.data
}

const getPaymentReturnUrl = (paymentId: string, planId: string) => {
  const url = new URL('/checkout', env.FRONTEND_URL)
  url.searchParams.set('plan', planId)
  url.searchParams.set('paymentId', paymentId)
  return url.toString()
}

const handleVerifiedPaymentCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const callback = getCallbackData(req.body)
    if (!callback.val_id) {
      throw createHttpError(400, 'Payment validation ID is required')
    }

    const result = await processSslCommerzNotification({
      transactionId: callback.tran_id,
      validationId: callback.val_id,
    })

    res.redirect(
      303,
      getPaymentReturnUrl(result.payment._id.toString(), result.payment.planId.toString()),
    )
  } catch (error) {
    next(error)
  }
}

export const sslCommerzSuccessCallbackController = handleVerifiedPaymentCallback

export const sslCommerzFailCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const callback = getCallbackData(req.body)
    if (callback.status?.toUpperCase() !== 'FAILED') {
      throw createHttpError(400, 'Invalid payment failure callback')
    }

    const payment = callback.val_id
      ? (await processSslCommerzNotification({
          transactionId: callback.tran_id,
          validationId: callback.val_id,
        })).payment
      : await recordSslCommerzFailure(callback.tran_id)

    res.redirect(
      303,
      getPaymentReturnUrl(payment._id.toString(), payment.planId.toString()),
    )
  } catch (error) {
    next(error)
  }
}

export const sslCommerzCancelCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const callback = getCallbackData(req.body)
    if (!['CANCEL', 'CANCELED', 'CANCELLED'].includes(callback.status?.toUpperCase() ?? '')) {
      throw createHttpError(400, 'Invalid payment cancellation callback')
    }

    const payment = callback.val_id
      ? (await processSslCommerzNotification({
          transactionId: callback.tran_id,
          validationId: callback.val_id,
        })).payment
      : await recordSslCommerzCancellation(callback.tran_id)

    res.redirect(
      303,
      getPaymentReturnUrl(payment._id.toString(), payment.planId.toString()),
    )
  } catch (error) {
    next(error)
  }
}

export const sslCommerzIpnController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const callback = getCallbackData(req.body)
    if (!callback.val_id) {
      throw createHttpError(400, 'Payment validation ID is required')
    }

    await processSslCommerzNotification({
      transactionId: callback.tran_id,
      validationId: callback.val_id,
    })

    res.status(200).send('OK')
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
