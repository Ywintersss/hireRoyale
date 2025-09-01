import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js"; // your Better Auth instance
import { fromNodeHeaders } from "better-auth/node";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        (req as any).user = session.user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
}
