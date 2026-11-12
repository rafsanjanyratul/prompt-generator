import { Types } from 'mongoose'

import { CreditAccount } from './credit-account.model.js'
import { CreditLedger } from './credit-ledger.model.js'
import { AIUsage } from './ai-usage.model.js'

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

export async function getCreditBalance(userId: string) {
  const userObjectId = toObjectId(userId)

  const account = await CreditAccount.findOne({ userId: userObjectId })

  return {
    availableCredits: account?.availableCredits ?? 0,
    reservedCredits: account?.reservedCredits ?? 0,
    totalCredits: (account?.availableCredits ?? 0) + (account?.reservedCredits ?? 0),
  }
}

export async function getCreditHistory(userId: string, limit: number = 50) {
  const userObjectId = toObjectId(userId)

  const ledgers = await CreditLedger.find({ userId: userObjectId })
    .select('eventType amount idempotencyKey metadata createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return ledgers.map((ledger) => ({
    id: ledger._id.toString(),
    eventType: ledger.eventType,
    amount: ledger.amount,
    metadata: ledger.metadata,
    createdAt: ledger.createdAt,
  }))
}

export async function getAIUsageHistory(userId: string, limit: number = 50) {
  const userObjectId = toObjectId(userId)

  const usages = await AIUsage.find({ userId: userObjectId })
    .select('requestId modelId status reservedCredits consumedCredits createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return usages.map((usage) => ({
    id: usage._id.toString(),
    requestId: usage.requestId,
    modelId: usage.modelId,
    status: usage.status,
    reservedCredits: usage.reservedCredits,
    consumedCredits: usage.consumedCredits,
    createdAt: usage.createdAt,
  }))
}
