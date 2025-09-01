import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../middleware/errorHandler';

const notificationsRouter = Router();

// Get user notifications
notificationsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { page = 1, limit = 20, isRead } = req.query;

        const where: any = { userId };
        if (isRead !== undefined) where.isRead = isRead === 'true';

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });

        const total = await prisma.notification.count({ where });

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    })
);

// Mark notification as read
notificationsRouter.patch(
    '/:id/read',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        res.json({
            success: true,
            data: updatedNotification,
        });
    })
);

// Mark all notifications as read
notificationsRouter.patch(
    '/read-all',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    })
);

export { notificationsRouter };

// routes/learning.ts
import { Router } from 'express';
import { prisma } from '../server';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const learningRouter = Router();

// Get user learning paths
learningRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { category, isCompleted } = req.query;

        const where: any = { userId };
        if (category) where.category = category;
        if (isCompleted !== undefined)
            where.isCompleted = isCompleted === 'true';

        const learningPaths = await prisma.learningPath.findMany({
            where,
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        res.json({
            success: true,
            data: learningPaths,
        });
    })
);

// Get single learning path
learningRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        const learningPath = await prisma.learningPath.findFirst({
            where: { id, userId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!learningPath) {
            return res.status(404).json({
                success: false,
                error: 'Learning path not found',
            });
        }

        res.json({
            success: true,
            data: learningPath,
        });
    })
);

// Update module progress
learningRouter.patch(
    '/modules/:id/progress',
    validateRequest(
        z.object({
            body: z.object({
                progress: z.number().min(0).max(100),
                isCompleted: z.boolean().optional(),
            }),
        })
    ),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;
        const { progress, isCompleted } = req.body;

        // Verify the module belongs to the user
        const module = await prisma.learningModule.findFirst({
            where: { id: id as string },
            include: {
                learningPath: true,
            },
        });

        if (!module || module.learningPath?.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'Module not found or access denied',
            });
        }

        const updatedModule = await prisma.learningModule.update({
            where: { id },
            data: {
                progress,
                isCompleted: isCompleted || progress === 100,
            },
        });

        // Update learning path progress
        const allModules = await prisma.learningModule.findMany({
            where: { learningPathId: module.learningPathId },
        });

        const totalProgress =
            allModules.reduce((sum, m) => sum + m.progress, 0) /
            allModules.length;
        const isPathCompleted = allModules.every((m) => m.isCompleted);

        await prisma.learningPath.update({
            where: { id: module.learningPathId },
            data: {
                progress: Math.round(totalProgress),
                isCompleted: isPathCompleted,
            },
        });

        res.json({
            success: true,
            data: updatedModule,
        });
    })
);

export default notificationsRouter


