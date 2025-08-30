import { PrismaClient } from '../../app/generated/prisma/index.js';
import type { Request, Response } from 'express'
import { auth } from '../lib/auth.ts';
import { getSession } from '../lib/auth.ts';
import { fromNodeHeaders } from 'better-auth/node';

const prisma = new PrismaClient()

export const joinAndSyncEventLobbyConnection = async (req: Request, res: Response) => {
    try {
        const session = await getSession(req)

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ error: "Event ID is required" });
        }

        const lobby = await prisma.lobby.findUnique({
            where: {
                eventId: eventId
            }
        })

        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        const connection = await prisma.eventConnection.create({
            data: {
                userId: userId,
                lobbyId: lobby.id,
            }
        })

        if (!connection) {
            return res.status(500).json({ error: "Failed to create connection" });
        }

        return res.status(201).json({ status: 'Success', connection })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to join event" })
    }
}

export const leaveAndSyncEventLobbyConnection = async (req: Request, res: Response) => {
    try {
        const session = await getSession(req)

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
        const { eventId } = req.body;

        const lobby = await prisma.lobby.findUnique({
            where: {
                eventId: eventId
            }
        })

        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        const connection = await prisma.eventConnection.delete({
            where: {
                userId_lobbyId: {
                    userId: userId,
                    lobbyId: lobby.id
                },
            }
        })

        if (!connection) {
            return res.status(500).json({ error: "Failed to delete connection" });
        }

        return res.status(201).json({ status: 'Success', connection })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to join event" })
    }
}