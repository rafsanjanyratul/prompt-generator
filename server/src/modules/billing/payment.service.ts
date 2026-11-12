import { Types, type HydratedDocument } from 'mongoose'

import { PaymentTransaction, type PaymentTransactionFields } from './payment-transaction.model.js'
import { capturePlanSnapshot } from './plan.service.js'
import { type PlanFields } from './plan.model.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const toObjectId = (value: string) => {
  if (!/^[\da-f]{24}$/i.test(value)) {
    throw createHttpError(400, 'User ID must be a valid MongoDB ID')
  }
  return new Types.ObjectId(value)
}

export async function initiateDemoPayment(
  userId: string,
  planId: string,
  plan: PlanFields,
): Promise<HydratedDocument<PaymentTransactionFields>> {
  const userObjectId = toObjectId(userId)
  const planObjectId = toObjectId(planId)

  if (plan.planType !== 'paid') {
    throw createHttpError(400, 'Only paid plans can be purchased')
  }

  const merchantRef = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const payment = new PaymentTransaction({
    userId: userObjectId,
    planId: planObjectId,
    planSnapshot: await capturePlanSnapshot(plan),
    amount: plan.priceAmount,
    currency: plan.currency,
    provider: 'demo',
    mode: 'demo',
    merchantTransactionRef: merchantRef,
    status: 'pending',
    verificationStatus: 'pending',
  })

  await payment.save()
  return payment
}

export async function getPaymentById(paymentId: string): Promise<HydratedDocument<PaymentTransactionFields> | null> {
  const objId = toObjectId(paymentId)
  return PaymentTransaction.findById(objId)
}

export async function getUserPayments(userId: string, limit: number = 20) {
  const userObjectId = toObjectId(userId)
  return PaymentTransaction.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(limit)
}

export async function verifyDemoPayment(
  paymentId: string,
  shouldSucceed: boolean = true,
): Promise<HydratedDocument<PaymentTransactionFields>> {
  const objId = toObjectId(paymentId)
  const payment = await PaymentTransaction.findById(objId)

  if (!payment) {
    throw createHttpError(404, 'Payment transaction not found')
  }

  if (payment.provider !== 'demo' || payment.mode !== 'demo') {
    throw createHttpError(400, 'Only demo payments can be verified here')
  }

  if (payment.verificationStatus !== 'pending') {
    throw createHttpError(409, 'Payment has already been verified')
  }

  const now = new Date()

  if (!shouldSucceed) {
    payment.verificationStatus = 'failed'
    payment.status = 'failed'
    payment.failedAt = now
  } else {
    payment.verificationStatus = 'verified'
    payment.verificationMetadata = {
      checkedAt: now,
      verifiedAt: now,
      responseCode: 'DEMO_SUCCESS',
    }
    payment.status = 'processing'
  }

  await payment.save()
  return payment
}
