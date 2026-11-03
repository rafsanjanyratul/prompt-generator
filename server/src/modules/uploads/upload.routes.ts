import { Router } from 'express'
import multer from 'multer'

import { adminMiddleware, authMiddleware } from '../../middlewares/auth.middleware.js'
import { uploadImageController } from './upload.controller.js'

const router = Router()

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        Object.assign(new Error('Only JPEG, PNG, WebP, and AVIF images are allowed.'), {
          statusCode: 400,
        }),
      )
      return
    }

    callback(null, true)
  },
})

router.post('/image', authMiddleware, adminMiddleware, upload.single('image'), uploadImageController)

export default router
