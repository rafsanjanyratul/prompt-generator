import { model, Schema } from 'mongoose'

const userPromptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    style: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => tags.map((tag) => tag.trim()).filter(Boolean),
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const UserPrompt = model('UserPrompt', userPromptSchema)

export default UserPrompt
