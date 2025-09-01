import { Router } from 'express'
import { prisma } from '../server'

const router = Router()

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20, isRead } = req.query

    const where: any = { userId }
    if (isRead !== undefined) where.isRead = isRead === 'true'

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.notification.count({ where })

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    })
  }
})

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    res.json({
      success: true,
      data: updatedNotification
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update notification'
    })
  }
})

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    })
  }
})

export default router

