import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8001'

class SocketManager {
  private socket: Socket | null = null
  private isConnected = false

  connect(userId: string) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.isConnected = true
      
      // Join user's personal room
      this.socket?.emit('join-user', userId)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isSocketConnected(): boolean {
    return this.isConnected
  }

  // Task updates
  onTaskUpdate(callback: (task: any) => void) {
    this.socket?.on('task-updated', callback)
  }

  updateTask(userId: string, taskId: string, status: string) {
    this.socket?.emit('task-update', { userId, taskId, status })
  }

  // Progress updates
  onProgressUpdate(callback: (data: any) => void) {
    this.socket?.on('progress-updated', callback)
  }

  updateProgress(userId: string, step: number, percentage: number) {
    this.socket?.emit('progress-update', { userId, step, percentage })
  }

  // Badge updates
  onBadgeEarned(callback: (badges: any[]) => void) {
    this.socket?.on('badges-earned', callback)
  }

  // AI chat
  onAIResponse(callback: (response: any) => void) {
    this.socket?.on('ai-response', callback)
  }

  onAIError(callback: (error: any) => void) {
    this.socket?.on('ai-error', callback)
  }

  sendAIMessage(userId: string, message: string) {
    this.socket?.emit('ai-message', { userId, message })
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event)
  }

  offAll() {
    this.socket?.off()
  }
}

// Create singleton instance
export const socketManager = new SocketManager()

// React hook for socket connection
export const useSocket = () => {
  const { user } = useAuthStore()

  const connect = () => {
    if (user?.id) {
      return socketManager.connect(user.id)
    }
    return null
  }

  const disconnect = () => {
    socketManager.disconnect()
  }

  return {
    socket: socketManager.getSocket(),
    isConnected: socketManager.isSocketConnected(),
    connect,
    disconnect,
    socketManager
  }
}

export default socketManager



