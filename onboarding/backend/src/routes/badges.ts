import { Router } from 'express'
import { prisma } from '../server'
import { GamificationService } from '../services/gamification'

const router = Router()
const gamificationService = new GamificationService()

// Get user badges
router.get('/', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get badges'
    })
  }
})

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await gamificationService.getLeaderboard()

    res.json({
      success: true,
      data: leaderboard
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    })
  }
})

// Get available badges
router.get('/available', async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { points: 'desc' }
    })

    res.json({
      success: true,
      data: badges
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get available badges'
    })
  }
})

export default router

