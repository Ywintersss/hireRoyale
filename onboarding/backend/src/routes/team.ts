import { Router } from 'express'
import { prisma } from '../server'

const router = Router()

// Get team members
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { department, isManager } = req.query

    const where: any = { userId }

    if (department) where.department = department
    if (isManager !== undefined) where.isManager = isManager === 'true'

    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })

    res.json({
      success: true,
      data: teamMembers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get team members'
    })
  }
})

// Get team member details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const teamMember = await prisma.teamMember.findFirst({
      where: { id, userId }
    })

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      })
    }

    res.json({
      success: true,
      data: teamMember
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get team member'
    })
  }
})

// Get team collaboration stats
router.get('/stats/collaboration', async (req, res) => {
  try {
    const userId = req.user.id

    const [
      totalTeamMembers,
      managers,
      meetingsScheduled,
      meetingsCompleted,
      teamIntroductions
    ] = await Promise.all([
      prisma.teamMember.count({ where: { userId } }),
      prisma.teamMember.count({ where: { userId, isManager: true } }),
      prisma.meeting.count({ where: { userId, status: 'SCHEDULED' } }),
      prisma.meeting.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { userId, title: { contains: 'Team Introductions' }, status: 'COMPLETED' } })
    ])

    res.json({
      success: true,
      data: {
        totalTeamMembers,
        managers,
        meetingsScheduled,
        meetingsCompleted,
        teamIntroductions,
        collaborationScore: Math.round((meetingsCompleted / Math.max(totalTeamMembers, 1)) * 100)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get collaboration stats'
    })
  }
})

export default router

