import { model, Schema } from 'mongoose'

const favoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: {
      type: Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

favoriteSchema.index({ user: 1, prompt: 1 }, { unique: true })

export const Favorite = model('Favorite', favoriteSchema)

export default Favorite
