import { PrismaClient } from '../../app/generated/prisma/index.js';
import type { Request, Response } from 'express'
import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { scheduleLobbyCreation } from '../timed/timedLobbyCreation.js';

const prisma = new PrismaClient()

export const createEvent = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
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

        await prisma.userEvent.create({
            data: {
                userId: userId,
                eventId: newEvent.id
            }
        })

        return res.status(201).json(newEvent);
    } catch (err: any) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Failed to create event" });
    }
}

export const getEvents = async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
        include: {
            participants: {
                include: {
                    user: {
                        include: {
                            role: true
                        }
                    }
                }
            },
            createdBy: true
        },
        take: 10
    })
    res.json({ events: events })
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { eventId } = req.params;
        const formData = req.body;

        const updateEvent = await prisma.event.update({
            where: {
                id: eventId as string,
            },
            data: {
                ...formData,
                date: new Date(`${formData.date}T00:00:00`),
                time: new Date(`${formData.date}T${formData.time}:00`),
                maxParticipants: Number(formData.maxParticipants),
            }
        })

        return res.status(201).json(updateEvent)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to update event" })

    }
}

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { eventId } = req.params

        const status = await prisma.event.delete({
            where: {
                id: eventId as string
            }
        })

        return res.status(201).json(status)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to delete event" })
    }

}

export const joinEvent = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
        const formData = req.body;

        await prisma.userEvent.create({
            data: {
                userId: userId,
                eventId: formData.eventId
            }
        })

        const recruiterCount = await prisma.userEvent.count({
            where: {
                user: {
                    role: {
                        name: 'Recruiter'
                    }
                },
                eventId: formData.eventId
            }
        })

        const totalUserInEvent = await prisma.userEvent.count({
            where: {
                eventId: formData.eventId
            }
        })

        console.log(recruiterCount)

        if (recruiterCount == 5) {
            await prisma.event.update({
                where: {
                    id: formData.eventId
                },
                data: {
                    status: 'Approved'
                }
            })
        }

        if (totalUserInEvent >= 10) {
            scheduleLobbyCreation(formData.eventId, `Event on ${new Date().toDateString()}`)

        }

        return res.status(201).json({ status: 'Success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to join event" })
    }
}

export const leaveEvent = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
        const { eventId } = req.params

        const status = await prisma.userEvent.delete({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId as string,
                },
            }
        })

        await prisma.jobRequirement.deleteMany({
            where: {
                userId: userId
            }
        })

        return res.status(201).json(status)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to leave event" })
    }
}

//temporary
export const createEventLobby = async (req: Request, res: Response) => {
    const { eventId, lobbyName } = req.body;

    // create lobby for the event
    const lobby = await prisma.lobby.create({
        data: {
            name: lobbyName,
            eventId: eventId
        }
    });

    if (!lobby) {
        return res.status(500).json({ error: "Failed to create lobby" });
    }

    const event = await prisma.event.update({
        where: {
            id: eventId
        },
        data: {
            status: "active"
        }
    })

    if (!event) {
        return res.status(500).json({ error: "Failed to update event status" });
    }

    return res.status(201).json(lobby);
}

export const getOneEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params
    const events = await prisma.event.findFirst({
        include: {
            participants: {
                include: {
                    user: {
                        include: {
                            role: true
                        }
                    }
                }
            },
            createdBy: true
        },
        where: {
            id: eventId as string
        }
    })
    res.json(events)
}

export const createJobPosting = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;
        const { eventId } = req.params
        const data = req.body

        const posting = await prisma.jobRequirement.create({
            data: {
                ...data,
                requiredSkills: data.requiredSkills.join(','),
                eventId: eventId,
                userId: userId
            }
        })

        return res.status(201).json(posting)
    } catch (error) {
        res.status(500).json({ error: "Failed to add job posting" })
    }
}

export const getJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.jobRequirement.findMany()

        return res.status(201).json(jobs)
    } catch (error) {
        res.status(500).json({ error: "Failed to add job posting" })
    }

}
