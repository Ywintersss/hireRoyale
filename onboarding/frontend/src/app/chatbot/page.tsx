'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardBody, Input, Button, Avatar } from '@heroui/react'
import { Send, Bot, User } from 'lucide-react'

type Message = {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

const botResponses = {
    'leave': 'To request leave, go to the HR portal and submit a leave request form. Your manager will need to approve it.',
    'expenses': 'Expense approvals go through your direct manager. Submit receipts through the expense portal.',
    'deploy': 'To deploy code to staging, use the CI/CD pipeline. Check the deployment guide in the knowledge base.',
    'environment': 'Your development environment setup guide is available in the onboarding materials. Need help with Docker?',
    'policy': 'Company policies are available in the HR portal. You can also ask me specific questions about any policy.',
    'default': 'I\'m here to help with your onboarding! Ask me about policies, tools, or any questions you have.'
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! I\'m your AI onboarding mentor. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase()

        if (lowerMessage.includes('leave') || lowerMessage.includes('time off')) {
            return botResponses.leave
        } else if (lowerMessage.includes('expense') || lowerMessage.includes('receipt')) {
            return botResponses.expenses
        } else if (lowerMessage.includes('deploy') || lowerMessage.includes('staging')) {
            return botResponses.deploy
        } else if (lowerMessage.includes('environment') || lowerMessage.includes('setup')) {
            return botResponses.environment
        } else if (lowerMessage.includes('policy') || lowerMessage.includes('rule')) {
            return botResponses.policy
        } else {
            return botResponses.default
        }
    }

    const handleSendMessage = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')
        setIsTyping(true)

        // Simulate bot thinking
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputText),
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
            setIsTyping(false)
        }, 1000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316] p-6">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white/95 backdrop-blur h-[80vh]">
                    <CardBody className="flex flex-col h-full p-0">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-teal rounded-full">
                                    <Bot className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-800">AI Onboarding Mentor</h1>
                                    <p className="text-sm text-gray-600">Ask me anything about your onboarding!</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.sender === 'bot' && (
                                        <Avatar src="https://i.pravatar.cc/150?img=5" size="sm" />
                                    )}
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-brand-teal text-black'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {message.sender === 'user' && (
                                        <Avatar src="https://i.pravatar.cc/150?img=1" size="sm" />
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar src="https://i.pravatar.cc/150?img=5" size="sm" />
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <Input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me about policies, tools, or onboarding..."
                                    className="flex-1"
                                    disabled={isTyping}
                                />
                                <Button
                                    onPress={handleSendMessage}
                                    className="bg-brand-teal text-white"
                                    isDisabled={!inputText.trim() || isTyping}
                                    startContent={<Send className="h-4 w-4" />}
                                >
                                    Send
                                </Button>
                            </div>

                            {/* Quick Questions */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {['How do I request leave?', 'Who approves expenses?', 'How do I deploy code?', 'Setup environment'].map((question) => (
                                    <Button
                                        key={question}
                                        size="sm"
                                        variant="bordered"
                                        onPress={() => setInputText(question)}
                                        className="text-xs"
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}


