import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../server'
import { validateRequest } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

// Login schema
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
})

// Register schema
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    role: z.string(),
    department: z.string(),
    startDate: z.string().datetime()
  })
})

// Login endpoint
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '')
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      })
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env['JWT_SECRET']!,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    })
  }
})

// Register endpoint
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department, startDate } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        department,
        startDate: new Date(startDate)
      }
    })

    // Create default onboarding tasks
    await createDefaultTasks(user.id, role)

    // Create default learning paths
    await createDefaultLearningPaths(user.id, role)

    // Create team members
    await createDefaultTeamMembers(user.id, department)

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env['JWT_SECRET']!,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    })
  }
})

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required'
      })
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        status: true,
        onboardingStep: true,
        totalSteps: true,
        points: true,
        level: true,
        avatar: true,
        startDate: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    })
  }
})

// Helper functions
async function createDefaultTasks(userId: string, role: string) {
  const defaultTasks = [
    {
      title: 'Complete HR Forms',
      description: 'Fill out all required HR documentation',
      priority: 'HIGH',
      estimatedTime: 15,
      order: 1,
      category: 'HR',
      icon: 'CheckCircle'
    },
    {
      title: 'Setup Development Environment',
      description: 'Configure your development tools and access',
      priority: 'CRITICAL',
      estimatedTime: 45,
      order: 2,
      category: 'Technical',
      icon: 'Github'
    },
    {
      title: 'Security Training',
      description: 'Complete mandatory security awareness training',
      priority: 'HIGH',
      estimatedTime: 30,
      order: 3,
      category: 'Compliance',
      icon: 'Shield'
    },
    {
      title: 'Team Introductions',
      description: 'Meet your team members and key stakeholders',
      priority: 'MEDIUM',
      estimatedTime: 20,
      order: 4,
      category: 'Social',
      icon: 'Users'
    },
    {
      title: 'Code Review Guidelines',
      description: 'Learn the code review process and standards',
      priority: 'MEDIUM',
      estimatedTime: 25,
      order: 5,
      category: 'Technical',
      icon: 'BookOpen'
    },
    {
      title: 'Deploy First Feature',
      description: 'Make your first code contribution',
      priority: 'HIGH',
      estimatedTime: 60,
      order: 6,
      category: 'Technical',
      icon: 'Zap'
    },
    {
      title: 'Performance Review Setup',
      description: 'Understand the performance review process',
      priority: 'LOW',
      estimatedTime: 15,
      order: 7,
      category: 'HR',
      icon: 'Target'
    },
    {
      title: 'Final Onboarding Review',
      description: 'Complete final onboarding assessment',
      priority: 'MEDIUM',
      estimatedTime: 30,
      order: 8,
      category: 'Review',
      icon: 'Star'
    }
  ]

  for (const task of defaultTasks) {
    await prisma.task.create({
      data: {
        ...task,
        userId
      }
    })
  }
}

async function createDefaultLearningPaths(userId: string, role: string) {
  const learningPaths = [
    {
      title: 'Company Culture & Values',
      description: 'Learn about our company culture and core values',
      role: 'all',
      category: 'Culture',
      duration: 30,
      modules: [
        {
          title: 'Welcome to the Company',
          description: 'Introduction to our mission and values',
          type: 'VIDEO',
          duration: 10,
          order: 1
        },
        {
          title: 'Company Policies',
          description: 'Important policies and guidelines',
          type: 'DOCUMENT',
          duration: 15,
          order: 2
        },
        {
          title: 'Culture Quiz',
          description: 'Test your understanding of our culture',
          type: 'QUIZ',
          duration: 5,
          order: 3
        }
      ]
    }
  ]

  // Add role-specific learning paths
  if (role.toLowerCase().includes('developer')) {
    learningPaths.push({
      title: 'Development Best Practices',
      description: 'Learn our development standards and practices',
      role: 'developer',
      category: 'Technical',
      duration: 60,
      modules: [
        {
          title: 'Code Standards',
          description: 'Our coding standards and conventions',
          type: 'DOCUMENT',
          duration: 20,
          order: 1
        },
        {
          title: 'Git Workflow',
          description: 'How we use Git and GitHub',
          type: 'VIDEO',
          duration: 15,
          order: 2
        },
        {
          title: 'Testing Practices',
          description: 'Testing standards and practices',
          type: 'INTERACTIVE',
          duration: 25,
          order: 3
        }
      ]
    })
  }

  for (const path of learningPaths) {
    const learningPath = await prisma.learningPath.create({
      data: {
        title: path.title,
        description: path.description,
        role: path.role,
        category: path.category,
        duration: path.duration,
        userId
      }
    })

    for (const module of path.modules) {
      await prisma.learningModule.create({
        data: {
          ...module,
          learningPathId: learningPath.id
        }
      })
    }
  }
}

async function createDefaultTeamMembers(userId: string, department: string) {
  const teamMembers = [
    {
      name: 'Sarah M.',
      role: 'Manager',
      department,
      avatar: 'https://i.pravatar.cc/150?img=2',
      isManager: true
    },
    {
      name: 'Mike L.',
      role: 'Tech Lead',
      department,
      avatar: 'https://i.pravatar.cc/150?img=3',
      isManager: false
    },
    {
      name: 'Lisa D.',
      role: 'Designer',
      department,
      avatar: 'https://i.pravatar.cc/150?img=4',
      isManager: false
    }
  ]

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: {
        ...member,
        userId
      }
    })
  }
}

export default router

