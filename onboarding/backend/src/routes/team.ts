import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../middleware/errorHandler';

const teamRouter = Router();

// Get team members
teamRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { department, isManager } = req.query;

        const where: any = { userId };
        if (department) where.department = department;
        if (isManager !== undefined) where.isManager = isManager === 'true';

        const teamMembers = await prisma.teamMember.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });

        res.json({
            success: true,
            data: teamMembers,
        });
    })
);

// Get team member details
teamRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        const teamMember = await prisma.teamMember.findFirst({
            where: { id, userId },
        });

        if (!teamMember) {
            return res.status(404).json({
                success: false,
                error: 'Team member not found',
            });
        }

        res.json({
            success: true,
            data: teamMember,
        });
    })
);

// Get team collaboration stats
teamRouter.get(
    '/stats/collaboration',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;

        const [
            totalTeamMembers,
            managers,
            meetingsScheduled,
            meetingsCompleted,
            teamIntroductions,
        ] = await Promise.all([
            prisma.teamMember.count({ where: { userId } }),
            prisma.teamMember.count({ where: { userId, isManager: true } }),
            prisma.meeting.count({ where: { userId, status: 'SCHEDULED' } }),
            prisma.meeting.count({ where: { userId, status: 'COMPLETED' } }),
            prisma.task.count({
                where: {
                    userId,
                    title: { contains: 'Team Introductions' },
                    status: 'COMPLETED',
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalTeamMembers,
                managers,
                meetingsScheduled,
                meetingsCompleted,
                teamIntroductions,
                collaborationScore: Math.round(
                    (meetingsCompleted / Math.max(totalTeamMembers, 1)) * 100
                ),
            },
        });
    })
);

export default teamRouter
