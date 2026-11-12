import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  getPlansController,
  activateFreeController,
  getCurrentSubscriptionController,
  initiatePaidCheckoutController,
  verifyDemoPaymentController,
  getPaymentHistoryController,
  getCreditBalanceController,
  getCreditHistoryController,
  getAIUsageHistoryController,
} from './billing.controller.js'

const router = Router()

// Public endpoints
router.get('/plans', getPlansController)

// Subscription endpoints (authenticated)
router.post('/subscription/activate-free', authMiddleware, activateFreeController)
router.get('/subscription/current', authMiddleware, getCurrentSubscriptionController)

// Payment endpoints (authenticated)
router.post('/payments/checkout', authMiddleware, initiatePaidCheckoutController)
router.post('/payments/verify', authMiddleware, verifyDemoPaymentController)
router.get('/payments/history', authMiddleware, getPaymentHistoryController)

// Credit endpoints (authenticated)
router.get('/credits/balance', authMiddleware, getCreditBalanceController)
router.get('/credits/history', authMiddleware, getCreditHistoryController)
router.get('/usage/history', authMiddleware, getAIUsageHistoryController)

export default router
