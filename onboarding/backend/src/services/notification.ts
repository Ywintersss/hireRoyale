import { prisma } from '../server'
import { logger } from '../server'

export class NotificationService {
  async createNotification(userId: string, title: string, message: string, type: string = 'INFO') {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type
        }
      })

      logger.info(`Notification created for user ${userId}: ${title}`)
      return notification
    } catch (error) {
      logger.error('Error creating notification:', error)
      throw error
    }
  }

  async createTaskCompletionNotification(userId: string, taskTitle: string) {
    return this.createNotification(
      userId,
      'Task Completed! 🎉',
      `Congratulations! You've completed "${taskTitle}". Keep up the great work!`,
      'SUCCESS'
    )
  }

  async createBadgeEarnedNotification(userId: string, badgeName: string) {
    return this.createNotification(
      userId,
      'Badge Earned! 🏆',
      `You've earned the "${badgeName}" badge! Your hard work is paying off!`,
      'SUCCESS'
    )
  }

  async createMeetingReminderNotification(userId: string, meetingTitle: string, meetingTime: Date) {
    const timeString = meetingTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    return this.createNotification(
      userId,
      'Meeting Reminder 📅',
      `Don't forget! You have "${meetingTitle}" at ${timeString}.`,
      'REMINDER'
    )
  }

  async createLearningProgressNotification(userId: string, learningPathTitle: string, progress: number) {
    return this.createNotification(
      userId,
      'Learning Progress Update 📚',
      `Great progress! You're ${progress}% complete with "${learningPathTitle}".`,
      'INFO'
    )
  }

  async createWelcomeNotification(userId: string, firstName: string) {
    return this.createNotification(
      userId,
      'Welcome to HireRoyale! 👋',
      `Hi ${firstName}! Welcome to your onboarding journey. We're excited to have you on board!`,
      'INFO'
    )
  }

  async createLevelUpNotification(userId: string, newLevel: number) {
    return this.createNotification(
      userId,
      'Level Up! ⬆️',
      `Congratulations! You've reached level ${newLevel}! Your dedication is impressive!`,
      'SUCCESS'
    )
  }

  async createTeamIntroductionNotification(userId: string, teamMemberName: string) {
    return this.createNotification(
      userId,
      'New Team Connection 🤝',
      `You've connected with ${teamMemberName}! Building relationships is key to success.`,
      'INFO'
    )
  }

  async createOverdueTaskNotification(userId: string, taskTitle: string) {
    return this.createNotification(
      userId,
      'Task Overdue ⏰',
      `The task "${taskTitle}" is overdue. Consider prioritizing it in your schedule.`,
      'WARNING'
    )
  }

  async createAchievementNotification(userId: string, achievement: string) {
    return this.createNotification(
      userId,
      'Achievement Unlocked! 🎯',
      `You've achieved: ${achievement}! Your progress is outstanding!`,
      'SUCCESS'
    )
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, isRead: false }
      })
    } catch (error) {
      logger.error('Error getting unread notification count:', error)
      return 0
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      })
      
      logger.info(`All notifications marked as read for user ${userId}`)
    } catch (error) {
      logger.error('Error marking notifications as read:', error)
      throw error
    }
  }

  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      await prisma.notification.deleteMany({
        where: {
          userId,
          createdAt: { lt: cutoffDate },
          isRead: true
        }
      })

      logger.info(`Old notifications deleted for user ${userId}`)
    } catch (error) {
      logger.error('Error deleting old notifications:', error)
      throw error
    }
  }
}



