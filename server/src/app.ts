import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import favoriteRoutes from './modules/favorites/favorite.routes.js'
import healthRoutes from './modules/health/health.routes.js'
import aiRoutes from './modules/ai/ai.routes.js'
import promptRoutes from './modules/prompts/prompt.routes.js'
import uploadRoutes from './modules/uploads/upload.routes.js'
import userPromptRoutes from './modules/user-prompts/user-prompt.routes.js'
import billingRoutes from './modules/billing/billing.routes.js'

const app = express()

const allowedOrigins = [
  new URL(env.FRONTEND_URL).origin,
  ...env.CORS_ALLOWED_ORIGINS,
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header (server-to-server, health checks, curl)
      if (!origin) {
        return callback(null, false)
      }
      // Exact match against allowlist; echo back the matching origin
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin)
      }
      // Reject unknown origins
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/user-prompts', userPromptRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/prompts', promptRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/billing', billingRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
