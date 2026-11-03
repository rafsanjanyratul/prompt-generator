import crypto from 'node:crypto'

import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'

import { env } from '../../config/env.js'
import { sendTransactionalEmail } from '../../utils/email.js'
import { buildPasswordResetEmailTemplate, buildVerificationEmailTemplate } from '../../utils/email-templates.js'
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

export const googleSchema = z.object({
  credential: z.string().trim().min(1, 'Google credential is required'),
})

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Verification token is required'),
})

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

const createHttpError = (statusCode: number, message: string, code?: string) => {
  const error = new Error(message) as Error & { statusCode?: number; code?: string }
  error.statusCode = statusCode
  if (code) {
    error.code = code
  }
  return error
}

const sanitizeUser = (user: Record<string, unknown>) => {
  const safeUser = { ...user }
  delete safeUser.password
  delete safeUser.emailVerificationTokenHash
  delete safeUser.emailVerificationTokenExpiresAt
  delete safeUser.passwordResetTokenHash
  delete safeUser.passwordResetExpiresAt
  delete safeUser.googleId
  return safeUser
}

const buildVerificationLink = (token: string) => `${env.APP_BASE_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`
const buildPasswordResetLink = (token: string) => `${env.APP_BASE_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const normalizedEmail = input.email.toLowerCase()

  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser) {
    throw createHttpError(409, 'A user with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const hashedVerificationToken = hashToken(verificationToken)
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

  const user = await User.create({
    name: input.name,
    email: normalizedEmail,
    password: hashedPassword,
    emailVerified: false,
    emailVerificationTokenHash: hashedVerificationToken,
    emailVerificationTokenExpiresAt: expiresAt,
  })

  await sendTransactionalEmail({
    to: user.email,
    subject: 'Verify your PromptMuse account',
    html: buildVerificationEmailTemplate({
      recipientName: user.name,
      actionUrl: buildVerificationLink(verificationToken),
      expiresIn: '24 hours',
    }).html,
    text: buildVerificationEmailTemplate({
      recipientName: user.name,
      actionUrl: buildVerificationLink(verificationToken),
      expiresIn: '24 hours',
    }).text,
  })

  return {
    user: sanitizeUser(user.toObject()),
  }
}

export async function loginUser(input: z.infer<typeof loginSchema>) {
  const normalizedEmail = input.email.toLowerCase()
  const user = await User.findOne({ email: normalizedEmail }).select('+password +emailVerificationTokenHash +emailVerificationTokenExpiresAt')

  if (!user) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password)
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const isLegacyUser = user.emailVerified === undefined || user.emailVerified === null
  if (!isLegacyUser && user.emailVerified === false) {
    throw createHttpError(403, 'Email verification is required before login. Please verify your email first.', 'EMAIL_NOT_VERIFIED')
  }

  const token = signToken({ sub: user._id.toString(), email: user.email })

  return {
    user: sanitizeUser(user.toObject()),
    token,
  }
}

export async function googleLoginUser(input: z.infer<typeof googleSchema>) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: input.credential,
      audience: env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email || payload.email_verified !== true || !payload.sub) {
      throw createHttpError(401, 'Google authentication failed: a verified email is required')
    }

    const normalizedEmail = payload.email.toLowerCase()
    const googleId = payload.sub

    let user = await User.findOne({ googleId }).select('+password')

    if (!user) {
      const existingUserByEmail = await User.findOne({ email: normalizedEmail })

      if (existingUserByEmail) {
        throw createHttpError(
          409,
          'This email already belongs to a password account. Please sign in with your email and password instead.',
        )
      }

      const generatedPassword = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(generatedPassword, 10)

      user = await User.create({
        name: payload.name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: true,
        googleId,
      })
    }

    const token = signToken({ sub: user._id.toString(), email: user.email })

    return {
      user: sanitizeUser(user.toObject()),
      token,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number') {
      throw error
    }

    throw createHttpError(401, 'Google authentication failed')
  }
}

export async function verifyEmailUser(input: z.infer<typeof verifyEmailSchema>) {
  const submittedToken = input.token.trim()
  const tokenHash = hashToken(submittedToken)
  const now = new Date()

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationTokenExpiresAt: { $gt: now },
  }).select('+emailVerificationTokenHash +emailVerificationTokenExpiresAt')

  if (!user) {
    throw createHttpError(400, 'Invalid or expired email verification token')
  }

  user.emailVerified = true
  user.emailVerificationTokenHash = undefined
  user.emailVerificationTokenExpiresAt = undefined
  await user.save()

  return {
    message: 'Email verified successfully.',
  }
}

export async function resendVerificationUser(input: z.infer<typeof resendVerificationSchema>) {
  const normalizedEmail = input.email.toLowerCase()
  const user = await User.findOne({ email: normalizedEmail }).select('+emailVerificationTokenHash +emailVerificationTokenExpiresAt')

  if (user && user.emailVerified === false) {
    const newVerificationToken = crypto.randomBytes(32).toString('hex')
    const hashedVerificationToken = hashToken(newVerificationToken)
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

    user.emailVerificationTokenHash = hashedVerificationToken
    user.emailVerificationTokenExpiresAt = expiresAt
    await user.save()

    await sendTransactionalEmail({
      to: user.email,
      subject: 'Verify your PromptMuse account',
      html: buildVerificationEmailTemplate({
        recipientName: user.name,
        actionUrl: buildVerificationLink(newVerificationToken),
        expiresIn: '24 hours',
      }).html,
      text: buildVerificationEmailTemplate({
        recipientName: user.name,
        actionUrl: buildVerificationLink(newVerificationToken),
        expiresIn: '24 hours',
      }).text,
    })
  }

  return {
    message: 'If an account exists for this email and has not been verified yet, a verification email has been sent.',
  }
}

export async function forgotPasswordUser(input: z.infer<typeof forgotPasswordSchema>) {
  const normalizedEmail = input.email.toLowerCase()
  const user = await User.findOne({ email: normalizedEmail }).select('+password +googleId +passwordResetTokenHash +passwordResetExpiresAt')

  const genericResponse = {
    message: 'If an account exists for this email, a password reset link has been sent.',
  }

  if (!user) {
    return genericResponse
  }

  const hasUsablePassword = typeof user.password === 'string' && user.password.trim().length > 0
  if (user.googleId && !hasUsablePassword) {
    return genericResponse
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedResetToken = hashToken(resetToken)
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)

  user.passwordResetTokenHash = hashedResetToken
  user.passwordResetExpiresAt = expiresAt
  await user.save()

  await sendTransactionalEmail({
    to: user.email,
    subject: 'Reset your PromptMuse password',
    html: buildPasswordResetEmailTemplate({
      recipientName: user.name,
      actionUrl: buildPasswordResetLink(resetToken),
      expiresIn: '1 hour',
    }).html,
    text: buildPasswordResetEmailTemplate({
      recipientName: user.name,
      actionUrl: buildPasswordResetLink(resetToken),
      expiresIn: '1 hour',
    }).text,
  })

  return genericResponse
}

export async function resetPasswordUser(input: z.infer<typeof resetPasswordSchema>) {
  const submittedToken = input.token.trim()
  const tokenHash = hashToken(submittedToken)
  const now = new Date()

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: now },
  }).select('+password +passwordResetTokenHash +passwordResetExpiresAt')

  if (!user) {
    throw createHttpError(400, 'Invalid, expired, or already used password reset token')
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)

  user.password = hashedPassword
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()

  return {
    message: 'Password reset successfully.',
  }
}

