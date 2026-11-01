import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signToken } from '../../utils/jwt.js'
import { User } from '../users/user.model.js'

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const sanitizeUser = (user: Record<string, unknown>) => {
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const normalizedEmail = input.email.toLowerCase()

  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser) {
    throw createHttpError(409, 'A user with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)
  const user = await User.create({
    name: input.name,
    email: normalizedEmail,
    password: hashedPassword,
  })

  const token = signToken({ sub: user._id.toString(), email: user.email })

  return {
    user: sanitizeUser(user.toObject()),
    token,
  }
}

export async function loginUser(input: z.infer<typeof loginSchema>) {
  const normalizedEmail = input.email.toLowerCase()
  const user = await User.findOne({ email: normalizedEmail }).select('+password')

  if (!user) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password)
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const token = signToken({ sub: user._id.toString(), email: user.email })

  return {
    user: sanitizeUser(user.toObject()),
    token,
  }
}

