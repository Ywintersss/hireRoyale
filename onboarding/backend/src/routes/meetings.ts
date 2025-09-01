import { Router } from 'express';
import { prisma } from '../server';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const meetingsRouter = Router();

// Get user meetings
meetingsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status, type } = req.query;

        const where: any = { userId };
        if (status) where.status = status;
        if (type) where.type = type;

        const meetings = await prisma.meeting.findMany({
            where,
            include: {
                attendees: true,
            },
            orderBy: { startTime: 'asc' },
        });

        res.json({
            success: true,
            data: meetings,
        });
    })
);

// Create meeting
const createMeetingSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        type: z.enum([
            'ONE_ON_ONE',
            'TEAM',
            'TRAINING',
            'REVIEW',
            'ORIENTATION',
        ]),
        location: z.string().optional(),
        isVirtual: z.boolean().optional(),
        meetingUrl: z.string().optional(),
        attendees: z
            .array(
                z.object({
                    name: z.string(),
                    email: z.string().email(),
                    role: z.string(),
                    avatar: z.string().optional(),
                })
            )
            .optional(),
    }),
});

meetingsRouter.post(
    '/',
    validateRequest(createMeetingSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { attendees, ...meetingData } = req.body;

        const meeting = await prisma.meeting.create({
            data: {
                ...meetingData,
                userId,
                startTime: new Date(meetingData.startTime),
                endTime: new Date(meetingData.endTime),
            },
        });

        if (attendees && attendees.length > 0) {
            await prisma.meetingAttendee.createMany({
                data: attendees.map((attendee) => ({
                    ...attendee,
                    meetingId: meeting.id,
                })),
            });
        }

        const createdMeeting = await prisma.meeting.findUnique({
            where: { id: meeting.id },
            include: { attendees: true },
        });

        res.status(201).json({
            success: true,
            data: createdMeeting,
        });
    })
);

// Update meeting status
meetingsRouter.patch(
    '/:id/status',
    validateRequest(
        z.object({
            body: z.object({
                status: z.enum([
                    'SCHEDULED',
                    'IN_PROGRESS',
                    'COMPLETED',
                    'CANCELLED',
                ]),
            }),
        })
    ),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        const meeting = await prisma.meeting.findFirst({
            where: { id, userId },
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
            });
        }

        const updatedMeeting = await prisma.meeting.update({
            where: { id },
            data: { status },
            include: { attendees: true },
        });

        res.json({
            success: true,
            data: updatedMeeting,
        });
    })
);

export default meetingsRouter;


