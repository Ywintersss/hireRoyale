import { PrismaClient } from '../app/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
    // 1. Define permissions
    const permissions = [
        // User permissions
        { name: 'upload_resume' },
        { name: 'view_resume' },
        { name: 'view_events' },
        { name: 'join_event' },
        { name: 'leave_event' },

        // Recruiter permissions
        { name: 'create_event' },
        { name: 'manage_event' },  // update/cancel, etc.

        // Admin permissions
        { name: 'manage_users' },
        { name: 'manage_roles' },
        { name: 'manage_events' },
    ]

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        })
    }

    // 2. Create roles
    const roles = ['User', 'Recruiter', 'Admin']
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        })
    }

    // 3. Assign permissions to roles
    // User role
    const userRole = await prisma.role.findUnique({ where: { name: 'User' } })
    const userPerms = ['upload_resume', 'view_resume', 'view_events', 'join_event', 'leave_event']
    for (const permName of userPerms) {
        const perm = await prisma.permission.findUnique({ where: { name: permName } })
        if (perm && userRole) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
                update: {},
                create: { roleId: userRole.id, permissionId: perm.id },
            })
        }
    }

    // Recruiter role
    const recruiterRole = await prisma.role.findUnique({ where: { name: 'Recruiter' } })
    const recruiterPerms = [
        'view_resume', 'view_events', 'join_event', 'leave_event',
        'create_event', 'manage_event'
    ]
    for (const permName of recruiterPerms) {
        const perm = await prisma.permission.findUnique({ where: { name: permName } })
        if (perm && recruiterRole) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: recruiterRole.id, permissionId: perm.id } },
                update: {},
                create: { roleId: recruiterRole.id, permissionId: perm.id },
            })
        }
    }

    // Admin role (all permissions)
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } })
    const adminPerms = permissions.map(p => p.name)
    for (const permName of adminPerms) {
        const perm = await prisma.permission.findUnique({ where: { name: permName } })
        if (perm && adminRole) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
                update: {},
                create: { roleId: adminRole.id, permissionId: perm.id },
            })
        }
    }

    console.log('✅ Seeding completed!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
