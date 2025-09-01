import { Router } from 'express'
import { prisma } from '../server'
import { GamificationService } from '../services/gamification'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()
const gamificationService = new GamificationService()

// Get user badges
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id

  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  })

  res.json({
    success: true,
    data: userBadges
  })
}))

// Get leaderboard
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const leaderboard = await gamificationService.getLeaderboard()

  res.json({
    success: true,
    data: leaderboard
  })
}))

// Get available badges
router.get('/available', asyncHandler(async (req, res) => {
  const badges = await prisma.badge.findMany({
    orderBy: { points: 'desc' }
  })

  res.json({
    success: true,
    data: badges
  })
}))

// Get badge details
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const badge = await prisma.badge.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { earnedAt: 'desc' },
        take: 10
      }
    }
  })

  if (!badge) {
    return res.status(404).json({
      success: false,
      error: 'Badge not found'
    })
  }

  res.json({
    success: true,
    data: badge
  })
}))

// Get user's progress towards badges
router.get('/progress/all', asyncHandler(async (req, res) => {
  const userId = req.user.id

  // Get all available badges
  const badges = await prisma.badge.findMany({
    orderBy: { points: 'asc' }
  })

  // Get user's current badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  })

  const earnedBadgeIds = userBadges.map(ub => ub.badgeId)

  // Get user stats for progress calculation
  const [
    completedTasks,
    totalTasks,
    completedModules,
    attendedMeetings,
    teamMembers,
    user
  ] = await Promise.all([
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.task.count({ where: { userId } }),
    prisma.learningModule.count({
      where: {
        learningPath: { userId },
        isCompleted: true
      }
    }),
    prisma.meeting.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.teamMember.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, points: true, level: true }
    })
  ])

  // Calculate progress for each badge
  const badgeProgress = badges.map(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id)
    let progress = 0
    let requirement = ''
    let current = 0
    let target = 1

    // Calculate progress based on badge criteria
    if (badge.name.includes('First Day Hero')) {
      current = completedTasks >= 1 ? 1 : 0
      target = 1
      progress = (current / target) * 100
      requirement = 'Complete your first task'
    } else if (badge.name.includes('Task Master')) {
      current = completedTasks
      target = 5
      progress = Math.min((current / target) * 100, 100)
      requirement = 'Complete 5 tasks'
    } else if (badge.name.includes('Onboarding Champion')) {
      current = completedTasks
      target = totalTasks
      progress = totalTasks > 0 ? Math.min((current / target) * 100, 100) : 0
      requirement = 'Complete all onboarding tasks'
    } else if (badge.name.includes('Knowledge Seeker')) {
      current = completedModules >= 1 ? 1 : 0
      target = 1
      progress = (current / target) * 100
      requirement = 'Complete your first learning module'
    } else if (badge.name.includes('Learning Enthusiast')) {
      current = completedModules
      target = 3
      progress = Math.min((current / target) * 100, 100)
      requirement = 'Complete 3 learning modules'
    } else if (badge.name.includes('Team Player')) {
      current = teamMembers
      target = 3
      progress = Math.min((current / target) * 100, 100)
      requirement = 'Connect with 3 team members'
    } else if (badge.name.includes('Networker')) {
      current = attendedMeetings
      target = 5
      progress = Math.min((current / target) * 100, 100)
      requirement = 'Attend 5 meetings'
    } else if (badge.name.includes('Early Bird')) {
      const daysActive = user ? Math.ceil((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
      current = daysActive >= 3 ? 1 : 0
      target = 1
      progress = daysActive >= 3 ? 100 : (daysActive / 3) * 100
      requirement = 'Stay active for 3 days'
    } else if (badge.name.includes('Dedicated')) {
      const daysActive = user ? Math.ceil((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
      current = daysActive >= 7 ? 1 : 0
      target = 1
      progress = daysActive >= 7 ? 100 : (daysActive / 7) * 100
      requirement = 'Stay active for 7 days'
    }

    return {
      badge,
      isEarned,
      progress: Math.round(progress),
      current,
      target,
      requirement
    }
  })

  res.json({
    success: true,
    data: {
      badges: badgeProgress,
      summary: {
        earnedCount: earnedBadgeIds.length,
        totalCount: badges.length,
        totalPoints: userBadges.length * 100, // Assuming each badge is worth 100 points
        nextBadge: badgeProgress.find(bp => !bp.isEarned && bp.progress > 0)
      }
    }
  })
}))

// Force check for badge unlocks (useful for testing)
router.post('/check-unlocks', asyncHandler(async (req, res) => {
  const userId = req.user.id
  
  const newBadges = await gamificationService.checkBadgeUnlocks(userId)
  
  res.json({
    success: true,
    data: {
      newBadges,
      message: `Found ${newBadges.length} new badges`
    }
  })
}))

// Get badge statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const [
    totalBadges,
    raretyBreakdown,
    categoryBreakdown,
    topEarners,
    recentlyEarned
  ] = await Promise.all([
    prisma.badge.count(),
    prisma.badge.groupBy({
      by: ['rarity'],
      _count: { rarity: true }
    }),
    prisma.badge.groupBy({
      by: ['category'],
      _count: { category: true }
    }),
    prisma.userBadge.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    }),
    prisma.userBadge.findMany({
      include: {
        badge: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { earnedAt: 'desc' },
      take: 10
    })
  ])

  res.json({
    success: true,
    data: {
      totalBadges,
      rarityBreakdown: raretyBreakdown.reduce((acc, item) => {
        acc[item.rarity] = item._count.rarity
        return acc
      }, {} as Record<string, number>),
      categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
        acc[item.category] = item._count.category
        return acc
      }, {} as Record<string, number>),
      topEarners,
      recentlyEarned
    }
  })
}))

export default router