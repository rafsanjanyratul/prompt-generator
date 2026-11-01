import type { NextFunction, Request, Response } from 'express'

import {
  addFavoriteService,
  listFavoritesService,
  removeFavoriteService,
} from './favorite.service.js'

const getRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? ''

export const addFavoriteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = getRouteParam(req.params.slug)
    const result = await addFavoriteService(req.user!.id, slug)

    res.status(result.created ? 201 : 200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const removeFavoriteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = getRouteParam(req.params.slug)
    const result = await removeFavoriteService(req.user!.id, slug)

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const listFavoritesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await listFavoritesService(req.user!.id)

    res.status(200).json({
      success: true,
      data: favorites,
    })
  } catch (error) {
    next(error)
  }
}
