import { Router } from 'express'
import { prisma } from '../server'
import { GamificationService } from '../services/gamification'
import { asyncHandler } from '../middleware/errorHandler'
import { validateRequest } from '../middleware/validation'
import { z } from 'zod'

const router = Router()
const gamificationService = new GamificationService()

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: {
        include: { badge: true }
      },
      teamMembers: true
    }
  })

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  // Remove sensitive data from response
  const { password, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: userWithoutPassword
  })
}))

// Get user stats
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const stats = await gamificationService.getUserStats(userId)

  res.json({
    success: true,
    data: stats
  })
}))

// Update user profile
const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    avatar: z.string().url().optional(),
    role: z.string().optional(),
    department: z.string().optional()
  })
})

router.put('/profile', validateRequest(updateProfileSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const updateData = req.body

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      avatar: true,
      onboardingStep: true,
      totalSteps: true,
      points: true,
      level: true,
      experience: true,
      startDate: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  })

  res.json({
    success: true,
    data: updatedUser
  })
}))

// Get dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const [
    user,
    taskStats,
    recentBadges,
    upcomingMeetings,
    learningProgress,
    recentNotifications
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        avatar: true,
        points: true,
        level: true,
        experience: true,
        onboardingStep: true,
        totalSteps: true
      }
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 5
    }),
    prisma.meeting.findMany({
      where: { userId, status: 'SCHEDULED' },
      orderBy: { startTime: 'asc' },
      take: 3
    }),
    prisma.learningPath.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        progress: true,
        isCompleted: true,
        category: true
      }
    }),
    prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  const dashboardData = {
    user,
    taskStats: taskStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>),
    recentBadges,
    upcomingMeetings,
    learningProgress,
    recentNotifications,
    unreadNotifications: recentNotifications.length
  }

  res.json({
    success: true,
    data: dashboardData
  })
}))

// Update onboarding progress
const progressSchema = z.object({
  body: z.object({
    step: z.number().min(1),
    totalSteps: z.number().min(1),
    percentage: z.number().min(0).max(100)
  })
})

router.patch('/progress', validateRequest(progressSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { step, totalSteps, percentage } = req.body

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStep: step,
      totalSteps,
      experience: percentage
    }
  })

  // Check for badge unlocks
  const newBadges = await gamificationService.checkBadgeUnlocks(userId)

  res.json({
    success: true,
    data: {
      user: updatedUser,
      newBadges
    }
  })
}))

// Get user achievements
router.get('/achievements', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const achievements = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' }
  })

  const stats = await gamificationService.getUserStats(userId)

  res.json({
    success: true,
    data: {
      achievements,
      stats,
      totalBadges: achievements.length,
      totalPoints: stats.points,
      currentLevel: stats.level
    }
  })
}))

export default router

