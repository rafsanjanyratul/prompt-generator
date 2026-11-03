import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  forgotPasswordController,
  googleController,
  loginController,
  registerController,
  resendVerificationController,
  resetPasswordController,
  verifyEmailController,
} from './auth.controller.js'

const router = Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.post('/google', googleController)
router.post('/verify-email', verifyEmailController)
router.post('/resend-verification', resendVerificationController)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  })
})

export default router
