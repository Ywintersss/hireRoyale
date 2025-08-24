import { PrismaClient } from '../../app/generated/prisma/index.js';
import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../types/types.ts';

const prisma = new PrismaClient()

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const session = req.auth;
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id; // 👈 authenticated user’s ID
        const formData = req.body;

        const newEvent = await prisma.event.create({
            data: {
                name: formData.name,
                description: formData.description || null,
                date: formData.date ? new Date(formData.date) : null,
                time: formData.time ? new Date(formData.time) : null,
                requirements: formData.requirements || null,
                status: "Pending",
                maxParticipants: formData.maxParticipants
                    ? parseInt(formData.maxParticipants, 10)
                    : null,
                industry: formData.industry || null,
                level: formData.level || null,
                imgUrl: formData.imgUrl || null,
                createdById: userId,
            },
        });

        return res.status(201).json(newEvent);
    } catch (err: any) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Failed to create event" });
    }
}

export const getEvents = (req: Request, res: Response) => {
    res.json({ message: '' })
}

export const updateEvent = (req: Request, res: Response) => {
}

export const deleteEvent = (req: Request, res: Response) => {

}

