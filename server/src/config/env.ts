import dotenv from 'dotenv'
import { isIP } from 'node:net'
import { z } from 'zod'

dotenv.config()

const apiBaseUrlSchema = z
  .string()
  .url()
  .transform((value, context) => {
    const url = new URL(value)
    const path = url.pathname.replace(/\/+$/, '').toLowerCase()

    if (!['http:', 'https:'].includes(url.protocol)) {
      context.addIssue({ code: 'custom', message: 'API_BASE_URL must use HTTP or HTTPS' })
    }
    if (url.username || url.password || url.search || url.hash) {
      context.addIssue({
        code: 'custom',
        message: 'API_BASE_URL must not include credentials, a query, or a fragment',
      })
    }
    if (path && path !== '/api') {
      context.addIssue({
        code: 'custom',
        message: 'API_BASE_URL must be an origin; a trailing /api is accepted and normalized',
      })
    }

    return url.origin
  })
  .default('http://localhost:5000')

const isPublicHostname = (hostname: string) => {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '')
  const reservedSuffixes = ['.localhost', '.local', '.internal', '.test', '.invalid', '.example']

  return (
    normalizedHostname.includes('.') &&
    isIP(normalizedHostname) === 0 &&
    normalizedHostname !== 'localhost' &&
    !reservedSuffixes.some((suffix) => normalizedHostname.endsWith(suffix))
  )
}

const isLocalDevelopmentHostname = (hostname: string) => {
  const normalizedHostname = hostname.toLowerCase().replace(/^\[|\]$/g, '')

  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname === '::1' ||
    (isIP(normalizedHostname) === 4 && normalizedHostname.startsWith('127.'))
  )
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  AI_ENHANCEMENT_CREDIT_COST: z.coerce.number().int().positive().default(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((value) => {
      if (!value.trim()) return []
      return value
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => {
          try {
            const parsed = new URL(url)
            if (!['http:', 'https:'].includes(parsed.protocol)) {
              throw new Error(`Invalid CORS_ALLOWED_ORIGINS protocol: ${parsed.protocol}`)
            }
            if (parsed.pathname !== '/' && parsed.pathname !== '') {
              throw new Error(`Invalid CORS_ALLOWED_ORIGINS pathname: ${parsed.pathname}`)
            }
            if (parsed.search || parsed.hash) {
              throw new Error(`Invalid CORS_ALLOWED_ORIGINS query or hash`)
            }
            return parsed.origin
          } catch (err) {
            if (err instanceof Error && err.message.startsWith('Invalid CORS_ALLOWED_ORIGINS')) {
              throw err
            }
            throw new Error(`Invalid CORS_ALLOWED_ORIGINS entry: ${url}`)
          }
        })
    }),
  APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  API_BASE_URL: apiBaseUrlSchema,
  SSLCOMMERZ_STORE_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).max(30).optional(),
  ),
  SSLCOMMERZ_STORE_PASSWORD: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).max(30).optional(),
  ),
  SSLCOMMERZ_IS_SANDBOX: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  MONGODB_URI: z
    .string()
    .trim()
    .min(1, 'MONGODB_URI is required')
    .refine((value) => /^mongodb(?:\+srv)?:\/\//i.test(value), {
      message: 'MONGODB_URI must use mongodb:// or mongodb+srv:// protocol',
    }),
  GOOGLE_CLIENT_ID: z.string().trim().min(1, 'GOOGLE_CLIENT_ID is required'),
  EMAIL_PROVIDER: z.enum(['gmail', 'resend']).default('resend'),
  RESEND_API_KEY: z.string().trim().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().trim().email().optional(),
  SMTP_HOST: z.string().trim().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().trim().min(1).optional(),
  SMTP_PASS: z.string().trim().min(1).optional(),
  SMTP_FROM: z.string().trim().email().optional(),
  JWT_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().trim().default('7d'),
  OPENAI_API_KEY: z.string().trim().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().trim().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().trim().min(1, 'CLOUDINARY_API_SECRET is required'),
}).superRefine((values, context) => {
  if (Boolean(values.SSLCOMMERZ_STORE_ID) !== Boolean(values.SSLCOMMERZ_STORE_PASSWORD)) {
    context.addIssue({
      code: 'custom',
      message: 'SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD must be configured together',
    })
  }

  if (values.EMAIL_PROVIDER === 'resend') {
    if (!values.RESEND_API_KEY) {
      context.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'RESEND_API_KEY is required when EMAIL_PROVIDER is resend',
      })
    }
    if (!values.RESEND_FROM_EMAIL) {
      context.addIssue({
        code: 'custom',
        path: ['RESEND_FROM_EMAIL'],
        message: 'RESEND_FROM_EMAIL is required when EMAIL_PROVIDER is resend',
      })
    }
  }

  if (values.EMAIL_PROVIDER === 'gmail') {
    if (!values.SMTP_HOST) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST is required when EMAIL_PROVIDER is gmail',
      })
    }
    if (!values.SMTP_USER) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER is required when EMAIL_PROVIDER is gmail',
      })
    }
    if (!values.SMTP_PASS) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_PASS'],
        message: 'SMTP_PASS is required when EMAIL_PROVIDER is gmail',
      })
    }
    if (!values.SMTP_FROM) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_FROM'],
        message: 'SMTP_FROM is required when EMAIL_PROVIDER is gmail',
      })
    }
    if (!values.SMTP_PORT) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_PORT'],
        message: 'SMTP_PORT is required when EMAIL_PROVIDER is gmail',
      })
    }
  }

  const apiUrl = new URL(values.API_BASE_URL)
  const localDevelopmentAllowed =
    process.env.NODE_ENV !== 'production' &&
    values.SSLCOMMERZ_IS_SANDBOX &&
    isLocalDevelopmentHostname(apiUrl.hostname)

  if (
    !localDevelopmentAllowed &&
    (apiUrl.protocol !== 'https:' || !isPublicHostname(apiUrl.hostname))
  ) {
    context.addIssue({
      code: 'custom',
      path: ['API_BASE_URL'],
      message: 'API_BASE_URL must be a public HTTPS origin outside local sandbox development',
    })
  }
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.issues.map((issue) => issue.message).join(', ')}`)
}

export const env = parsedEnv.data
