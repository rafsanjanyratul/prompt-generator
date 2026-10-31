import { Router } from 'express'

import {
  createPromptController,
  deletePromptBySlugController,
  getPromptBySlugController,
  listPromptsController,
  updatePromptBySlugController,
} from './prompt.controller.js'

const router = Router()

router.post('/', createPromptController)
router.get('/', listPromptsController)
router.get('/:slug', getPromptBySlugController)
router.patch('/:slug', updatePromptBySlugController)
router.delete('/:slug', deletePromptBySlugController)

export default router
