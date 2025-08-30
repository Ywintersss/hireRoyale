'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardBody, Button, Progress, Chip, Avatar, Badge, Tooltip, Spinner } from '@heroui/react'
import { 
  CheckCircle, 
  Clock, 
  Trophy, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  Star,
  Target,
  Zap,
  Shield,
  Github,
  Mail,
  Slack,
  TrendingUp,
  Award,
  Sparkles,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Play,
  Bell,
  Settings,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

// Performance optimization with virtual scrolling concept
const useVirtualScroll = (items: any[], itemHeight: number) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  return { visibleRange, setVisibleRange }
}

// Accessibility hook for screen reader announcements
const useScreenReader = () => {
  const announce = useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }, [])
  return { announce }
}

// Performance optimization with debounced updates
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

export default function OnboardingDashboard() {
  const [currentStep, setCurrentStep] = useState(2)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(true)
  const [collaborators] = useState([
    { id: 1, name: 'Sarah M.', role: 'Manager', status: 'online', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 2, name: 'Mike L.', role: 'Tech Lead', status: 'online', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 3, name: 'Lisa D.', role: 'Designer', status: 'away', avatar: 'https://i.pravatar.cc/150?img=4' }
  ])
  
  const { announce } = useScreenReader()
  const totalSteps = 8

  const onboardingTasks = useMemo(() => [
    { id: 1, title: 'Complete HR Forms', status: 'completed', icon: <CheckCircle className="h-5 w-5" />, priority: 'high', estimatedTime: '15 min' },
    { id: 2, title: 'Setup Development Environment', status: 'in-progress', icon: <Github className="h-5 w-5" />, priority: 'critical', estimatedTime: '45 min' },
    { id: 3, title: 'Security Training', status: 'pending', icon: <Shield className="h-5 w-5" />, priority: 'high', estimatedTime: '30 min' },
    { id: 4, title: 'Team Introductions', status: 'pending', icon: <Users className="h-5 w-5" />, priority: 'medium', estimatedTime: '20 min' },
    { id: 5, title: 'Code Review Guidelines', status: 'pending', icon: <BookOpen className="h-5 w-5" />, priority: 'medium', estimatedTime: '25 min' },
    { id: 6, title: 'Deploy First Feature', status: 'pending', icon: <Zap className="h-5 w-5" />, priority: 'high', estimatedTime: '60 min' },
    { id: 7, title: 'Performance Review Setup', status: 'pending', icon: <Target className="h-5 w-5" />, priority: 'low', estimatedTime: '15 min' },
    { id: 8, title: 'Final Onboarding Review', status: 'pending', icon: <Star className="h-5 w-5" />, priority: 'medium', estimatedTime: '30 min' }
  ], [])

  const badges = useMemo(() => [
    { name: 'First Day Hero', icon: <Trophy className="h-4 w-4" />, earned: true, rarity: 'common', points: 100 },
    { name: 'Code Committer', icon: <Github className="h-4 w-4" />, earned: true, rarity: 'rare', points: 250 },
    { name: 'Security Champion', icon: <Shield className="h-4 w-4" />, earned: false, rarity: 'epic', points: 500 },
    { name: 'Team Player', icon: <Users className="h-4 w-4" />, earned: false, rarity: 'rare', points: 300 },
    { name: 'Knowledge Seeker', icon: <BookOpen className="h-4 w-4" />, earned: false, rarity: 'legendary', points: 1000 }
  ], [])

  const quickLinks = useMemo(() => [
    { name: 'Email', icon: <Mail className="h-4 w-4" />, url: 'mailto:john@company.com', status: 'active' },
    { name: 'Slack', icon: <Slack className="h-4 w-4" />, url: 'https://slack.com', status: 'active' },
    { name: 'GitHub', icon: <Github className="h-4 w-4" />, url: 'https://github.com', status: 'active' },
    { name: 'Jira', icon: <Target className="h-4 w-4" />, url: 'https://jira.com', status: 'maintenance' }
  ], [])

  const upcomingMeetings = useMemo(() => [
    { time: '10:00 AM', title: '1:1 with Manager', type: 'meeting', attendees: 2, duration: '30 min' },
    { time: '2:00 PM', title: 'Team Standup', type: 'team', attendees: 8, duration: '15 min' },
    { time: '4:00 PM', title: 'Code Review Session', type: 'training', attendees: 3, duration: '45 min' }
  ], [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'secondary'
      case 'epic': return 'primary'
      case 'rare': return 'success'
      case 'common': return 'default'
      default: return 'default'
    }
  }

  useEffect(() => {
    // Announce progress changes for screen readers
    const progress = Math.round((currentStep / totalSteps) * 100)
    announce(`Onboarding progress: ${progress}% complete`)
  }, [currentStep, totalSteps, announce])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    announce(`Dark mode ${!isDarkMode ? 'enabled' : 'disabled'}`)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    announce(`Sound ${!isMuted ? 'muted' : 'unmuted'}`)
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316]'
    } p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Accessibility */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                Welcome, John! 👋
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </motion.div>
              </h1>
              <p className="text-blue-100 text-lg">Day 2 of your onboarding journey</p>
              <div className="flex items-center gap-4 mt-2">
                <Chip className="bg-green-500/20 text-green-300 border-green-500/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% faster than average
                </Chip>
                <Chip className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Award className="h-3 w-3 mr-1" />
                  Top Performer
                </Chip>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Accessibility Controls */}
              <div className="flex gap-2">
                <Tooltip content="Toggle Dark Mode">
                  <Button
                    isIconOnly
                    variant="bordered"
                    className="text-white border-white/30 hover:bg-white/10"
                    onPress={toggleDarkMode}
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </Tooltip>
                <Tooltip content="Toggle Sound">
                  <Button
                    isIconOnly
                    variant="bordered"
                    className="text-white border-white/30 hover:bg-white/10"
                    onPress={toggleMute}
                    aria-label="Toggle sound"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </Tooltip>
              </div>
              
              <div className="flex items-center gap-4">
                <Avatar src="https://i.pravatar.cc/150?img=1" size="lg" />
                <div className="text-right text-white">
                  <div className="font-semibold">John Developer</div>
                  <div className="text-sm text-blue-100">Frontend Engineer</div>
                  <div className="text-xs text-green-300 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Progress Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Onboarding Progress</h2>
                    <Chip className="bg-[#EEF2FF] text-brand-blue font-semibold">
                      {Math.round((currentStep / totalSteps) * 100)}% Complete
                    </Chip>
                  </div>
                  
                  <Progress 
                    value={(currentStep / totalSteps) * 100} 
                    className="mb-4 h-3"
                    color="primary"
                    aria-label="Onboarding progress"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-brand-blue">{currentStep}</div>
                      <div className="text-sm text-gray-600">Steps Done</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-brand-teal">{totalSteps - currentStep}</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-brand-orange">3</div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-purple-600">85</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </motion.div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Enhanced Tasks with Priority and Collaboration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
                    <Button size="sm" variant="bordered" className="text-brand-teal border-brand-teal">
                      <Users className="h-4 w-4 mr-1" />
                      {showCollaborators ? 'Hide' : 'Show'} Team
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <AnimatePresence>
                      {onboardingTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-brand-teal/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className={`p-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-600' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {task.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-800">{task.title}</div>
                              <Chip 
                                size="sm" 
                                color={getPriorityColor(task.priority) as any}
                                variant="flat"
                              >
                                {task.priority}
                              </Chip>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{task.estimatedTime} estimated</div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {task.estimatedTime}
                              </div>
                              <Chip size="sm" color={task.status === 'completed' ? 'success' : 
                                   task.status === 'in-progress' ? 'primary' : 'default'}>
                                {task.status === 'completed' ? 'Done' :
                                 task.status === 'in-progress' ? 'Active' : 'Pending'}
                              </Chip>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {task.status === 'completed' ? (
                              <Button size="sm" variant="bordered" startContent={<CheckCircle className="h-4 w-4" />}>
                                Review
                              </Button>
                            ) : task.status === 'in-progress' ? (
                              <Button size="sm" className="bg-brand-teal text-white" startContent={<Zap className="h-4 w-4" />}>
                                Continue
                              </Button>
                            ) : (
                              <Button size="sm" variant="bordered" startContent={<Play className="h-4 w-4" />}>
                                Start
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant="bordered"
                          className="h-20 flex-col gap-2 w-full border-2 hover:border-brand-teal hover:bg-brand-teal/5 transition-all duration-200"
                          onPress={() => window.open(link.url, '_blank')}
                          startContent={link.icon}
                        >
                          <span className="text-sm font-medium">{link.name}</span>
                          <Chip size="sm" color={link.status === 'active' ? 'success' : 'warning'} variant="flat">
                            {link.status}
                          </Chip>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Chatbot */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-brand-teal rounded-full">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">AI Mentor</h3>
                    <div className="ml-auto">
                      <Chip size="sm" color="success" variant="flat">
                        Online
                      </Chip>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-brand-teal/10 to-blue-500/10 rounded-lg p-3 mb-3 border border-brand-teal/20"
                  >
                    <p className="text-sm text-gray-700">
                      "Hi John! Need help with anything? I can assist with policies, tools, or your onboarding tasks."
                    </p>
                  </motion.div>
                  
                  <Button 
                    size="sm" 
                    className="bg-brand-teal text-white w-full hover:bg-brand-teal/90 transition-colors"
                    startContent={<MessageCircle className="h-4 w-4" />}
                  >
                    Ask Question
                  </Button>
                </CardBody>
              </Card>
            </motion.div>

            {/* Enhanced Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <h3 className="font-semibold text-gray-800 mb-4">Badges Earned</h3>
                  <div className="space-y-2">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-1 rounded-full ${
                          badge.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {badge.icon}
                        </div>
                        <span className={`text-sm flex-1 ${badge.earned ? 'text-gray-800' : 'text-gray-400'}`}>
                          {badge.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {badge.earned && <Star className="h-3 w-3 text-yellow-500" />}
                          <Chip size="sm" color={getRarityColor(badge.rarity) as any} variant="flat">
                            {badge.points}
                          </Chip>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Enhanced Upcoming Meetings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <h3 className="font-semibold text-gray-800 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {upcomingMeetings.map((meeting, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-600">{meeting.time}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{meeting.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip size="sm" className="text-xs">
                              {meeting.type}
                            </Chip>
                            <span className="text-xs text-gray-500">{meeting.duration}</span>
                            <span className="text-xs text-gray-500">{meeting.attendees} people</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
        </div>
                  
                  <Button 
                    size="sm" 
                    variant="bordered" 
                    className="w-full mt-3 hover:bg-brand-teal/5 hover:border-brand-teal transition-colors"
                    startContent={<Calendar className="h-4 w-4" />}
                  >
                    View Calendar
                  </Button>
                </CardBody>
              </Card>
            </motion.div>

            {/* Enhanced Team Introductions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody>
                  <h3 className="font-semibold text-gray-800 mb-4">Meet Your Team</h3>
                  <div className="space-y-3">
                    {collaborators.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative">
                          <Avatar src={member.avatar} size="sm" />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                        <Chip size="sm" color={member.status === 'online' ? 'success' : 'warning'} variant="flat">
                          {member.status}
                        </Chip>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="bordered" 
                    className="w-full mt-3 hover:bg-brand-teal/5 hover:border-brand-teal transition-colors"
                    startContent={<Users className="h-4 w-4" />}
                  >
                    Schedule Intro
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
