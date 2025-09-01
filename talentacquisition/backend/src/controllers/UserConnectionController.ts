import type { Request, Response } from 'express'
import { auth } from '../lib/auth.js';
import { getSession } from '../lib/auth.js';
import type { ConnectionData, RoomData } from '../types/types.ts';
import { PrismaClient } from '../../app/generated/prisma/index.js';

const prisma = new PrismaClient()

export class UserConnectionController {
    private connections: Map<string, ConnectionData> = new Map();
    private rooms: Map<string, RoomData> = new Map();

    constructor() {
    }

    public addConnection(connectionId: string, connection: ConnectionData) {
        this.connections.set(connectionId, connection)
    }

    public removeConnection(connectionId: string) {
        this.connections.delete(connectionId)
    }

    public getConnection(connectionId: string) {
        return this.connections.get(connectionId)
    }

    public getAllConnections() {
        return this.connections
    }

    public addRoom(roomId: string, room: RoomData) {
        this.rooms.set(roomId, room)
    }

    public removeRoom(roomId: string) {
        this.rooms.delete(roomId)
    }

    public getRoom(roomId: string) {
        return this.rooms.get(roomId)
    }

    public getConnectionData = async (req: Request, res: Response) => {
        const { roomId } = req.params

        const roomData = this.rooms.get(roomId as string)
        res.status(201).json({ connectionInfo: this.connections.get(roomData!.lobbyId) })
    }

    public getAllRooms() {
        return this.rooms
    }

    public createConnection = async (req: Request, res: Response) => {
        try {
            const { applicantId, eventId, recruiterId } = req.body
            const lobby = await prisma.lobby.findFirst({
                where: {
                    eventId: eventId
                }
            })

            const connectionId = lobby?.id

            const connection: ConnectionData = {
                applicantId: applicantId as string,
                eventId: eventId as string,
                recruiterId: recruiterId as string,
                lobbyId: lobby?.id as string
            }


            this.addConnection(connectionId as string, connection)

            res.status(201).json({ connectionId: connectionId, connection: this.getConnection(connectionId as string) })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error, message: "Failed to add connection" })

        }

    }

    public createRoom = async (req: Request, res: Response) => {
        try {
            const { applicantId, lobbyId, recruiterId } = req.body
            const roomId = crypto.randomUUID()

            const room: RoomData = {
                applicantId: applicantId as string,
                recruiterId: recruiterId as string,
                lobbyId: lobbyId
            }


            this.addRoom(roomId, room)

            res.status(201).json({ roomId: roomId, room: this.getRoom(roomId) })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error, message: "Failed to add room" })

        }
    }
}

