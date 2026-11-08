import { cloudinary } from '../../config/cloudinary.js'
import { Prompt } from './prompt.model.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const isDuplicateKeyError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as { code?: number }
  return candidate.code === 11000
}

const getDuplicateKeyMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return 'A prompt with this unique field already exists'
  }

  const candidate = error as {
    keyPattern?: Record<string, unknown>
    keyValue?: Record<string, unknown>
  }

  if (candidate.keyPattern && 'slug' in candidate.keyPattern) {
    return 'A prompt with this slug already exists'
  }

  if (candidate.keyPattern && 'id' in candidate.keyPattern) {
    return 'A prompt with this id already exists'
  }

  if (candidate.keyValue && typeof candidate.keyValue.slug === 'string') {
    return 'A prompt with this slug already exists'
  }

  if (candidate.keyValue && typeof candidate.keyValue.id !== 'undefined') {
    return 'A prompt with this id already exists'
  }

  return 'A prompt with this unique field already exists'
}

const isSafeCloudinaryPublicId = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim()
  return trimmed.length > 0 && !trimmed.startsWith('/') && /^[A-Za-z0-9._/-]+$/.test(trimmed)
}

const isLocalImagePath = (imageUrl: string | null | undefined) => {
  if (typeof imageUrl !== 'string') {
    return true
  }

  const trimmed = imageUrl.trim()
  return trimmed.length === 0 || trimmed.startsWith('/') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')
}

const deleteCloudinaryAsset = async (publicId: string | null | undefined, imageUrl?: string | null) => {
  const normalizedPublicId = typeof publicId === 'string' ? publicId.trim() : ''

  if (!isSafeCloudinaryPublicId(normalizedPublicId) || isLocalImagePath(imageUrl)) {
    return false
  }

  try {
    const result = await cloudinary.uploader.destroy(normalizedPublicId, {
      resource_type: 'image',
    })

    return result?.result === 'ok' || result?.result === 'not found'
  } catch {
    return false
  }
}

export async function createPromptService(input: Record<string, unknown>) {
  try {
    return await Prompt.create(input)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createHttpError(409, getDuplicateKeyMessage(error))
    }

    throw error
  }
}

export async function listPromptsService() {
  return Prompt.find().sort({ id: 1 })
}

export async function getPromptBySlugService(slug: string) {
  const prompt = await Prompt.findOne({ slug })

  if (!prompt) {
    throw createHttpError(404, `Prompt with slug "${slug}" was not found`)
  }

  return prompt
}

export async function updatePromptBySlugService(slug: string, input: Record<string, unknown>) {
  const { _id, createdAt, updatedAt, ...safeInput } = input

  if (Object.keys(safeInput).length === 0) {
    throw createHttpError(400, 'At least one field must be provided for update')
  }

  const existingPrompt = await Prompt.findOne({ slug })

  if (!existingPrompt) {
    throw createHttpError(404, `Prompt with slug "${slug}" was not found`)
  }

  const previousImageUrl = typeof existingPrompt.image === 'string' ? existingPrompt.image : null
  const previousImagePublicId =
    typeof existingPrompt.imagePublicId === 'string' ? existingPrompt.imagePublicId.trim() : null
  const nextImageValue = typeof safeInput.image === 'string' ? safeInput.image.trim() : undefined
  const newImagePublicId =
    typeof safeInput.imagePublicId === 'string' ? safeInput.imagePublicId.trim() : undefined
  const isImageReplacement = typeof nextImageValue === 'string' && nextImageValue !== existingPrompt.image

  const nextPayload = { ...safeInput }

  if (typeof safeInput.imagePublicId === 'string' && safeInput.imagePublicId.trim() === '') {
    delete nextPayload.imagePublicId
  }

  try {
    const prompt = await Prompt.findOneAndUpdate(
      { slug },
      { $set: nextPayload },
      {
        new: true,
        runValidators: true,
      },
    )

    if (!prompt) {
      throw createHttpError(404, `Prompt with slug "${slug}" was not found`)
    }

    if (isImageReplacement && isSafeCloudinaryPublicId(previousImagePublicId) && !isLocalImagePath(previousImageUrl)) {
      await deleteCloudinaryAsset(previousImagePublicId, previousImageUrl)
    }

    return prompt
  } catch (error) {
    if (isImageReplacement && isSafeCloudinaryPublicId(newImagePublicId) && !isLocalImagePath(nextImageValue)) {
      await deleteCloudinaryAsset(newImagePublicId, nextImageValue)
    }

    if (isDuplicateKeyError(error)) {
      throw createHttpError(409, 'A prompt with this slug already exists')
    }

    throw error
  }
}

export async function deletePromptBySlugService(slug: string) {
  const prompt = await Prompt.findOneAndDelete({ slug })

  if (!prompt) {
    throw createHttpError(404, `Prompt with slug "${slug}" was not found`)
  }

  return prompt
}
