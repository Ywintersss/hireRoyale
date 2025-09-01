import { Router } from 'express'
import { prisma } from '../server'
import { GamificationService } from '../services/gamification'

const router = Router()
const gamificationService = new GamificationService()

// Get user profile
router.get('/profile', async (req, res) => {
  try {
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

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    })
  }
})

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id
    const stats = await gamificationService.getUserStats(userId)

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats'
    })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id
    const { firstName, lastName, avatar } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        avatar
      },
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
        startDate: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    })
  }
})

export default router

