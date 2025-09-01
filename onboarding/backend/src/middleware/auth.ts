import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Required authentication middleware (replaces your authMiddleware)
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({ 
                success: false,
                error: "Access token required" 
            });
        }

        req.user = session.user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ 
            success: false,
            error: "Invalid token" 
        });
    }
}

// Optional authentication middleware (keeps user context if available)
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (session && session.user) {
            req.user = session.user;
        }

        next();
    } catch (error) {
        // Continue without user context
        next();
    }
}

// Alias for backward compatibility
export const authMiddleware = authenticateToken;