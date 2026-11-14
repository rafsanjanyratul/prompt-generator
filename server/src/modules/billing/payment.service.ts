import { randomBytes } from 'node:crypto'
import { Types, type HydratedDocument } from 'mongoose'

import { PaymentTransaction, type PaymentTransactionFields } from './payment-transaction.model.js'
import { capturePlanSnapshot } from './plan.service.js'
import { type PlanFields } from './plan.model.js'
import { Subscription, type SubscriptionFields } from './subscription.model.js'
import {
  assertSslCommerzConfigured,
  getSslCommerzMode,
  initializeSslCommerzCheckout,
  validateSslCommerzTransaction,
  type SslCommerzMode,
  type SslCommerzValidation,
} from './sslcommerz.adapter.js'
import { settleVerifiedCreditPaymentWithSubscription } from './payment-settlement.service.js'

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

type SslCommerzCustomer = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

type SslCommerzCallbacks = {
  successUrl: string
  failUrl: string
  cancelUrl: string
  ipnUrl: string
}

const currentMode = (): SslCommerzMode => getSslCommerzMode()

export async function initiateSslCommerzPayment(
  userId: string,
  planId: string,
  plan: PlanFields,
  customer: SslCommerzCustomer,
  callbacks: SslCommerzCallbacks,
) {
  const userObjectId = toObjectId(userId)
  const planObjectId = toObjectId(planId)

  if (plan.planType !== 'paid' || plan.purchaseType !== 'one_time') {
    throw createHttpError(400, 'Only paid one-time plans can be purchased')
  }

  assertSslCommerzConfigured()
  const mode = currentMode()
  const merchantTransactionRef = `pm-${randomBytes(12).toString('hex')}`
  const payment = new PaymentTransaction({
    userId: userObjectId,
    planId: planObjectId,
    planSnapshot: await capturePlanSnapshot(plan),
    amount: plan.priceAmount,
    currency: plan.currency,
    provider: 'sslcommerz',
    mode,
    merchantTransactionRef,
    status: 'pending',
    verificationStatus: 'pending',
  })

  await payment.save()

  const checkout = await initializeSslCommerzCheckout({
    mode,
    amount: payment.amount.toString(),
    currency: payment.currency,
    transactionId: merchantTransactionRef,
    productName: `PromptMuse ${payment.planSnapshot.name} credits`,
    customer,
    callbacks,
  })

  payment.providerSessionRef = checkout.sessionKey
  await payment.save()

  return { payment, checkoutUrl: checkout.checkoutUrl }
}

const amountInMinorUnits = (value: string): bigint | null => {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value)
  if (!match) return null
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'))
}

const assertVerifiedTransactionMatches = (
  payment: HydratedDocument<PaymentTransactionFields>,
  validation: SslCommerzValidation,
  validationId: string,
) => {
  const expectedAmount = amountInMinorUnits(payment.amount.toString())
  const verifiedAmount = amountInMinorUnits(validation.currencyAmount)

  if (
    !expectedAmount ||
    !verifiedAmount ||
    expectedAmount !== verifiedAmount ||
    validation.transactionId !== payment.merchantTransactionRef ||
    validation.validationId !== validationId ||
    validation.currencyType !== payment.currency ||
    payment.mode !== currentMode()
  ) {
    throw createHttpError(409, 'Payment validation did not match the pending transaction')
  }
}

const findSslCommerzPayment = async (transactionId: string) => {
  const payment = await PaymentTransaction.findOne({
    provider: 'sslcommerz',
    merchantTransactionRef: transactionId,
  })

  if (!payment) {
    throw createHttpError(404, 'Payment transaction not found')
  }

  return payment
}

const setVerifiedPayment = async (
  payment: HydratedDocument<PaymentTransactionFields>,
  validation: SslCommerzValidation,
) => {
  if (payment.status === 'succeeded') return payment

  const verifiedPayment = await PaymentTransaction.findOneAndUpdate(
    {
      _id: payment._id,
      provider: 'sslcommerz',
      status: { $in: ['pending', 'processing', 'failed', 'canceled'] },
    },
    {
      $set: {
        status: 'processing',
        verificationStatus: 'verified',
        providerTransactionRef: validation.bankTransactionId || validation.validationId,
        verificationMetadata: {
          checkedAt: new Date(),
          verifiedAt: new Date(),
          responseCode: validation.status,
        },
      },
    },
    { new: true, runValidators: true },
  )

  if (verifiedPayment) return verifiedPayment

  const currentPayment = await PaymentTransaction.findById(payment._id)
  if (currentPayment?.status === 'succeeded') return currentPayment
  throw createHttpError(409, 'Payment transaction state changed during verification')
}

const setVerifiedFailure = async (
  payment: HydratedDocument<PaymentTransactionFields>,
  validation: SslCommerzValidation,
) => {
  await PaymentTransaction.findOneAndUpdate(
    {
      _id: payment._id,
      provider: 'sslcommerz',
      status: { $in: ['pending', 'processing'] },
      verificationStatus: 'pending',
    },
    {
      $set: {
        status: 'failed',
        verificationStatus: 'failed',
        failedAt: new Date(),
        verificationMetadata: {
          checkedAt: new Date(),
          responseCode: validation.status,
        },
      },
    },
    { runValidators: true },
  )
}

export async function processSslCommerzNotification(input: {
  transactionId: string
  validationId: string
}) {
  const payment = await findSslCommerzPayment(input.transactionId)
  if (payment.mode !== 'sandbox' && payment.mode !== 'live') {
    throw createHttpError(409, 'Payment transaction has an invalid provider mode')
  }
  const validation = await validateSslCommerzTransaction({
    mode: payment.mode,
    validationId: input.validationId,
  })

  assertVerifiedTransactionMatches(payment, validation, input.validationId)

  if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
    if (!validation.cardType) {
      throw createHttpError(409, 'Payment validation did not include a payment mode')
    }

    const verifiedPayment = await setVerifiedPayment(payment, validation)
    if (verifiedPayment.status === 'succeeded') {
      return { payment: verifiedPayment, subscription: await Subscription.findOne({ relatedPaymentId: payment._id }) }
    }

    return settleVerifiedCreditPaymentWithSubscription(payment._id.toString())
  }

  if (validation.status === 'FAILED') {
    await setVerifiedFailure(payment, validation)
    const failedPayment = await PaymentTransaction.findById(payment._id)
    if (!failedPayment) throw createHttpError(404, 'Payment transaction not found')
    return { payment: failedPayment, subscription: null }
  }

  if (validation.status === 'CANCELLED' || validation.status === 'CANCELED') {
    await recordSslCommerzCancellation(payment.merchantTransactionRef)
    const canceledPayment = await PaymentTransaction.findById(payment._id)
    if (!canceledPayment) throw createHttpError(404, 'Payment transaction not found')
    return { payment: canceledPayment, subscription: null }
  }

  throw createHttpError(409, 'Payment provider returned an unverified transaction status')
}

export async function recordSslCommerzCancellation(transactionId: string) {
  const payment = await findSslCommerzPayment(transactionId)
  if (payment.status === 'succeeded') return payment

  const canceledPayment = await PaymentTransaction.findOneAndUpdate(
    {
      _id: payment._id,
      status: { $in: ['pending', 'processing'] },
      verificationStatus: 'pending',
    },
    { $set: { status: 'canceled' } },
    { new: true, runValidators: true },
  )

  if (canceledPayment) return canceledPayment
  const currentPayment = await PaymentTransaction.findById(payment._id)
  if (!currentPayment) throw createHttpError(404, 'Payment transaction not found')
  return currentPayment
}

export async function recordSslCommerzFailure(transactionId: string) {
  const payment = await findSslCommerzPayment(transactionId)
  if (payment.status === 'succeeded') return payment

  const failedPayment = await PaymentTransaction.findOneAndUpdate(
    {
      _id: payment._id,
      status: { $in: ['pending', 'processing'] },
      verificationStatus: 'pending',
    },
    { $set: { status: 'failed', failedAt: new Date() } },
    { new: true, runValidators: true },
  )

  if (failedPayment) return failedPayment
  const currentPayment = await PaymentTransaction.findById(payment._id)
  if (!currentPayment) throw createHttpError(404, 'Payment transaction not found')
  return currentPayment
}

export async function getUserPaymentStatus(userId: string, paymentId: string): Promise<{
  payment: HydratedDocument<PaymentTransactionFields>
  subscription: HydratedDocument<SubscriptionFields> | null
}> {
  const userObjectId = toObjectId(userId)
  const paymentObjectId = toObjectId(paymentId)
  const payment = await PaymentTransaction.findOne({ _id: paymentObjectId, userId: userObjectId })

  if (!payment) throw createHttpError(404, 'Payment transaction not found')

  const subscription = await Subscription.findOne({ relatedPaymentId: payment._id })
  return { payment, subscription }
}

export async function getUserPayments(userId: string, limit: number = 20) {
  const userObjectId = toObjectId(userId)
  return PaymentTransaction.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(limit)
}
