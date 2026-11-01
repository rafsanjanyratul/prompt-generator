import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  createUserPromptController,
  deleteUserPromptController,
  listUserPromptsController,
  updateUserPromptController,
} from './user-prompt.controller.js'

const router = Router()

router.use(authMiddleware)
router.post('/', createUserPromptController)
router.get('/', listUserPromptsController)
router.patch('/:id', updateUserPromptController)
router.delete('/:id', deleteUserPromptController)

export default router
