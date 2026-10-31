import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import {
  createPromptService,
  deletePromptBySlugService,
  getPromptBySlugService,
  listPromptsService,
  updatePromptBySlugService,
} from './prompt.service.js'

const promptSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  shortDescription: z.string().trim().min(1),
  category: z.string().trim().min(1),
  gender: z.string().trim().min(1),
  style: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  image: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
})

const updatePromptSchema = z
  .object({
    id: z.number().int().positive().optional(),
    slug: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    shortDescription: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    gender: z.string().trim().min(1).optional(),
    style: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    image: z.string().trim().min(1).optional(),
    prompt: z.string().trim().min(1).optional(),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
  })
  .strict()

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const formatValidationError = (error: z.ZodError) =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'body'
      return `${path}: ${issue.message}`
    })
    .join('; ')

export const createPromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = promptSchema.parse(req.body)
    const prompt = await createPromptService(payload)

    res.status(201).json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}

export const listPromptsController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prompts = await listPromptsService()

    res.status(200).json({
      success: true,
      data: prompts,
    })
  } catch (error) {
    next(error)
  }
}

export const getPromptBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
    const prompt = await getPromptBySlugService(slug)

    res.status(200).json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    next(error)
  }
}

export const updatePromptBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updatePromptSchema.parse(req.body)
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
    const prompt = await updatePromptBySlugService(slug, payload)

    res.status(200).json({
      success: true,
      data: prompt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createHttpError(400, formatValidationError(error)))
      return
    }

    next(error)
  }
}

export const deletePromptBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
    const prompt = await deletePromptBySlugService(slug)

    res.status(200).json({
      success: true,
      data: {
        deleted: true,
        slug,
        prompt,
      },
    })
  } catch (error) {
    next(error)
  }
}
