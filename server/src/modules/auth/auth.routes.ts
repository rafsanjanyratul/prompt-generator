import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { loginController, registerController } from './auth.controller.js'

const router = Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  })
})

export default router
