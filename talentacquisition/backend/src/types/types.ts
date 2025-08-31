import type { Request } from "express";
import type { Session, User } from "better-auth"; // adjust types to what BetterAuth gives you

export interface AuthenticatedRequest extends Request {
    auth?: {
        user: User | null;
        session: Session | null;
    };
}

export interface RoomData {
    applicantId: string;
    recruiterId: string;
    lobbyId: string
}

export interface ConnectionData {
    eventId: string;
    applicantId: string;
    recruiterId: string;
    lobbyId: string
}

export interface UserEvent {
    userId: string;
    eventId: string;
    user: User;
    event: Event;
}

export interface Event {
    id: string;
    name: string;
    description?: string;
    date?: Date;
    time?: Date;
    requirements?: string;
    status?: string;
    maxParticipants?: number;
    industry?: string;
    level?: string;
    imgUrl?: string;
    createdBy: User;
    participants: UserEvent[];
    _count?: {
        participants: number;
    };
}
