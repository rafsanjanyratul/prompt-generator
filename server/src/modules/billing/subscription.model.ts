import { model, Schema, Types, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isInteger,
  message: 'Credit entitlement must be a non-negative integer',
}

const nonNegativeDecimal = {
  validator: (value: Types.Decimal128) => !value.toString().startsWith('-'),
  message: 'Price amount must be non-negative',
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

const subscriptionSchema = new Schema(
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
    status: {
      type: String,
      enum: ['pending', 'active', 'past_due', 'canceled', 'expired', 'unpaid'],
      required: true,
      default: 'pending',
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: false,
      required: true,
    },
    nextBillingAt: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
      required: true,
    },
    cancellationRequestedAt: {
      type: Date,
      default: null,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    provider: {
      type: String,
      enum: ['sslcommerz'],
      default: null,
    },
    providerMode: {
      type: String,
      enum: ['sandbox', 'live'],
      default: null,
    },
    providerSubscriptionRef: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    lastAppliedCreditGrantPeriodKey: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_subscription_per_user',
  },
)
subscriptionSchema.index(
  { provider: 1, providerMode: 1, providerSubscriptionRef: 1 },
  {
    unique: true,
    partialFilterExpression: { providerSubscriptionRef: { $type: 'string' } },
  },
)
subscriptionSchema.index(
  { userId: 1, lastAppliedCreditGrantPeriodKey: 1 },
  {
    unique: true,
    partialFilterExpression: { lastAppliedCreditGrantPeriodKey: { $type: 'string' } },
  },
)

export type SubscriptionFields = InferSchemaType<typeof subscriptionSchema>

export const Subscription = model<SubscriptionFields>('Subscription', subscriptionSchema)

export default Subscription
