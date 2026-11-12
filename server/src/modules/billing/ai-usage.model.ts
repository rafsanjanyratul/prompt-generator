import { model, Schema, Types, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isInteger,
  message: 'Value must be a non-negative integer',
}

const positiveInteger = {
  validator: (value: number) => Number.isInteger(value) && value > 0,
  message: 'Credits must be a positive integer',
}

const reservationAllocationSchema = new Schema(
  {
    lotId: {
      type: Schema.Types.ObjectId,
      ref: 'CreditLot',
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      validate: positiveInteger,
    },
  },
  {
    _id: false,
  },
)

const aiUsageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    payloadHash: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 128,
    },
    modelId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'unknown'],
      default: 'pending',
      required: true,
    },
    inputTokens: {
      type: Number,
      min: 0,
      validate: nonNegativeInteger,
    },
    outputTokens: {
      type: Number,
      min: 0,
      validate: nonNegativeInteger,
    },
    totalTokens: {
      type: Number,
      min: 0,
      validate: nonNegativeInteger,
    },
    cachedInputTokens: {
      type: Number,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservedCredits: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    consumedCredits: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservationAllocations: {
      type: [reservationAllocationSchema],
      default: [],
    },
    reservationExpiresAt: {
      type: Date,
      default: null,
    },
    providerResponseId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    estimatedCost: {
      type: Schema.Types.Decimal128,
      default: null,
      validate: {
        validator: (value: Types.Decimal128 | null | undefined) =>
          value == null || !value.toString().startsWith('-'),
        message: 'Estimated cost must be non-negative',
      },
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
      default: null,
    },
    pricingVersion: {
      type: String,
      trim: true,
      maxlength: 64,
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

aiUsageSchema.index({ userId: 1, requestId: 1 }, { unique: true })
aiUsageSchema.index({ userId: 1, createdAt: -1 })
aiUsageSchema.index(
  { providerResponseId: 1 },
  {
    partialFilterExpression: { providerResponseId: { $type: 'string' } },
  },
)

export type AIUsageFields = InferSchemaType<typeof aiUsageSchema>

export const AIUsage = model<AIUsageFields>('AIUsage', aiUsageSchema)

export default AIUsage
