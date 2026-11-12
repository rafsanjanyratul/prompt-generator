import { model, Schema, Types, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isInteger,
  message: 'Credit entitlement must be a non-negative integer',
}

const nonNegativeDecimal = {
  validator: (value: Types.Decimal128) => !value.toString().startsWith('-'),
  message: 'Amount must be non-negative',
}

const planSnapshotSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, lowercase: true, maxlength: 64 },
    version: { type: Number, required: true, min: 1 },
    planType: { type: String, enum: ['free', 'paid'], required: true },
    purchaseType: { type: String, enum: ['free', 'one_time', 'subscription'], required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    billingInterval: { type: String, enum: ['month', 'year'], default: null },
    priceAmount: { type: Schema.Types.Decimal128, required: true, validate: nonNegativeDecimal },
    currency: { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{3}$/ },
    creditEntitlement: { type: Number, required: true, min: 0, validate: nonNegativeInteger },
    creditExpirationPolicy: { type: String, enum: ['billing_period', 'never'], required: true },
  },
  {
    _id: false,
    strict: 'throw',
  },
)

planSnapshotSchema.pre('validate', function () {
  if (!this.purchaseType) {
    this.purchaseType =
      this.planType === 'free'
        ? 'free'
        : this.billingInterval
          ? 'subscription'
          : 'one_time'
  }
})

const verificationMetadataSchema = new Schema(
  {
    checkedAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    responseCode: { type: String, trim: true, maxlength: 64, default: null },
  },
  {
    _id: false,
    strict: 'throw',
  },
)

const paymentTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planSnapshot: {
      type: planSnapshotSchema,
      required: true,
      immutable: true,
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
      validate: nonNegativeDecimal,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
    },
    provider: {
      type: String,
      enum: ['demo', 'sslcommerz'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['demo', 'sandbox', 'live'],
      required: true,
    },
    merchantTransactionRef: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    providerTransactionRef: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
      required: true,
      default: 'pending',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      required: true,
      default: 'pending',
    },
    verificationMetadata: {
      type: verificationMetadataSchema,
      default: undefined,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

paymentTransactionSchema.index(
  { provider: 1, mode: 1, merchantTransactionRef: 1 },
  { unique: true },
)
paymentTransactionSchema.index(
  { provider: 1, mode: 1, providerTransactionRef: 1 },
  {
    unique: true,
    partialFilterExpression: { providerTransactionRef: { $type: 'string' } },
  },
)
paymentTransactionSchema.index({ userId: 1, createdAt: -1 })

export type PaymentTransactionFields = InferSchemaType<typeof paymentTransactionSchema>

export const PaymentTransaction = model<PaymentTransactionFields>(
  'PaymentTransaction',
  paymentTransactionSchema,
)

export default PaymentTransaction
