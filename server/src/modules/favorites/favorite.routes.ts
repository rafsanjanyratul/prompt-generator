import { Router } from 'express'

import { authMiddleware } from '../../middlewares/auth.middleware.js'
import {
  addFavoriteController,
  listFavoritesController,
  removeFavoriteController,
} from './favorite.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', listFavoritesController)
router.post('/:slug', addFavoriteController)
router.delete('/:slug', removeFavoriteController)

export default router
