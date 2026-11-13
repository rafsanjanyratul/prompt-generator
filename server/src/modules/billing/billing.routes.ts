import { Router, urlencoded } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  getPlansController,
  activateFreeController,
  getCurrentSubscriptionController,
  initiatePaidCheckoutController,
  getPaymentStatusController,
  sslCommerzSuccessCallbackController,
  sslCommerzFailCallbackController,
  sslCommerzCancelCallbackController,
  sslCommerzIpnController,
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
router.get('/payments/history', authMiddleware, getPaymentHistoryController)
router.get('/payments/status/:paymentId', authMiddleware, getPaymentStatusController)

// SSLCommerz sends URL-encoded POST bodies to its browser callbacks and IPN endpoint.
const parseProviderForm = urlencoded({ extended: false, limit: '10kb' })
router.post('/payments/callback/success', parseProviderForm, sslCommerzSuccessCallbackController)
router.post('/payments/callback/fail', parseProviderForm, sslCommerzFailCallbackController)
router.post('/payments/callback/cancel', parseProviderForm, sslCommerzCancelCallbackController)
router.post('/payments/ipn', parseProviderForm, sslCommerzIpnController)

// Credit endpoints (authenticated)
router.get('/credits/balance', authMiddleware, getCreditBalanceController)
router.get('/credits/history', authMiddleware, getCreditHistoryController)
router.get('/usage/history', authMiddleware, getAIUsageHistoryController)

export default router
