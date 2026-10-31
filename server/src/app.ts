import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import healthRoutes from './modules/health/health.routes.js'
import promptRoutes from './modules/prompts/prompt.routes.js'

const app = express()

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/prompts', promptRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
