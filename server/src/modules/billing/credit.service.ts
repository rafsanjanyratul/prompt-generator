import mongoose, { Types, type ClientSession, type HydratedDocument } from 'mongoose'

import { AIUsage, type AIUsageFields } from './ai-usage.model.js'
import { CreditAccount, type CreditAccountFields } from './credit-account.model.js'
import { CreditLedger, type CreditLedgerFields } from './credit-ledger.model.js'
import { CreditLot, type CreditLotFields } from './credit-lot.model.js'

const grantTypes = ['free', 'subscription', 'top_up', 'admin'] as const
type GrantType = (typeof grantTypes)[number]

type LedgerSource = 'free_plan' | 'subscription' | 'top_up' | 'admin' | 'ai_usage' | 'system'
type GrantMetadata = {
  adminAdjustmentDirection?: 'credit' | 'debit'
}

export type GrantCreditsOptions = {
  expiresAt?: Date | null
  subscriptionId?: string | null
  relatedPaymentId?: string | null
  relatedSubscriptionId?: string | null
  metadata?: GrantMetadata
  session?: ClientSession
}

export type ReserveCreditsInput = {
  userId: string
  aiUsageId: string
  amount: number
  idempotencyKey: string
  reservationExpiresAt: Date
}

export type CaptureCreditsMetadata = {
  modelId: string
  providerResponseId?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

type GrantResult = {
  account: HydratedDocument<CreditAccountFields>
  ledger: HydratedDocument<CreditLedgerFields>
  lot: HydratedDocument<CreditLotFields>
}

type UsageResult = {
  account: HydratedDocument<CreditAccountFields>
  usage: HydratedDocument<AIUsageFields>
}

const createHttpError = (statusCode: number, message: string, code?: string) => {
  const error = new Error(message) as Error & { statusCode?: number; code?: string }
  error.statusCode = statusCode
  if (code) error.code = code
  return error
}

const toObjectId = (value: string, fieldName: string) => {
  if (!/^[\da-f]{24}$/i.test(value)) {
    throw createHttpError(400, `${fieldName} must be a valid ID`)
  }
  return new Types.ObjectId(value)
}

const validatePositiveInteger = (amount: number) => {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw createHttpError(400, 'Credit amount must be a positive integer')
  }
}

const validateIdempotencyKey = (key: string) => {
  if (typeof key !== 'string' || key.trim().length === 0 || key.trim().length > 200) {
    throw createHttpError(400, 'A valid idempotency key is required')
  }
  return key.trim()
}

const validateDate = (value: Date, fieldName: string) => {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`)
  }
}

const ledgerSourceForGrant: Record<GrantType, LedgerSource> = {
  free: 'free_plan',
  subscription: 'subscription',
  top_up: 'top_up',
  admin: 'admin',
}

const isDuplicateKeyError = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 11000

const isAccountUserDuplicate = (error: unknown) => {
  if (
    !(error instanceof Error) ||
    !('code' in error) ||
    error.code !== 11000 ||
    !('keyPattern' in error)
  ) {
    return false
  }

  const keyPattern = error.keyPattern
  return typeof keyPattern === 'object' && keyPattern !== null && 'userId' in keyPattern
}

export async function withBillingTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(() => operation(session), {
      readPreference: 'primary',
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    })
  } finally {
    await session.endSession()
  }
}

function assertGrantMatches(
  ledger: HydratedDocument<CreditLedgerFields>,
  lot: HydratedDocument<CreditLotFields> | null,
  input: {
    userId: Types.ObjectId
    amount: number
    grantType: GrantType
    expiresAt: Date | null
    subscriptionId: Types.ObjectId | null
    relatedPaymentId: Types.ObjectId | null
    relatedSubscriptionId: Types.ObjectId | null
    adminAdjustmentDirection?: 'credit' | 'debit'
  },
) {
  const metadata = ledger.metadata
  const sameRelatedId = (left: Types.ObjectId | null | undefined, right: Types.ObjectId | null) =>
    left?.toString() === right?.toString()
  const sameExpiry =
    (lot?.expiresAt == null && input.expiresAt == null) ||
    (lot?.expiresAt instanceof Date &&
      input.expiresAt instanceof Date &&
      lot.expiresAt.getTime() === input.expiresAt.getTime())

  if (
    ledger.eventType !== 'grant' ||
    ledger.amount !== input.amount ||
    ledger.userId.toString() !== input.userId.toString() ||
    metadata?.source !== ledgerSourceForGrant[input.grantType] ||
    metadata?.adminAdjustmentDirection !== input.adminAdjustmentDirection ||
    !sameRelatedId(ledger.relatedPaymentId, input.relatedPaymentId) ||
    !sameRelatedId(ledger.relatedSubscriptionId, input.relatedSubscriptionId) ||
    !lot ||
    lot.grantType !== input.grantType ||
    lot.originalCredits !== input.amount ||
    lot.userId.toString() !== input.userId.toString() ||
    !sameExpiry ||
    !sameRelatedId(lot.subscriptionId, input.subscriptionId)
  ) {
    throw createHttpError(409, 'Idempotency key was already used for a different credit grant')
  }
}

async function getExistingGrant(
  userId: Types.ObjectId,
  idempotencyKey: string,
  expected: Parameters<typeof assertGrantMatches>[2],
  session?: ClientSession,
): Promise<GrantResult | null> {
  const ledgerQuery = CreditLedger.findOne({ userId, idempotencyKey })
  if (session) ledgerQuery.session(session)
  const ledger = await ledgerQuery
  if (!ledger) return null

  const lotQuery = CreditLot.findOne({ sourceLedgerId: ledger._id })
  if (session) lotQuery.session(session)
  const lot = await lotQuery
  assertGrantMatches(ledger, lot, expected)

  const accountQuery = CreditAccount.findOne({ userId })
  if (session) accountQuery.session(session)
  const account = await accountQuery
  if (!account || !lot) {
    throw createHttpError(500, 'Existing credit grant is missing its account or credit lot')
  }

  return { account, ledger, lot }
}

export async function grantCredits(
  userId: string,
  amount: number,
  grantType: GrantType,
  idempotencyKey: string,
  options: GrantCreditsOptions = {},
): Promise<GrantResult> {
  validatePositiveInteger(amount)
  if (!grantTypes.includes(grantType)) {
    throw createHttpError(400, 'Invalid credit grant type')
  }

  const userObjectId = toObjectId(userId, 'User ID')
  const key = validateIdempotencyKey(idempotencyKey)
  const expiresAt = options.expiresAt ?? null
  if (expiresAt) validateDate(expiresAt, 'Credit expiration')

  const subscriptionId = options.subscriptionId
    ? toObjectId(options.subscriptionId, 'Subscription ID')
    : null
  const relatedPaymentId = options.relatedPaymentId
    ? toObjectId(options.relatedPaymentId, 'Payment ID')
    : null
  const relatedSubscriptionId = options.relatedSubscriptionId
    ? toObjectId(options.relatedSubscriptionId, 'Related subscription ID')
    : subscriptionId
  const adminAdjustmentDirection = options.metadata?.adminAdjustmentDirection

  if (
    adminAdjustmentDirection !== undefined &&
    (grantType !== 'admin' || adminAdjustmentDirection !== 'credit')
  ) {
    throw createHttpError(400, 'Credit grants cannot represent debit adjustments')
  }

  const expected = {
    userId: userObjectId,
    amount,
    grantType,
    expiresAt,
    subscriptionId,
    relatedPaymentId,
    relatedSubscriptionId,
    adminAdjustmentDirection,
  }

  if (options.session && !options.session.inTransaction()) {
    throw createHttpError(500, 'Credit grant session must have an active transaction')
  }

  const existing = await getExistingGrant(userObjectId, key, expected, options.session)
  if (existing) return existing

  const createGrant = async (session: ClientSession): Promise<GrantResult> => {
    const existingLedger = await CreditLedger.findOne({ userId: userObjectId, idempotencyKey: key })
      .session(session)
    if (existingLedger) {
      const existingLot = await CreditLot.findOne({ sourceLedgerId: existingLedger._id }).session(session)
      assertGrantMatches(existingLedger, existingLot, expected)
      const account = await CreditAccount.findOne({ userId: userObjectId }).session(session)
      if (!account || !existingLot) {
        throw createHttpError(500, 'Existing credit grant is missing its account or credit lot')
      }
      return { account, ledger: existingLedger, lot: existingLot }
    }

    const [ledger] = await CreditLedger.create(
      [
        {
          userId: userObjectId,
          eventType: 'grant',
          amount,
          idempotencyKey: key,
          relatedPaymentId,
          relatedSubscriptionId,
          metadata: {
            source: ledgerSourceForGrant[grantType],
            ...(adminAdjustmentDirection ? { adminAdjustmentDirection } : {}),
          },
        },
      ],
      { session },
    )

    const [lot] = await CreditLot.create(
      [
        {
          userId: userObjectId,
          sourceLedgerId: ledger._id,
          grantType,
          originalCredits: amount,
          availableCredits: amount,
          reservedCredits: 0,
          expiresAt,
          subscriptionId,
        },
      ],
      { session },
    )

    const account = await CreditAccount.findOneAndUpdate(
      { userId: userObjectId },
      { $inc: { availableCredits: amount } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        session,
      },
    )

    if (!account) throw createHttpError(500, 'Unable to update credit account')
    return { account, ledger, lot }
  }

  if (options.session) {
    return createGrant(options.session)
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await withBillingTransaction(createGrant)
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const duplicateGrant = await getExistingGrant(userObjectId, key, expected)
        if (duplicateGrant) return duplicateGrant
        if (isAccountUserDuplicate(error) && attempt < 2) continue
        throw createHttpError(409, 'Credit grant conflicts with an existing transaction')
      }
      throw error
    }
  }

  throw createHttpError(409, 'Unable to create credit grant after concurrent account creation')
}

type LotAllocation = {
  lotId: Types.ObjectId
  credits: number
}

const getEligibleLots = async (userId: Types.ObjectId, now: Date, session: ClientSession) => {
  const datedLots = await CreditLot.find({
    userId,
    availableCredits: { $gt: 0 },
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: 1, createdAt: 1, _id: 1 })
    .session(session)

  const nonExpiringLots = await CreditLot.find({
    userId,
    availableCredits: { $gt: 0 },
    expiresAt: null,
  })
    .sort({ createdAt: 1, _id: 1 })
    .session(session)

  return [...datedLots, ...nonExpiringLots]
}

export async function reserveCredits(input: ReserveCreditsInput): Promise<UsageResult> {
  validatePositiveInteger(input.amount)
  const userId = toObjectId(input.userId, 'User ID')
  const aiUsageId = toObjectId(input.aiUsageId, 'AI usage ID')
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  validateDate(input.reservationExpiresAt, 'Reservation expiry')

  const now = new Date()
  if (input.reservationExpiresAt.getTime() <= now.getTime()) {
    throw createHttpError(400, 'Reservation expiry must be in the future')
  }

  try {
    return await withBillingTransaction(async (session) => {
      const usage = await AIUsage.findOne({ _id: aiUsageId, userId }).session(session)
      if (!usage) throw createHttpError(404, 'AI usage record was not found')

      const existingLedger = await CreditLedger.findOne({ userId, idempotencyKey }).session(session)
      if (existingLedger) {
        if (
          existingLedger.eventType !== 'reserve' ||
          existingLedger.relatedUsageId?.toString() !== aiUsageId.toString() ||
          existingLedger.amount !== input.amount
        ) {
          throw createHttpError(409, 'Idempotency key was already used for a different operation')
        }

        if (
          usage.status !== 'pending' ||
          usage.reservedCredits !== input.amount ||
          !usage.reservationExpiresAt ||
          usage.reservationExpiresAt.getTime() <= Date.now() ||
          usage.reservationAllocations.reduce((total, allocation) => total + allocation.credits, 0) !==
            input.amount
        ) {
          throw createHttpError(409, 'Existing reservation is no longer active')
        }

        const account = await CreditAccount.findOne({ userId }).session(session)
        if (!account) throw createHttpError(500, 'Credit account was not found for an active reservation')
        return { account, usage }
      }

      if (
        usage.status !== 'pending' ||
        usage.reservedCredits !== 0 ||
        usage.reservationAllocations.length > 0 ||
        usage.reservationExpiresAt
      ) {
        throw createHttpError(409, 'AI usage record is not eligible for a credit reservation')
      }

      const lots = await getEligibleLots(userId, now, session)
      let remaining = input.amount
      const allocations: LotAllocation[] = []

      for (const lot of lots) {
        if (remaining === 0) break
        const credits = Math.min(remaining, lot.availableCredits)
        allocations.push({ lotId: lot._id, credits })
        remaining -= credits
      }

      if (remaining > 0) throw createHttpError(402, 'Insufficient available credits')
      if (input.reservationExpiresAt.getTime() <= Date.now()) {
        throw createHttpError(400, 'Reservation expiry must be in the future')
      }

      const account = await CreditAccount.findOneAndUpdate(
        { userId, availableCredits: { $gte: input.amount } },
        {
          $inc: {
            availableCredits: -input.amount,
            reservedCredits: input.amount,
          },
        },
        { new: true, runValidators: true, session },
      )
      if (!account) throw createHttpError(402, 'Insufficient available credits')

      for (const allocation of allocations) {
        const updatedLot = await CreditLot.updateOne(
          {
            _id: allocation.lotId,
            userId,
            availableCredits: { $gte: allocation.credits },
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
          },
          {
            $inc: {
              availableCredits: -allocation.credits,
              reservedCredits: allocation.credits,
            },
          },
          { runValidators: true, session },
        )
        if (updatedLot.matchedCount !== 1) {
          throw createHttpError(409, 'Credit lot changed while reserving credits')
        }
      }

      const updatedUsage = await AIUsage.findOneAndUpdate(
        {
          _id: aiUsageId,
          userId,
          status: 'pending',
          reservedCredits: 0,
          reservationAllocations: { $size: 0 },
          reservationExpiresAt: null,
        },
        {
          $set: {
            reservedCredits: input.amount,
            reservationAllocations: allocations,
            reservationExpiresAt: input.reservationExpiresAt,
          },
        },
        { new: true, runValidators: true, session },
      )
      if (!updatedUsage) throw createHttpError(409, 'AI usage record is not eligible for reservation')

      await CreditLedger.create(
        [
          {
            userId,
            eventType: 'reserve',
            amount: input.amount,
            idempotencyKey,
            relatedUsageId: aiUsageId,
            metadata: { source: 'ai_usage' },
          },
        ],
        { session },
      )

      return { account, usage: updatedUsage }
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createHttpError(409, 'Credit reservation conflicts with an existing operation')
    }
    throw error
  }
}

async function getActiveReservation(
  userId: Types.ObjectId,
  aiUsageId: Types.ObjectId,
  session: ClientSession,
  allowConfirmedUnknown = false,
) {
  const usage = await AIUsage.findOne({ _id: aiUsageId, userId }).session(session)
  if (!usage) throw createHttpError(404, 'AI usage record was not found')

  const amount = usage.reservedCredits
  const allocationTotal = usage.reservationAllocations.reduce(
    (total, allocation) => total + allocation.credits,
    0,
  )
  const distinctLots = new Set(
    usage.reservationAllocations.map((allocation) => allocation.lotId.toString()),
  )
  const isPending = usage.status === 'pending'
  const isConfirmedUnknown =
    allowConfirmedUnknown &&
    usage.status === 'unknown' &&
    usage.completedAt !== null &&
    usage.reservationExpiresAt !== null
  if (
    (!isPending && !isConfirmedUnknown) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    allocationTotal !== amount ||
    distinctLots.size !== usage.reservationAllocations.length ||
    !usage.reservationExpiresAt
  ) {
    throw createHttpError(409, 'AI usage record does not have an active credit reservation')
  }

  return { usage, amount }
}

async function getCompletedUsageResult(
  userId: Types.ObjectId,
  aiUsageId: Types.ObjectId,
  eventType: 'capture' | 'release',
  expectedStatus: 'succeeded' | 'failed' | 'unknown',
  session: ClientSession,
): Promise<UsageResult | null> {
  const usage = await AIUsage.findOne({ _id: aiUsageId, userId }).session(session)
  if (!usage) throw createHttpError(404, 'AI usage record was not found')

  const idempotencyKey = `${eventType}:${aiUsageId.toString()}`
  let ledger = await CreditLedger.findOne({ userId, idempotencyKey, eventType }).session(session)
  if (eventType === 'release' && !ledger) {
    ledger = await CreditLedger.findOne({
      userId,
      idempotencyKey: `expiry:${aiUsageId.toString()}`,
      eventType: 'expiry',
    }).session(session)
  }
  if (usage.status !== expectedStatus || !ledger) return null

  const account = await CreditAccount.findOne({ userId }).session(session)
  if (!account) throw createHttpError(500, 'Credit account was not found')
  return { account, usage }
}

export async function captureCredits(
  userId: string,
  aiUsageId: string,
  metadata?: CaptureCreditsMetadata,
): Promise<UsageResult> {
  const userObjectId = toObjectId(userId, 'User ID')
  const usageObjectId = toObjectId(aiUsageId, 'AI usage ID')

  return withBillingTransaction(async (session) => {
    const alreadyCaptured = await getCompletedUsageResult(
      userObjectId,
      usageObjectId,
      'capture',
      'succeeded',
      session,
    )
    if (alreadyCaptured) return alreadyCaptured

    const { usage, amount } = await getActiveReservation(
      userObjectId,
      usageObjectId,
      session,
      true,
    )
    if (usage.status === 'unknown' && !metadata) {
      throw createHttpError(409, 'Unknown usage requires confirmed provider metadata before capture')
    }
    if (
      usage.status === 'pending' &&
      usage.reservationExpiresAt!.getTime() <= Date.now()
    ) {
      throw createHttpError(409, 'Credit reservation has expired')
    }

    // Unknown usages may be captured after the lease deadline only while the
    // reserved account and lot balances still prove that the reservation is held.
    const account = await CreditAccount.findOneAndUpdate(
      { userId: userObjectId, reservedCredits: { $gte: amount } },
      { $inc: { reservedCredits: -amount } },
      { new: true, runValidators: true, session },
    )
    if (!account) throw createHttpError(409, 'Reserved credit balance is inconsistent')

    for (const allocation of usage.reservationAllocations) {
      const result = await CreditLot.updateOne(
        {
          _id: allocation.lotId,
          userId: userObjectId,
          reservedCredits: { $gte: allocation.credits },
        },
        { $inc: { reservedCredits: -allocation.credits } },
        { runValidators: true, session },
      )
      if (result.matchedCount !== 1) {
        throw createHttpError(409, 'Reserved credit lot balance is inconsistent')
      }
    }

    const idempotencyKey = `capture:${usageObjectId.toString()}`
    await CreditLedger.create(
      [
        {
          userId: userObjectId,
          eventType: 'capture',
          amount,
          idempotencyKey,
          relatedUsageId: usageObjectId,
          metadata: { source: 'ai_usage' },
        },
      ],
      { session },
    )

    const updatedUsage = await AIUsage.findOneAndUpdate(
      {
        _id: usageObjectId,
        userId: userObjectId,
        status: { $in: ['pending', 'unknown'] },
        reservedCredits: amount,
      },
      {
        $set: {
          status: 'succeeded',
          consumedCredits: amount,
          completedAt: new Date(),
          reservationExpiresAt: null,
          ...(metadata
            ? {
                modelId: metadata.modelId,
                ...(metadata.providerResponseId ? { providerResponseId: metadata.providerResponseId } : {}),
                ...(metadata.inputTokens !== undefined ? { inputTokens: metadata.inputTokens } : {}),
                ...(metadata.outputTokens !== undefined ? { outputTokens: metadata.outputTokens } : {}),
                ...(metadata.totalTokens !== undefined ? { totalTokens: metadata.totalTokens } : {}),
              }
            : {}),
        },
      },
      { new: true, runValidators: true, session },
    )
    if (!updatedUsage) throw createHttpError(409, 'AI usage state changed during capture')

    return { account, usage: updatedUsage }
  })
}

export async function markUsageUnknown(
  userId: string,
  aiUsageId: string,
  metadata?: CaptureCreditsMetadata,
): Promise<UsageResult> {
  const userObjectId = toObjectId(userId, 'User ID')
  const usageObjectId = toObjectId(aiUsageId, 'AI usage ID')

  return withBillingTransaction(async (session) => {
    const { usage, amount } = await getActiveReservation(
      userObjectId,
      usageObjectId,
      session,
      true,
    )
    const account = await CreditAccount.findOne({
      userId: userObjectId,
      reservedCredits: { $gte: amount },
    }).session(session)
    if (!account) throw createHttpError(409, 'Reserved credit balance is inconsistent')

    for (const allocation of usage.reservationAllocations) {
      const lot = await CreditLot.findOne({
        _id: allocation.lotId,
        userId: userObjectId,
        reservedCredits: { $gte: allocation.credits },
      }).session(session)
      if (!lot) throw createHttpError(409, 'Reserved credit lot balance is inconsistent')
    }

    if (usage.status === 'unknown' && !metadata) return { account, usage }

    const updatedUsage = await AIUsage.findOneAndUpdate(
      {
        _id: usageObjectId,
        userId: userObjectId,
        status: usage.status,
        reservedCredits: amount,
        reservationExpiresAt: { $ne: null },
      },
      {
        $set: {
          status: 'unknown',
          ...(usage.status === 'pending' ? { completedAt: new Date() } : {}),
          ...(metadata
            ? {
                modelId: metadata.modelId,
                ...(metadata.providerResponseId ? { providerResponseId: metadata.providerResponseId } : {}),
                ...(metadata.inputTokens !== undefined ? { inputTokens: metadata.inputTokens } : {}),
                ...(metadata.outputTokens !== undefined ? { outputTokens: metadata.outputTokens } : {}),
                ...(metadata.totalTokens !== undefined ? { totalTokens: metadata.totalTokens } : {}),
              }
            : {}),
        },
      },
      { new: true, runValidators: true, session },
    )
    if (!updatedUsage) throw createHttpError(409, 'AI usage state changed while marking it unknown')

    return { account, usage: updatedUsage }
  })
}

export async function releaseCredits(
  userId: string,
  aiUsageId: string,
): Promise<UsageResult> {
  const userObjectId = toObjectId(userId, 'User ID')
  const usageObjectId = toObjectId(aiUsageId, 'AI usage ID')

  return withBillingTransaction(async (session) => {
    const alreadyReleased = await getCompletedUsageResult(
      userObjectId,
      usageObjectId,
      'release',
      'failed',
      session,
    )
    if (alreadyReleased) return alreadyReleased

    const { usage, amount } = await getActiveReservation(userObjectId, usageObjectId, session)
    const now = new Date()

    let releasedCredits = 0
    let expiredCredits = 0
    let expiredAvailableCredits = 0

    for (const allocation of usage.reservationAllocations) {
      const lot = await CreditLot.findOne({
        _id: allocation.lotId,
        userId: userObjectId,
        reservedCredits: { $gte: allocation.credits },
      }).session(session)
      if (!lot) throw createHttpError(409, 'Reserved credit lot balance is inconsistent')

      const isExpired = lot.expiresAt != null && lot.expiresAt.getTime() <= now.getTime()
      const restored = isExpired ? 0 : allocation.credits
      const expiredAvailable = isExpired ? lot.availableCredits : 0
      const result = await CreditLot.updateOne(
        {
          _id: lot._id,
          userId: userObjectId,
          reservedCredits: { $gte: allocation.credits },
          availableCredits: lot.availableCredits,
        },
        {
          $inc: {
            reservedCredits: -allocation.credits,
            availableCredits: isExpired ? -expiredAvailable : restored,
          },
        },
        { runValidators: true, session },
      )
      if (result.matchedCount !== 1) {
        throw createHttpError(409, 'Reserved credit lot changed while releasing credits')
      }

      if (isExpired) {
        expiredCredits += allocation.credits + expiredAvailable
        expiredAvailableCredits += expiredAvailable
      }
      else releasedCredits += allocation.credits
    }

    const account = await CreditAccount.findOneAndUpdate(
      {
        userId: userObjectId,
        reservedCredits: { $gte: amount },
        availableCredits: { $gte: expiredAvailableCredits },
      },
      {
        $inc: {
          reservedCredits: -amount,
          availableCredits: releasedCredits - expiredAvailableCredits,
        },
      },
      { new: true, runValidators: true, session },
    )
    if (!account) throw createHttpError(409, 'Reserved credit balance is inconsistent')

    if (releasedCredits > 0) {
      await CreditLedger.create(
        [
          {
            userId: userObjectId,
            eventType: 'release',
            amount: releasedCredits,
            idempotencyKey: `release:${usageObjectId.toString()}`,
            relatedUsageId: usageObjectId,
            metadata: { source: 'ai_usage' },
          },
        ],
        { session },
      )
    }

    if (expiredCredits > 0) {
      await CreditLedger.create(
        [
          {
            userId: userObjectId,
            eventType: 'expiry',
            amount: expiredCredits,
            idempotencyKey: `expiry:${usageObjectId.toString()}`,
            relatedUsageId: usageObjectId,
            metadata: { source: 'ai_usage' },
          },
        ],
        { session },
      )
    }

    const updatedUsage = await AIUsage.findOneAndUpdate(
      {
        _id: usageObjectId,
        userId: userObjectId,
        status: 'pending',
        reservedCredits: amount,
      },
      {
        $set: {
          status: 'failed',
          completedAt: now,
          reservationExpiresAt: null,
        },
      },
      { new: true, runValidators: true, session },
    )
    if (!updatedUsage) throw createHttpError(409, 'AI usage state changed during release')

    return { account, usage: updatedUsage }
  })
}
