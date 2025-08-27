import { PrismaClient } from '../../app/generated/prisma/index.js';
import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../types/types.ts';
import { auth, getSession } from '../lib/auth.ts';

interface AuthenticatedRequest extends Request {
    file?: Express.Multer.File;
}

const prisma = new PrismaClient()

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const session = await getSession(req)

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userData = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                resume: true
            }
        })
        // $queryRaw`SELECT * FROM user WHERE id = ${session.user.id}`

        if (!userData) {
            return res.status(500).json({ error: "No user found" });
        }


        res.json(userData)
    } catch (err) {
        console.error("Error:", err);
        res.status(401).json({ error: "Error Occured" });
    } 
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const session = await getSession(req)

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.body) {
            return res.status(400).json({ error: "No data provided" });
        }

        const { firstName, lastName, email, contact } = req.body

        const name = `${firstName} ${lastName}`

        const userData = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email,
                contact
            }
        })

        if (!userData) {
            return res.status(500).json({ error: "No user found" });
        }

        res.json(userData)
        // return res.status(200).json({ message: "User updated successfully" });
        // $queryRaw`SELECT * FROM user WHERE id = ${session.user.id}`
    } catch (err) {
        console.error("Error:", err);
        res.status(401).json({ error: "Error Occured" });
    } 
}

export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
    const session = await getSession(req)

    if (!session?.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const resume  = req.file.filename

    const newResume = await prisma.resume.create({
        data: {
            resumeUrl: resume,
        },
    });

    if (!newResume) {
        return res.status(500).json({ error: "Resume upload failed" });
    }

    const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            resumeId: newResume.id,
        },
        include: { resume: true }, 
    });

    return res.status(200).json({
        message: "Resume uploaded and linked successfully",
        user: updatedUser,
    });
}

export const updateResume = async (req: AuthenticatedRequest, res: Response) => {

}