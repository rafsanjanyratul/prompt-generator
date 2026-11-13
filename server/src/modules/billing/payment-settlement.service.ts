import { Types, type HydratedDocument } from 'mongoose'

import { PaymentTransaction, type PaymentTransactionFields } from './payment-transaction.model.js'
import { Subscription, type SubscriptionFields } from './subscription.model.js'
import { Plan } from './plan.model.js'
import { grantCredits, withBillingTransaction } from './credit.service.js'
import { capturePlanSnapshot } from './plan.service.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const isDuplicateKeyError = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 11000

const toObjectId = (value: string) => {
  if (!/^[\da-f]{24}$/i.test(value)) {
    throw createHttpError(400, 'Payment transaction ID must be a valid ID')
  }
  return new Types.ObjectId(value)
}

export interface SettlementResult {
  payment: HydratedDocument<PaymentTransactionFields>
  subscription: HydratedDocument<SubscriptionFields> | null
}

export async function settleVerifiedCreditPaymentWithSubscription(
  paymentTransactionId: string,
): Promise<SettlementResult> {
  const paymentId = toObjectId(paymentTransactionId)

  try {
    return await withBillingTransaction(async (session) => {
      const payment = await PaymentTransaction.findById(paymentId).session(session)
      if (!payment) throw createHttpError(404, 'Payment transaction was not found')
      if (payment.status === 'succeeded') {
        // Idempotency: if already settled, find and return existing subscription
        const existingSub = await Subscription.findOne({
          userId: payment.userId,
          relatedPaymentId: paymentId,
        }).session(session)
        return { payment, subscription: existingSub }
      }
      if (!['pending', 'processing', 'failed', 'canceled'].includes(payment.status)) {
        throw createHttpError(409, 'Payment transaction is not eligible for settlement')
      }
      if (payment.verificationStatus !== 'verified' || !payment.verificationMetadata?.verifiedAt) {
        throw createHttpError(409, 'Payment transaction has not been verified')
      }
      if (
        payment.planSnapshot.purchaseType !== 'one_time' ||
        payment.planSnapshot.planType !== 'paid'
      ) {
        throw createHttpError(409, 'Only one-time credit purchases can be settled')
      }
      if (
        payment.amount.toString() !== payment.planSnapshot.priceAmount.toString() ||
        payment.currency !== payment.planSnapshot.currency
      ) {
        throw createHttpError(409, 'Payment transaction does not match its plan snapshot')
      }
      if (!Number.isSafeInteger(payment.planSnapshot.creditEntitlement) ||
        payment.planSnapshot.creditEntitlement <= 0
      ) {
        throw createHttpError(409, 'Payment plan has an invalid credit entitlement')
      }

      // Grant credits atomically
      await grantCredits(
        payment.userId.toString(),
        payment.planSnapshot.creditEntitlement,
        'top_up',
        `payment:${payment._id.toString()}:credit-grant`,
        {
          relatedPaymentId: payment._id.toString(),
          session,
        },
      )

      // Update payment status atomically
      const settledPayment = await PaymentTransaction.findOneAndUpdate(
        {
          _id: payment._id,
          status: { $in: ['pending', 'processing', 'failed', 'canceled'] },
          verificationStatus: 'verified',
        },
        {
          $set: {
            status: 'succeeded',
            completedAt: new Date(),
          },
        },
        { new: true, runValidators: true, session },
      )
      if (!settledPayment) {
        throw createHttpError(409, 'Payment transaction state changed during settlement')
      }

      // Activate subscription atomically in same transaction
      const planId = payment.planId
      const userId = payment.userId

      // Check the plan before changing subscription state.
      const plan = await Plan.findById(planId).session(session)
      if (!plan) {
        throw createHttpError(404, 'Associated plan was deleted')
      }

      const existingActive = await Subscription.findOne({
        userId,
        status: 'active',
      }).session(session)

      if (existingActive) {
        if (existingActive.planSnapshot.planType !== 'free') {
          return { payment: settledPayment, subscription: existingActive }
        }

        const now = new Date()
        const endedFreeSubscription = await Subscription.findOneAndUpdate(
          {
            _id: existingActive._id,
            userId,
            status: 'active',
            'planSnapshot.planType': 'free',
          },
          {
            $set: {
              status: 'canceled',
              currentPeriodEnd: now,
              canceledAt: now,
            },
          },
          { new: true, runValidators: true, session },
        )
        if (!endedFreeSubscription) {
          throw createHttpError(409, 'Free subscription state changed during payment settlement')
        }
      }

      const now = new Date()
      const subscription = new Subscription({
        userId,
        planId,
        planSnapshot: payment.planSnapshot,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: null,
        autoRenew: false,
        nextBillingAt: null,
        relatedPaymentId: paymentId,
      })

      await subscription.save({ session })

      return { payment: settledPayment, subscription }
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const settledPayment = await PaymentTransaction.findOne({
        _id: paymentId,
        status: 'succeeded',
      })
      if (settledPayment) {
        const existingSub = await Subscription.findOne({
          userId: settledPayment.userId,
          relatedPaymentId: paymentId,
        })
        return { payment: settledPayment, subscription: existingSub }
      }
    }
    throw error
  }
}

export async function settleVerifiedCreditPayment(
  paymentTransactionId: string,
): Promise<HydratedDocument<PaymentTransactionFields>> {
  const paymentId = toObjectId(paymentTransactionId)

  try {
    return await withBillingTransaction(async (session) => {
      const payment = await PaymentTransaction.findById(paymentId).session(session)
      if (!payment) throw createHttpError(404, 'Payment transaction was not found')
      if (payment.status === 'succeeded') return payment
      if (!['pending', 'processing', 'failed', 'canceled'].includes(payment.status)) {
        throw createHttpError(409, 'Payment transaction is not eligible for settlement')
      }
      if (payment.verificationStatus !== 'verified' || !payment.verificationMetadata?.verifiedAt) {
        throw createHttpError(409, 'Payment transaction has not been verified')
      }
      if (
        payment.planSnapshot.purchaseType !== 'one_time' ||
        payment.planSnapshot.planType !== 'paid'
      ) {
        throw createHttpError(409, 'Only one-time credit purchases can be settled')
      }
      if (
        payment.amount.toString() !== payment.planSnapshot.priceAmount.toString() ||
        payment.currency !== payment.planSnapshot.currency
      ) {
        throw createHttpError(409, 'Payment transaction does not match its plan snapshot')
      }
      if (!Number.isSafeInteger(payment.planSnapshot.creditEntitlement) ||
        payment.planSnapshot.creditEntitlement <= 0
      ) {
        throw createHttpError(409, 'Payment plan has an invalid credit entitlement')
      }

      await grantCredits(
        payment.userId.toString(),
        payment.planSnapshot.creditEntitlement,
        'top_up',
        `payment:${payment._id.toString()}:credit-grant`,
        {
          relatedPaymentId: payment._id.toString(),
          session,
        },
      )

      const settledPayment = await PaymentTransaction.findOneAndUpdate(
        {
          _id: payment._id,
          status: { $in: ['pending', 'processing', 'failed', 'canceled'] },
          verificationStatus: 'verified',
        },
        {
          $set: {
            status: 'succeeded',
            completedAt: new Date(),
          },
        },
        { new: true, runValidators: true, session },
      )
      if (!settledPayment) {
        throw createHttpError(409, 'Payment transaction state changed during settlement')
      }

      return settledPayment
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const settledPayment = await PaymentTransaction.findOne({
        _id: paymentId,
        status: 'succeeded',
      })
      if (settledPayment) return settledPayment
    }
    throw error
  }
}
