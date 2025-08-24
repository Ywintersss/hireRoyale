import type { Request } from "express";
import type { Session, User } from "better-auth"; // adjust types to what BetterAuth gives you

export interface AuthenticatedRequest extends Request {
    auth?: {
        user: User | null;
        session: Session | null;
    };
}
