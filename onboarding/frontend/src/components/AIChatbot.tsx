'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardBody, Input, Button, ScrollShadow, Chip, Avatar, Spinner } from '@heroui/react'
import { Send, Bot, User, Sparkles, Lightbulb, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/auth'
import { aiAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  confidence?: number
  category?: string
  suggestedActions?: string[]
}

interface SuggestedQuestion {
  question: string
  category: string
  priority: string
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()
  const { socketManager } = useSocket()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load suggested questions
  useEffect(() => {
    if (isOpen && user) {
      loadSuggestedQuestions()
    }
  }, [isOpen, user])

  // Socket event listeners
  useEffect(() => {
    if (!user) return

    socketManager.onAIResponse((response) => {
      setIsTyping(false)
      addMessage({
        id: Date.now().toString(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        confidence: response.confidence,
        category: response.category,
        suggestedActions: response.suggestedActions
      })
    })

    socketManager.onAIError((error) => {
      setIsTyping(false)
      toast.error(error.message || 'AI service error')
    })

    return () => {
      socketManager.off('ai-response')
      socketManager.off('ai-error')
    }
  }, [user])

  const loadSuggestedQuestions = async () => {
    try {
      const response = await aiAPI.getSuggestedQuestions()
      setSuggestedQuestions(response.data)
    } catch (error) {
      console.error('Failed to load suggested questions:', error)
    }
  }

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputValue('')
    setIsTyping(true)

    // Send via socket for real-time response
    socketManager.sendAIMessage(user.id, inputValue)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return 'primary'
      case 'learning': return 'secondary'
      case 'social': return 'success'
      case 'technical': return 'warning'
      case 'policy': return 'danger'
      default: return 'default'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'danger'
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          isIconOnly
          size="lg"
          color="primary"
          className="w-16 h-16 rounded-full shadow-lg"
          onPress={() => setIsOpen(true)}
        >
          <Bot className="h-8 w-8" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-50 w-96 h-[600px]"
    >
      <Card className="w-full h-full shadow-2xl">
        <CardBody className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm opacity-90">Your onboarding guide</p>
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollShadow className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-600 mb-2">Welcome!</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    I'm here to help with your onboarding journey. Ask me anything!
                  </p>
                  
                  {/* Suggested Questions */}
                  <div className="space-y-2">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="bordered"
                        className="w-full justify-start text-left"
                        onPress={() => handleSuggestedQuestion(question.question)}
                      >
                        <Lightbulb className="h-3 w-3 mr-2" />
                        {question.question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar
                        size="sm"
                        src={message.sender === 'user' ? user?.avatar : undefined}
                        name={message.sender === 'user' ? `${user?.firstName} ${user?.lastName}` : 'AI Assistant'}
                        className={message.sender === 'user' ? 'order-2' : ''}
                      />
                      
                      <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.sender === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        
                        {/* AI Message Metadata */}
                        {message.sender === 'ai' && (
                          <div className="mt-2 flex items-center gap-2">
                            {message.category && (
                              <Chip size="sm" color={getCategoryColor(message.category)}>
                                {message.category}
                              </Chip>
                            )}
                            {message.confidence && (
                              <Chip size="sm" color={getConfidenceColor(message.confidence)}>
                                {Math.round(message.confidence * 100)}% confident
                              </Chip>
                            )}
                          </div>
                        )}
                        
                        {/* Suggested Actions */}
                        {message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.suggestedActions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="bordered"
                                className="text-xs"
                                onPress={() => handleSuggestedQuestion(action)}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <span className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <Avatar size="sm" name="AI Assistant" />
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Spinner size="sm" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollShadow>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about onboarding..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                isIconOnly
                color="primary"
                onPress={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}



