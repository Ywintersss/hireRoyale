import { prisma } from '../server'
import { logger } from '../server'

export interface BadgeUnlock {
  badgeId: string
  badgeName: string
  points: number
  rarity: string
  category: string
}

export class GamificationService {
  private readonly POINTS_PER_TASK = 50
  private readonly POINTS_PER_LEARNING_MODULE = 25
  private readonly POINTS_PER_MEETING = 30
  private readonly POINTS_PER_DAY_ACTIVE = 10
  private readonly POINTS_PER_BADGE = 100

  async checkBadgeUnlocks(userId: string): Promise<BadgeUnlock[]> {
    try {
      const user = await this.getUserWithProgress(userId)
      const newBadges: BadgeUnlock[] = []

      // Check task completion badges
      const taskBadges = await this.checkTaskCompletionBadges(user)
      newBadges.push(...taskBadges)

      // Check learning badges
      const learningBadges = await this.checkLearningBadges(user)
      newBadges.push(...learningBadges)

      // Check social badges
      const socialBadges = await this.checkSocialBadges(user)
      newBadges.push(...socialBadges)

      // Check time-based badges
      const timeBadges = await this.checkTimeBasedBadges(user)
      newBadges.push(...timeBadges)

      // Award badges and update user
      for (const badge of newBadges) {
        await this.awardBadge(userId, badge.badgeId, badge.points)
      }

      return newBadges
    } catch (error) {
      logger.error('Error checking badge unlocks:', error)
      return []
    }
  }

  async calculatePoints(userId: string): Promise<number> {
    try {
      const user = await this.getUserWithProgress(userId)
      let totalPoints = 0

      // Points from completed tasks
      const completedTasks = await prisma.task.count({
        where: { userId, status: 'COMPLETED' }
      })
      totalPoints += completedTasks * this.POINTS_PER_TASK

      // Points from learning modules
      const completedModules = await prisma.learningModule.count({
        where: {
          learningPath: { userId },
          isCompleted: true
        }
      })
      totalPoints += completedModules * this.POINTS_PER_LEARNING_MODULE

      // Points from meetings attended
      const attendedMeetings = await prisma.meeting.count({
        where: { userId, status: 'COMPLETED' }
      })
      totalPoints += attendedMeetings * this.POINTS_PER_MEETING

      // Points from badges earned
      const earnedBadges = await prisma.userBadge.count({
        where: { userId }
      })
      totalPoints += earnedBadges * this.POINTS_PER_BADGE

      // Points from active days
      const daysActive = this.calculateDaysActive(user.createdAt)
      totalPoints += daysActive * this.POINTS_PER_DAY_ACTIVE

      return totalPoints
    } catch (error) {
      logger.error('Error calculating points:', error)
      return 0
    }
  }

  async updateUserLevel(userId: string): Promise<number> {
    try {
      const points = await this.calculatePoints(userId)
      const newLevel = Math.floor(points / 1000) + 1

      await prisma.user.update({
        where: { id: userId },
        data: { 
          points,
          level: newLevel,
          experience: points % 1000
        }
      })

      return newLevel
    } catch (error) {
      logger.error('Error updating user level:', error)
      return 1
    }
  }

  private async checkTaskCompletionBadges(user: any): Promise<BadgeUnlock[]> {
    const newBadges: BadgeUnlock[] = []
    const completedTasks = await prisma.task.count({
      where: { userId: user.id, status: 'COMPLETED' }
    })

    // First Day Hero - Complete first task
    if (completedTasks === 1) {
      const badge = await this.getOrCreateBadge('First Day Hero', 'Complete your first onboarding task', 'Trophy', 'COMMON', 100, 'task')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    // Task Master - Complete 5 tasks
    if (completedTasks === 5) {
      const badge = await this.getOrCreateBadge('Task Master', 'Complete 5 onboarding tasks', 'CheckCircle', 'RARE', 250, 'task')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    // Onboarding Champion - Complete all tasks
    const totalTasks = await prisma.task.count({ where: { userId: user.id } })
    if (completedTasks === totalTasks && totalTasks > 0) {
      const badge = await this.getOrCreateBadge('Onboarding Champion', 'Complete all onboarding tasks', 'Award', 'LEGENDARY', 1000, 'task')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    return newBadges
  }

  private async checkLearningBadges(user: any): Promise<BadgeUnlock[]> {
    const newBadges: BadgeUnlock[] = []
    const completedModules = await prisma.learningModule.count({
      where: {
        learningPath: { userId: user.id },
        isCompleted: true
      }
    })

    // Knowledge Seeker - Complete first learning module
    if (completedModules === 1) {
      const badge = await this.getOrCreateBadge('Knowledge Seeker', 'Complete your first learning module', 'BookOpen', 'COMMON', 100, 'learning')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    // Learning Enthusiast - Complete 3 learning modules
    if (completedModules === 3) {
      const badge = await this.getOrCreateBadge('Learning Enthusiast', 'Complete 3 learning modules', 'GraduationCap', 'RARE', 300, 'learning')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    return newBadges
  }

  private async checkSocialBadges(user: any): Promise<BadgeUnlock[]> {
    const newBadges: BadgeUnlock[] = []
    const teamMembers = await prisma.teamMember.count({
      where: { userId: user.id }
    })

    // Team Player - Meet 3 team members
    if (teamMembers >= 3) {
      const badge = await this.getOrCreateBadge('Team Player', 'Connect with 3 team members', 'Users', 'RARE', 300, 'social')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    // Networker - Attend 5 meetings
    const attendedMeetings = await prisma.meeting.count({
      where: { userId: user.id, status: 'COMPLETED' }
    })
    if (attendedMeetings >= 5) {
      const badge = await this.getOrCreateBadge('Networker', 'Attend 5 meetings', 'Calendar', 'EPIC', 500, 'social')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    return newBadges
  }

  private async checkTimeBasedBadges(user: any): Promise<BadgeUnlock[]> {
    const newBadges: BadgeUnlock[] = []
    const daysActive = this.calculateDaysActive(user.createdAt)

    // Early Bird - Active for 3 days
    if (daysActive >= 3) {
      const badge = await this.getOrCreateBadge('Early Bird', 'Stay active for 3 days', 'Sun', 'COMMON', 150, 'time')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    // Dedicated - Active for 7 days
    if (daysActive >= 7) {
      const badge = await this.getOrCreateBadge('Dedicated', 'Stay active for 7 days', 'Clock', 'RARE', 400, 'time')
      if (await this.shouldAwardBadge(user.id, badge.id)) {
        newBadges.push({
          badgeId: badge.id,
          badgeName: badge.name,
          points: badge.points,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    return newBadges
  }

  private async getOrCreateBadge(name: string, description: string, icon: string, rarity: string, points: number, category: string) {
    let badge = await prisma.badge.findUnique({
      where: { name }
    })

    if (!badge) {
      badge = await prisma.badge.create({
        data: {
          name,
          description,
          icon,
          rarity,
          points,
          category
        }
      })
    }

    return badge
  }

  private async shouldAwardBadge(userId: string, badgeId: string): Promise<boolean> {
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    })

    return !existingBadge
  }

  private async awardBadge(userId: string, badgeId: string, points: number) {
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId
      }
    })

    // Update user points
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points
        }
      }
    })
  }

  private async getUserWithProgress(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: { badge: true }
        }
      }
    })
  }

  private calculateDaysActive(createdAt: Date): number {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.min(diffDays, 30) // Cap at 30 days for points calculation
  }

  async getLeaderboard(): Promise<any[]> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          points: true,
          level: true,
          badges: {
            include: { badge: true }
          }
        },
        orderBy: { points: 'desc' },
        take: 10
      })

      return users.map(user => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        badgeCount: user.badges.length
      }))
    } catch (error) {
      logger.error('Error getting leaderboard:', error)
      return []
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      const user = await this.getUserWithProgress(userId)
      const completedTasks = await prisma.task.count({
        where: { userId, status: 'COMPLETED' }
      })
      const totalTasks = await prisma.task.count({
        where: { userId }
      })
      const completedModules = await prisma.learningModule.count({
        where: {
          learningPath: { userId },
          isCompleted: true
        }
      })
      const attendedMeetings = await prisma.meeting.count({
        where: { userId, status: 'COMPLETED' }
      })

      return {
        points: user?.points || 0,
        level: user?.level || 1,
        experience: user?.experience || 0,
        completedTasks,
        totalTasks,
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        completedModules,
        attendedMeetings,
        badgesEarned: user?.badges?.length || 0,
        daysActive: this.calculateDaysActive(user?.createdAt || new Date())
      }
    } catch (error) {
      logger.error('Error getting user stats:', error)
      return {
        points: 0,
        level: 1,
        experience: 0,
        completedTasks: 0,
        totalTasks: 0,
        taskCompletionRate: 0,
        completedModules: 0,
        attendedMeetings: 0,
        badgesEarned: 0,
        daysActive: 0
      }
    }
  }
}



