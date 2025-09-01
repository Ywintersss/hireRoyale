import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { rateLimit } from 'express-rate-limit'
import winston from 'winston'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import taskRoutes from './routes/tasks'
import badgeRoutes from './routes/badges'
import meetingRoutes from './routes/meetings'
import aiRoutes from './routes/ai'
import notificationRoutes from './routes/notifications'
import learningRoutes from './routes/learning'
import teamRoutes from './routes/team'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { validateRequest } from './middleware/validation'

// Import services
import { AIService } from './services/ai'
import { NotificationService } from './services/notification'
import { GamificationService } from './services/gamification'

// Load environment variables
dotenv.config()

// Initialize Prisma
export const prisma = new PrismaClient()

// Initialize logger
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: process.env['LOG_FILE'] || './logs/app.log' 
    })
  ]
})

// Initialize Express app
const app = express()
const server = createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3001'],
    methods: ['GET', 'POST']
  }
})

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}))
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3001'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(limiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV']
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/tasks', authMiddleware, taskRoutes)
app.use('/api/badges', authMiddleware, badgeRoutes)
app.use('/api/meetings', authMiddleware, meetingRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)
app.use('/api/notifications', authMiddleware, notificationRoutes)
app.use('/api/learning', authMiddleware, learningRoutes)
app.use('/api/team', authMiddleware, teamRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`)

  // Join user to their personal room
  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`)
    logger.info(`User ${userId} joined their room`)
  })

  // Handle task updates
  socket.on('task-update', async (data: { userId: string, taskId: string, status: string }) => {
    try {
      // Update task in database
      const updatedTask = await prisma.task.update({
        where: { id: data.taskId },
        data: { status: data.status }
      })

      // Emit to user's room
      io.to(`user-${data.userId}`).emit('task-updated', updatedTask)

      // Check for badge unlocks
      const gamificationService = new GamificationService()
      const newBadges = await gamificationService.checkBadgeUnlocks(data.userId)
      
      if (newBadges.length > 0) {
        io.to(`user-${data.userId}`).emit('badges-earned', newBadges)
      }

      logger.info(`Task ${data.taskId} updated to ${data.status}`)
    } catch (error) {
      logger.error('Error updating task:', error)
    }
  })

  // Handle progress updates
  socket.on('progress-update', async (data: { userId: string, step: number, percentage: number }) => {
    try {
      // Log progress
      await prisma.progressLog.create({
        data: {
          userId: data.userId,
          step: data.step,
          percentage: data.percentage
        }
      })

      // Update user's onboarding step
      await prisma.user.update({
        where: { id: data.userId },
        data: { onboardingStep: data.step }
      })

      // Emit to user's room
      io.to(`user-${data.userId}`).emit('progress-updated', data)

      logger.info(`Progress updated for user ${data.userId}: step ${data.step}, ${data.percentage}%`)
    } catch (error) {
      logger.error('Error updating progress:', error)
    }
  })

  // Handle AI chat messages
  socket.on('ai-message', async (data: { userId: string, message: string }) => {
    try {
      const aiService = new AIService()
      const response = await aiService.processMessage(data.message, data.userId)

      // Save interaction
      await prisma.aIInteraction.create({
        data: {
          userId: data.userId,
          message: data.message,
          response: response.message,
          confidence: response.confidence,
          category: response.category
        }
      })

      // Emit response to user
      io.to(`user-${data.userId}`).emit('ai-response', response)

      logger.info(`AI response sent to user ${data.userId}`)
    } catch (error) {
      logger.error('Error processing AI message:', error)
      io.to(`user-${data.userId}`).emit('ai-error', { message: 'Sorry, I encountered an error. Please try again.' })
    }
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
const PORT = process.env['PORT'] || 8001

server.listen(PORT, () => {
  logger.info(`🚀 Onboarding server running on port ${PORT}`)
  logger.info(`📊 Environment: ${process.env['NODE_ENV']}`)
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`)
})

export { app, io, logger }

