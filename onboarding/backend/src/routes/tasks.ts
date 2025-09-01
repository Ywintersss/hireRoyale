import { Router } from 'express'
import { prisma } from '../server'
import { validateRequest, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../middleware/errorHandler'
import { GamificationService } from '../services/gamification'
import { NotificationService } from '../services/notification'
import { z } from 'zod'

const router = Router()
const gamificationService = new GamificationService()
const notificationService = new NotificationService()

// Get all tasks for user
const getTasksSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
})

router.get('/', validateQuery(getTasksSchema.shape.query), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { status, priority, category, page = '1', limit = '10' } = req.query

  const where: any = { userId }
  if (status) where.status = status
  if (priority) where.priority = priority
  if (category) where.category = category

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
  const take = parseInt(limit as string)

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        subtasks: true,
        attachments: true
      },
      orderBy: { order: 'asc' },
      skip,
      take
    }),
    prisma.task.count({ where })
  ])

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    }
  })
}))

// Get single task
router.get('/:id', asyncHandler(async (req, res) => {
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
}))

// Update task status
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })
})

router.patch('/:id/status', validateRequest(updateStatusSchema), asyncHandler(async (req, res) => {
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
      completedAt: status === 'COMPLETED' ? new Date() : null,
      updatedAt: new Date()
    },
    include: {
      subtasks: true,
      attachments: true
    }
  })

  // If task completed, send notification and check for badges
  if (status === 'COMPLETED') {
    await notificationService.createTaskCompletionNotification(userId, task.title)
    
    // Check for badge unlocks
    const newBadges = await gamificationService.checkBadgeUnlocks(userId)
    
    // Update user level
    const newLevel = await gamificationService.updateUserLevel(userId)

    res.json({
      success: true,
      data: {
        task: updatedTask,
        newBadges,
        levelUp: newLevel > (req.user.level || 1)
      }
    })
  } else {
    res.json({
      success: true,
      data: { task: updatedTask }
    })
  }
}))

// Update task progress
const updateProgressSchema = z.object({
  body: z.object({
    actualTime: z.number().optional(),
    notes: z.string().optional(),
    progress: z.number().min(0).max(100).optional()
  })
})

router.patch('/:id/progress', validateRequest(updateProgressSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  const { actualTime, notes, progress } = req.body

  const task = await prisma.task.findFirst({
    where: { id, userId }
  })

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    })
  }

  const updateData: any = { updatedAt: new Date() }
  
  if (actualTime !== undefined) updateData.actualTime = actualTime
  if (progress !== undefined) updateData.progress = progress
  if (notes) {
    updateData.description = task.description ? `${task.description}\n\n--- Progress Update ---\n${notes}` : notes
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      subtasks: true,
      attachments: true
    }
  })

  res.json({
    success: true,
    data: updatedTask
  })
}))

// Create a new task
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    category: z.string().optional(),
    estimatedTime: z.number().optional(),
    dueDate: z.string().datetime().optional(),
    tags: z.array(z.string()).optional()
  })
})

router.post('/', validateRequest(createTaskSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const taskData = req.body

  // Get the highest order number for this user
  const lastTask = await prisma.task.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  const newTask = await prisma.task.create({
    data: {
      ...taskData,
      userId,
      order: (lastTask?.order || 0) + 1,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
    },
    include: {
      subtasks: true,
      attachments: true
    }
  })

  res.status(201).json({
    success: true,
    data: newTask
  })
}))

// Delete a task
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  const task = await prisma.task.findFirst({
    where: { id, userId }
  })

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    })
  }

  await prisma.task.delete({
    where: { id }
  })

  res.json({
    success: true,
    message: 'Task deleted successfully'
  })
}))

// Get task statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const [
    totalTasks,
    tasksByStatus,
    tasksByPriority,
    tasksByCategory,
    completionRate,
    avgCompletionTime
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { priority: true }
    }),
    prisma.task.groupBy({
      by: ['category'],
      where: { userId, category: { not: null } },
      _count: { category: true }
    }),
    prisma.task.aggregate({
      where: { userId },
      _count: { status: true },
      _avg: { progress: true }
    }),
    prisma.task.aggregate({
      where: { userId, status: 'COMPLETED', actualTime: { not: null } },
      _avg: { actualTime: true }
    })
  ])

  const stats = {
    totalTasks,
    tasksByStatus: tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    tasksByPriority: tasksByPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority
      return acc
    }, {} as Record<string, number>),
    tasksByCategory: tasksByCategory.reduce((acc, item) => {
      acc[item.category!] = item._count.category
      return acc
    }, {} as Record<string, number>),
    completionRate: Math.round(completionRate._avg.progress || 0),
    avgCompletionTime: Math.round(avgCompletionTime._avg.actualTime || 0),
    totalPoints: (tasksByStatus.find(s => s.status === 'COMPLETED')?._count.status || 0) * 50
  }

  res.json({
    success: true,
    data: stats
  })
}))

// Bulk update task order
const reorderTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string())
  })
})

router.patch('/reorder', validateRequest(reorderTasksSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { taskIds } = req.body

  // Update the order of each task
  const updatePromises = taskIds.map((taskId, index) =>
    prisma.task.updateMany({
      where: { id: taskId, userId },
      data: { order: index + 1 }
    })
  )

  await Promise.all(updatePromises)

  const updatedTasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, userId },
    include: {
      subtasks: true,
      attachments: true
    },
    orderBy: { order: 'asc' }
  })

  res.json({
    success: true,
    data: updatedTasks
  })
}))

export default router

