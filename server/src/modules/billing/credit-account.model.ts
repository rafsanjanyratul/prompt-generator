import { model, Schema, type InferSchemaType } from 'mongoose'

const nonNegativeInteger = {
  validator: Number.isInteger,
  message: 'Value must be a non-negative integer',
}

const creditAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    availableCredits: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservedCredits: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
  },
  {
    timestamps: true,
  },
)

export type CreditAccountFields = InferSchemaType<typeof creditAccountSchema>

export const CreditAccount = model<CreditAccountFields>('CreditAccount', creditAccountSchema)

export default CreditAccount
