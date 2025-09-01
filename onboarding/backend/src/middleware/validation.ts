import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      }) as {
        body: typeof req.body
        query: typeof req.query
        params: typeof req.params
      }

      req.body = validatedData.body
      req.query = validatedData.query
      req.params = validatedData.params

      return next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      return res.status(500).json({
        success: false,
        error: 'Validation error'
      })
    }
  }
}

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query)
      req.query = validatedQuery as import('qs').ParsedQs
      next()
      return
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      return res.status(500).json({
        success: false,
        error: 'Query validation error'
      })
    }
  }
}

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params)
      req.params = validatedParams as import('express-serve-static-core').ParamsDictionary
      next()
      return
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      return res.status(500).json({
        success: false,
        error: 'Parameter validation error'
      })
    }
  }
}

