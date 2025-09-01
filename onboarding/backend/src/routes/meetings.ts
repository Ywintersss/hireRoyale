import { Router } from 'express'
import { prisma } from '../server'
import { validateRequest } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

// Get user meetings
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { status, type } = req.query

    const where: any = { userId }

    if (status) where.status = status
    if (type) where.type = type

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        attendees: true
      },
      orderBy: { startTime: 'asc' }
    })

    res.json({
      success: true,
      data: meetings
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get meetings'
    })
  }
})

// Create meeting
router.post('/', validateRequest(z.object({
  body: z.object({
    title: z.string(),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    type: z.enum(['ONE_ON_ONE', 'TEAM', 'TRAINING', 'REVIEW', 'ORIENTATION']),
    location: z.string().optional(),
    isVirtual: z.boolean().optional(),
    meetingUrl: z.string().optional(),
    attendees: z.array(z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.string(),
      avatar: z.string().optional()
    })).optional()
  })
})), async (req, res) => {
  try {
    const userId = req.user.id
    const { attendees, ...meetingData } = req.body

    const meeting = await prisma.meeting.create({
      data: {
        ...meetingData,
        userId,
        startTime: new Date(meetingData.startTime),
        endTime: new Date(meetingData.endTime)
      }
    })

    if (attendees && attendees.length > 0) {
      await prisma.meetingAttendee.createMany({
        data: attendees.map(attendee => ({
          ...attendee,
          meetingId: meeting.id
        }))
      })
    }

    const createdMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: { attendees: true }
    })

    res.status(201).json({
      success: true,
      data: createdMeeting
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    })
  }
})

// Update meeting status
router.patch('/:id/status', validateRequest(z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })
})), async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { status } = req.body

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId }
    })

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      })
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { status },
      include: { attendees: true }
    })

    res.json({
      success: true,
      data: updatedMeeting
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting'
    })
  }
})

export default router

