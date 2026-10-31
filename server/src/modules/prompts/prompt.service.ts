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

export async function createPromptService(input: Record<string, unknown>) {
  try {
    return await Prompt.create(input)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createHttpError(409, 'A prompt with this slug already exists')
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

  try {
    const prompt = await Prompt.findOneAndUpdate(
      { slug },
      { $set: safeInput },
      {
        new: true,
        runValidators: true,
      },
    )

    if (!prompt) {
      throw createHttpError(404, `Prompt with slug "${slug}" was not found`)
    }

    return prompt
  } catch (error) {
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
