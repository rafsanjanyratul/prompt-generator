import { model, Schema, type InferSchemaType } from 'mongoose'

const positiveInteger = {
  validator: (value: number) => Number.isInteger(value) && value > 0,
  message: 'Amount must be a positive integer',
}

const creditLedgerMetadataSchema = new Schema(
  {
    source: {
      type: String,
      enum: ['free_plan', 'subscription', 'top_up', 'admin', 'ai_usage', 'payment', 'system'],
    },
    adminAdjustmentDirection: {
      type: String,
      enum: ['credit', 'debit'],
    },
  },
  {
    _id: false,
    strict: 'throw',
  },
)

const creditLedgerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['grant', 'reserve', 'capture', 'release', 'refund', 'expiry', 'admin_adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: positiveInteger,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    relatedUsageId: {
      type: Schema.Types.ObjectId,
      ref: 'AIUsage',
      default: null,
    },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
    relatedSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    metadata: {
      type: creditLedgerMetadataSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
)

creditLedgerSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true })
creditLedgerSchema.index({ userId: 1, createdAt: -1 })

export type CreditLedgerFields = InferSchemaType<typeof creditLedgerSchema>

export const CreditLedger = model<CreditLedgerFields>('CreditLedger', creditLedgerSchema)

export default CreditLedger
