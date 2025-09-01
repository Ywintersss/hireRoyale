import { Router } from 'express'
import { prisma } from '../server'
import { validateRequest } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

// Get all tasks for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { status, priority, category } = req.query

    const where: any = { userId }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subtasks: true,
        attachments: true
      },
      orderBy: { order: 'asc' }
    })

    res.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get tasks'
    })
  }
})

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        subtasks: true,
        attachments: true
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get task'
    })
  }
})

// Update task status
router.patch('/:id/status', validateRequest(z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })
})), async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { status } = req.body

    const task = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        subtasks: true,
        attachments: true
      }
    })

    res.json({
      success: true,
      data: updatedTask
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    })
  }
})

// Update task progress
router.patch('/:id/progress', validateRequest(z.object({
  body: z.object({
    actualTime: z.number().optional(),
    notes: z.string().optional()
  })
})), async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { actualTime, notes } = req.body

    const task = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        actualTime,
        description: notes ? `${task.description}\n\n${notes}` : task.description
      },
      include: {
        subtasks: true,
        attachments: true
      }
    })

    res.json({
      success: true,
      data: updatedTask
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task progress'
    })
  }
})

// Get task statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      criticalTasks,
      highPriorityTasks
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, priority: 'CRITICAL' } }),
      prisma.task.count({ where: { userId, priority: 'HIGH' } })
    ])

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        criticalTasks,
        highPriorityTasks,
        completionRate: Math.round(completionRate)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get task statistics'
    })
  }
})

export default router

