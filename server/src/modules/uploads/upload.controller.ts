import type { NextFunction, Request, Response } from 'express'

import { cloudinary } from '../../config/cloudinary.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file

    if (!file) {
      throw createHttpError(400, 'Image file is required.')
    }

    const result = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'promptmuse/styles',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
          overwrite: false,
          unique_filename: true,
          use_filename: true,
        },
        (error, uploadedFile) => {
          if (error) {
            reject(error)
            return
          }

          resolve(uploadedFile ?? {})
        },
      )

      uploadStream.end(file.buffer)
    })

    if (!result.secure_url || !result.public_id) {
      throw createHttpError(500, 'Image upload failed. Please try again.')
    }

    res.status(200).json({
      success: true,
      data: {
        secureUrl: result.secure_url,
        publicId: result.public_id,
      },
    })
  } catch (error) {
    next(error)
  }
}
