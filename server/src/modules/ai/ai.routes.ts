import { Router } from 'express'

import { aiRateLimitMiddleware } from '../../middlewares/ai-rate-limit.middleware.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { enhancePromptController } from './ai.controller.js'

const router = Router()

router.post('/enhance-prompt', authMiddleware, aiRateLimitMiddleware, enhancePromptController)

export default router
