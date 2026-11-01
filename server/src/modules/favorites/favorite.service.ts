import { Prompt } from '../prompts/prompt.model.js'
import { Favorite } from './favorite.model.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const favoritePromptPopulate = {
  path: 'prompt',
  select: '_id slug title shortDescription category gender style tags image prompt featured trending',
}

export async function addFavoriteService(userId: string, slug: string) {
  const prompt = await Prompt.findOne({ slug })

  if (!prompt) {
    throw createHttpError(404, 'Prompt not found')
  }

  const existingFavorite = await Favorite.findOne({ user: userId, prompt: prompt._id })

  if (existingFavorite) {
    const populatedFavorite = await Favorite.findById(existingFavorite._id).populate(favoritePromptPopulate)

    return {
      favorite: populatedFavorite,
      created: false,
    }
  }

  const favorite = await Favorite.create({
    user: userId,
    prompt: prompt._id,
  })

  const populatedFavorite = await Favorite.findById(favorite._id).populate(favoritePromptPopulate)

  return {
    favorite: populatedFavorite,
    created: true,
  }
}

export async function removeFavoriteService(userId: string, slug: string) {
  const prompt = await Prompt.findOne({ slug })

  if (!prompt) {
    throw createHttpError(404, 'Prompt not found')
  }

  const favorite = await Favorite.findOne({ user: userId, prompt: prompt._id })

  if (!favorite) {
    return {
      deleted: false,
      slug,
      favorite: null,
    }
  }

  await Favorite.deleteOne({ _id: favorite._id })

  return {
    deleted: true,
    slug,
    favorite,
  }
}

export async function listFavoritesService(userId: string) {
  return Favorite.find({ user: userId }).populate(favoritePromptPopulate).sort({ createdAt: -1 })
}
