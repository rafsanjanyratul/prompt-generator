import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z
    .string()
    .trim()
    .min(1, 'MONGODB_URI is required')
    .refine((value) => /^mongodb(?:\+srv)?:\/\//i.test(value), {
      message: 'MONGODB_URI must use mongodb:// or mongodb+srv:// protocol',
    }),
  GOOGLE_CLIENT_ID: z.string().trim().min(1, 'GOOGLE_CLIENT_ID is required'),
  EMAIL_PROVIDER: z.enum(['gmail']).default('gmail'),
  SMTP_HOST: z.string().trim().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().positive('SMTP_PORT must be a positive integer'),
  SMTP_USER: z.string().trim().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().trim().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z.string().trim().email('SMTP_FROM must be a valid email address'),
  JWT_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().trim().default('7d'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.issues.map((issue) => issue.message).join(', ')}`)
}

export const env = parsedEnv.data
