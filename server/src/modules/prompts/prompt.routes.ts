import { Router } from 'express'

import { adminMiddleware, authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  createPromptController,
  deletePromptBySlugController,
  getPromptBySlugController,
  listPromptsController,
  updatePromptBySlugController,
} from './prompt.controller.js'

const router = Router()

router.get('/', listPromptsController)
router.get('/:slug', getPromptBySlugController)
router.post('/', authMiddleware, adminMiddleware, createPromptController)
router.patch('/:slug', authMiddleware, adminMiddleware, updatePromptBySlugController)
router.delete('/:slug', authMiddleware, adminMiddleware, deletePromptBySlugController)

export default router
