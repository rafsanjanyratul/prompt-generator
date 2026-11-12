import { model, Schema, Types, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isSafeInteger,
  message: 'Credit entitlement must be a non-negative integer',
}

const nonNegativeDecimal = {
  validator: (value: Types.Decimal128) => !value.toString().startsWith('-'),
  message: 'Price amount must be non-negative',
}

const isZeroDecimal = (value: Types.Decimal128) =>
  /^[+-]?0(?:\.0*)?(?:e[+-]?\d+)?$/i.test(value.toString())

const inferPurchaseType = (
  planType: 'free' | 'paid',
  billingInterval: 'month' | 'year' | null | undefined,
) => (planType === 'free' ? 'free' : billingInterval ? 'subscription' : 'one_time')

const planSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 64,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Plan version must be a positive integer',
      },
    },
    planType: {
      type: String,
      enum: ['free', 'paid'],
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ['free', 'one_time', 'subscription'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    billingInterval: {
      type: String,
      enum: ['month', 'year'],
      default: null,
    },
    priceAmount: {
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
    creditEntitlement: {
      type: Number,
      required: true,
      min: 0,
      validate: nonNegativeInteger,
    },
    creditExpirationPolicy: {
      type: String,
      enum: ['billing_period', 'never'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

planSchema.pre('validate', function () {
  if (!this.purchaseType) {
    this.purchaseType = inferPurchaseType(this.planType, this.billingInterval)
  }

  const isZeroPrice = this.priceAmount ? isZeroDecimal(this.priceAmount) : false
  if (this.purchaseType === 'free') {
    if (this.planType !== 'free') this.invalidate('planType', 'Free purchase types require a free plan')
    if (!isZeroPrice) this.invalidate('priceAmount', 'Free plans must have a zero price')
    if (this.billingInterval != null) {
      this.invalidate('billingInterval', 'Free plans cannot have a billing interval')
    }
    return
  }

  if (this.planType !== 'paid') this.invalidate('planType', 'Paid purchase types require a paid plan')
  if (isZeroPrice) this.invalidate('priceAmount', 'Paid plans must have a positive price')
  if (!Number.isSafeInteger(this.creditEntitlement) || this.creditEntitlement <= 0) {
    this.invalidate('creditEntitlement', 'Paid plans must grant a positive integer credit entitlement')
  }

  if (this.purchaseType === 'one_time' && this.billingInterval != null) {
    this.invalidate('billingInterval', 'One-time plans cannot have a billing interval')
  }
  if (this.purchaseType === 'one_time' && this.creditExpirationPolicy === 'billing_period') {
    this.invalidate('creditExpirationPolicy', 'One-time plan credits cannot expire by billing period')
  }
  if (this.purchaseType === 'subscription' && this.billingInterval == null) {
    this.invalidate('billingInterval', 'Subscription plans require a billing interval')
  }
})

planSchema.index({ key: 1, version: 1 }, { unique: true })

export type PlanFields = InferSchemaType<typeof planSchema>

export const Plan = model<PlanFields>('Plan', planSchema)

export default Plan
