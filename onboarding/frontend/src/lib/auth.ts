import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'sqlite',
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            firstName: {
                type: 'string',
                required: false,
                input: true,
            },
            lastName: {
                type: 'string',
                required: false,
                input: true,
            },
            role: {
                type: 'string',
                required: false,
                input: true,
            },
            department: {
                type: 'string',
                required: false,
                input: true,
            },
            avatar: {
                type: 'string',
                required: false,
                input: true,
            },
            onboardingStep: {
                type: 'number',
                required: false,
                input: false,
            },
            totalSteps: {
                type: 'number',
                required: false,
                input: false,
            },
            points: {
                type: 'number',
                required: false,
                input: false,
            },
            level: {
                type: 'number',
                required: false,
                input: false,
            },
            experience: {
                type: 'number',
                required: false,
                input: false,
            },
            startDate: {
                type: 'date',
                required: false,
                input: true,
            },
            status: {
                type: 'string',
                required: false,
                input: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
});
