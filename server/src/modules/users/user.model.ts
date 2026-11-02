import { model, Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const User = model('User', userSchema)

export default User
