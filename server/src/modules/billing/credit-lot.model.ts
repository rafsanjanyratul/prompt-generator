import { model, Schema, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isInteger,
  message: 'Value must be a non-negative integer',
}

const positiveInteger = {
  validator: (value: number) => Number.isInteger(value) && value > 0,
  message: 'Value must be a positive integer',
}

const creditLotSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceLedgerId: {
      type: Schema.Types.ObjectId,
      ref: 'CreditLedger',
      required: true,
      unique: true,
    },
    grantType: {
      type: String,
      enum: ['free', 'subscription', 'top_up', 'admin'],
      required: true,
    },
    originalCredits: {
      type: Number,
      required: true,
      min: 1,
      validate: positiveInteger,
    },
    availableCredits: {
      type: Number,
      required: true,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservedCredits: {
      type: Number,
      required: true,
      min: 0,
      validate: nonNegativeInteger,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

creditLotSchema.index({ userId: 1, expiresAt: 1, availableCredits: 1 })

export type CreditLotFields = InferSchemaType<typeof creditLotSchema>

export const CreditLot = model<CreditLotFields>('CreditLot', creditLotSchema)

export default CreditLot
