import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z
    .string()
    .trim()
    .min(1, 'MONGODB_URI is required')
    .refine((value) => /^mongodb(?:\+srv)?:\/\//i.test(value), {
      message: 'MONGODB_URI must use mongodb:// or mongodb+srv:// protocol',
    }),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.issues.map((issue) => issue.message).join(', ')}`)
}

export const env = parsedEnv.data
