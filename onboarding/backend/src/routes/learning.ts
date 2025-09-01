import { Router } from 'express'
import { prisma } from '../server'
import { validateRequest } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

// Get user learning paths
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { category, isCompleted } = req.query

    const where: any = { userId }

    if (category) where.category = category
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true'

    const learningPaths = await prisma.learningPath.findMany({
      where,
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json({
      success: true,
      data: learningPaths
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning paths'
    })
  }
})

// Get single learning path
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const learningPath = await prisma.learningPath.findFirst({
      where: { id, userId },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      })
    }

    res.json({
      success: true,
      data: learningPath
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning path'
    })
  }
})

// Update module progress
router.patch('/modules/:id/progress', validateRequest(z.object({
  body: z.object({
    progress: z.number().min(0).max(100),
    isCompleted: z.boolean().optional()
  })
})), async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { progress, isCompleted } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Module id is required'
      })
    }

    // Verify the module belongs to the user
    const module = await prisma.learningModule.findFirst({
      where: { id: id as string },
      include: {
        learningPath: true
      }
    })

    // Check if the module's learningPath belongs to the user
    if (!module || module.learningPath?.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Module not found or access denied'
      })
    }

    const updatedModule = await prisma.learningModule.update({
      where: { id },
      data: {
        progress,
        isCompleted: isCompleted || progress === 100
      }
    })

    // Update learning path progress
    const allModules = await prisma.learningModule.findMany({
      where: { learningPathId: module.learningPathId }
    })

    const totalProgress = allModules.reduce((sum, m) => sum + m.progress, 0) / allModules.length
    const isPathCompleted = allModules.every(m => m.isCompleted)

    await prisma.learningPath.update({
      where: { id: module.learningPathId },
      data: {
        progress: Math.round(totalProgress),
        isCompleted: isPathCompleted
      }
    })

    res.json({
      success: true,
      data: updatedModule
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update module progress'
    })
  }
})

export default learningRouter



