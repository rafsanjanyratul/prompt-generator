import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import favoriteRoutes from './modules/favorites/favorite.routes.js'
import healthRoutes from './modules/health/health.routes.js'
import promptRoutes from './modules/prompts/prompt.routes.js'
import uploadRoutes from './modules/uploads/upload.routes.js'
import userPromptRoutes from './modules/user-prompts/user-prompt.routes.js'

const app = express()

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user-prompts', userPromptRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/prompts', promptRoutes)
app.use('/api/uploads', uploadRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
