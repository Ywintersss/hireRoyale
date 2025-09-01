import 'dotenv/config'
import { betterAuth } from "better-auth";
import { APIError } from 'better-auth/api';
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "../../app/generated/prisma/client.js";
import { customSession, emailOTP } from 'better-auth/plugins';
import { fromNodeHeaders } from 'better-auth/node';
import type { AuthenticatedRequest } from '../types/types.js';


const prisma = new PrismaClient();
export const auth = betterAuth({
    user: {
        additionalFields: {
            roleId: {
                type: "string",
                required: false,
                input: false,
            },
            roleName: {
                type: 'string',
                required: false,
                input: true
            },
            contact: {
                type: 'string',
                input: true
            },
            company: {
                type: 'string',
                input: true
            },
        },
    },
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    plugins: [
        customSession(async ({ user, session }) => {
            const userWithRole = await prisma.user.findUnique({
                where: { id: user.id },
                include: { role: true, },
            });
            return {
                user: userWithRole,
                session,
            };
        }),
    ],
    databaseHooks: {
        user: {
            create: {
                before:
                    async (data, ctx) => {
                        console.log(data)
                        if (data) {
                            // Look up the role in Prisma
                            try {
                                const role = await prisma.role.findUnique({
                                    where: { name: data.roleName as string },
                                });
                                console.log('role found')
                                console.log(role)

                                if (!role) {
                                    throw new APIError("BAD_REQUEST", { message: `Unknown role: ${data.roleName}` });
                                }

                                return {
                                    data: {
                                        ...data,
                                        roleId: role.id,
                                        roleName: undefined,
                                    }
                                }
                            } catch (error) {
                                console.log(error)
                            }

                        }
                    },

            }
        },
    },
});

export const getSession = (req: AuthenticatedRequest) => {
    const session = auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

    return session
};
