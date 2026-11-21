import mongoose, { Types, type HydratedDocument } from 'mongoose'

import { Plan, type PlanFields } from './plan.model.js'
import { Subscription, type SubscriptionFields } from './subscription.model.js'
import { PaymentTransaction } from './payment-transaction.model.js'
import { grantCredits } from './credit.service.js'
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
    throw createHttpError(400, 'User ID must be a valid MongoDB ID')
  }
  return new Types.ObjectId(value)
}

export async function getCurrentSubscription(
  userId: string,
): Promise<HydratedDocument<SubscriptionFields> | null> {
  const userObjectId = toObjectId(userId)
  const sub = await Subscription.findOne({
    userId: userObjectId,
    status: 'active',
  }).populate('planId', 'name description creditEntitlement')

  return sub
}

export async function activateFreeSubscription(
  userId: string,
  freePlanId: string,
): Promise<HydratedDocument<SubscriptionFields>> {
  const userObjectId = toObjectId(userId)
  const planId = toObjectId(freePlanId)

  const plan = await Plan.findById(planId)
  if (!plan) {
    throw createHttpError(404, 'Free plan not found')
  }

  if (plan.planType !== 'free' || plan.purchaseType !== 'free') {
    throw createHttpError(400, 'Selected plan is not a free plan')
  }

  const existing = await Subscription.findOne({
    userId: userObjectId,
    status: 'active',
  })

  if (existing && existing.status === 'active') {
    // For existing active Free Plan subscriptions, ensure the one-time
    // free-plan credit grant has been made. grantCredits is idempotent
    // via its unique (userId, idempotencyKey) ledger index, so repeated
    // calls will not create duplicate grants.
    if (existing.planSnapshot.planType === 'free') {
      await grantCredits(
        userId,
        plan.creditEntitlement,
        'free',
        `free-plan:${userId}:credit-grant`,
        {
          subscriptionId: existing._id.toString(),
        },
      )
    }
    return existing
  }

  const now = new Date()
  const subscription = new Subscription({
    userId: userObjectId,
    planId,
    planSnapshot: await capturePlanSnapshot(plan),
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: null,
    autoRenew: false,
    nextBillingAt: null,
  })

  const session = await mongoose.startSession()
  await session.startTransaction()

  try {
    await subscription.save({ session })

    // Grant one-time free plan credits for the newly created subscription.
    // The same session is passed so grantCredits() participates in this
    // transaction — no nested transaction is created.
    await grantCredits(
      userId,
      plan.creditEntitlement,
      'free',
      `free-plan:${userId}:credit-grant`,
      {
        subscriptionId: subscription._id.toString(),
        session,
      },
    )

    await session.commitTransaction()
    return subscription
  } catch (error) {
    // Abort the transaction so a failed credit grant does not leave an
    // active subscription with 0 credits.
    await session.abortTransaction()

    // Handle race condition: another concurrent request may have created the
    // active subscription between the existence check and the save. Find the
    // existing subscription and ensure credits are granted idempotently.
    if (isDuplicateKeyError(error)) {
      const duplicateSubscription = await Subscription.findOne({
        userId: userObjectId,
        status: 'active',
      })
      if (duplicateSubscription && duplicateSubscription.planSnapshot.planType === 'free') {
        await grantCredits(
          userId,
          plan.creditEntitlement,
          'free',
          `free-plan:${userId}:credit-grant`,
          {
            subscriptionId: duplicateSubscription._id.toString(),
          },
        )
        return duplicateSubscription
      }
    }
    throw error
  } finally {
    await session.endSession()
  }
}

export async function activatePaidSubscription(
  userId: string,
  planId: string,
  paymentId: string,
): Promise<HydratedDocument<SubscriptionFields>> {
  const userObjectId = toObjectId(userId)
  const planObjectId = toObjectId(planId)
  const paymentObjectId = toObjectId(paymentId)

  const plan = await Plan.findById(planObjectId)
  if (!plan) {
    throw createHttpError(404, 'Plan not found')
  }

  if (plan.planType !== 'paid' || plan.purchaseType !== 'one_time') {
    throw createHttpError(400, 'Selected plan is not a paid one-time plan')
  }

  // CRITICAL: Verify payment is actually settled and belongs to this user
  const payment = await PaymentTransaction.findById(paymentObjectId)
  if (!payment) {
    throw createHttpError(404, 'Payment transaction not found')
  }

  if (payment.userId.toString() !== userId) {
    throw createHttpError(403, 'Payment does not belong to this user')
  }

  if (payment.status !== 'succeeded' || payment.verificationStatus !== 'verified') {
    throw createHttpError(409, 'Payment has not been settled yet')
  }

  const existing = await Subscription.findOne({
    userId: userObjectId,
    status: 'active',
  })

  if (existing && existing.status === 'active') {
    throw createHttpError(409, 'User already has an active subscription')
  }

  const now = new Date()
  const subscription = new Subscription({
    userId: userObjectId,
    planId: planObjectId,
    planSnapshot: await capturePlanSnapshot(plan),
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: null,
    autoRenew: false,
    nextBillingAt: null,
    relatedPaymentId: paymentObjectId,
  })

  await subscription.save()
  return subscription
}

export async function getSubscriptionById(subscriptionId: string): Promise<HydratedDocument<SubscriptionFields> | null> {
  const subId = toObjectId(subscriptionId)
  return Subscription.findById(subId)
}
