'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button, Card, CardBody, Chip, Avatar, Badge } from '@heroui/react'
import { 
  ArrowRight, 
  Users, 
  Zap, 
  Target, 
  TrendingUp, 
  Star,
  Play,
  CheckCircle,
  Award,
  Rocket,
  Sparkles,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Performance optimization with intersection observer
const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options])

  return [setRef, isVisible] as const
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

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [heroRef, isHeroVisible] = useIntersectionObserver({ threshold: 0.3 })
  const { announce } = useScreenReader()

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'AI-Powered Shortlisting',
      description: 'Machine learning algorithms analyze resumes in seconds, saving 70% of screening time',
      stats: '70% faster',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Live Video Interviews',
      description: 'WebRTC-powered interviews with screen sharing, recording, and real-time collaboration',
      stats: 'Real-time',
      color: 'from-green-500 to-emerald-500',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Smart Onboarding',
      description: 'Gamified onboarding experience with AI mentor and personalized learning paths',
      stats: '90% completion',
      color: 'from-purple-500 to-pink-500',
      gradient: 'from-purple-600 to-pink-600'
    }
  ]

  const stats = [
    { number: '70%', label: 'Faster Hiring', icon: <TrendingUp className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500' },
    { number: '90%', label: 'Task Completion', icon: <CheckCircle className="h-5 w-5" />, color: 'from-green-500 to-emerald-500' },
    { number: '24/7', label: 'AI Support', icon: <Star className="h-5 w-5" />, color: 'from-yellow-500 to-orange-500' },
    { number: 'Real-time', label: 'Collaboration', icon: <Users className="h-5 w-5" />, color: 'from-purple-500 to-pink-500' }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'HR Director',
      company: 'TechFlow Inc.',
      avatar: 'https://i.pravatar.cc/150?img=1',
      quote: 'HireRoyale transformed our hiring process. We went from 30 days to 10 days average time-to-hire.',
      rating: 5,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Engineering Manager',
      company: 'InnovateCorp',
      avatar: 'https://i.pravatar.cc/150?img=2',
      quote: 'The AI shortlisting is incredibly accurate. We found our best developer in just 2 days.',
      rating: 5,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const technologies = [
    { name: 'React', icon: '⚛️', color: 'from-blue-500 to-cyan-500' },
    { name: 'TypeScript', icon: '📘', color: 'from-blue-600 to-blue-700' },
    { name: 'Node.js', icon: '🟢', color: 'from-green-500 to-green-600' },
    { name: 'AI/ML', icon: '🤖', color: 'from-purple-500 to-pink-500' },
    { name: 'WebRTC', icon: '📹', color: 'from-red-500 to-orange-500' },
    { name: 'Cloud', icon: '☁️', color: 'from-indigo-500 to-purple-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [features.length])

  useEffect(() => {
    if (isHeroVisible) {
      announce('Welcome to HireRoyale - Revolutionizing talent acquisition and onboarding')
    }
  }, [isHeroVisible, announce])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    announce(`Dark mode ${!isDarkMode ? 'enabled' : 'disabled'}`)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    announce(`Sound ${!isMuted ? 'muted' : 'unmuted'}`)
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] via-[#0EA5E9] to-[#F97316]'
    }`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Rocket className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                HireRoyale
              </span>
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  isIconOnly
                  variant="bordered"
                  className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm"
                  onPress={toggleMute}
                  aria-label="Toggle sound"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  isIconOnly
                  variant="bordered"
                  className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm"
                  onPress={toggleDarkMode}
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
                  size="sm"
                >
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8"
            >
              <Chip className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                Next-Gen Talent Platform
              </Chip>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Revolutionize
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400 bg-clip-text text-transparent">
                Talent Acquisition
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              AI-powered hiring and onboarding platform designed for modern enterprises. 
              Faster hiring, better candidates, seamless onboarding experience.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                startContent={<Play className="h-5 w-5" />}
              >
                Watch Demo
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6 transition-all duration-300 transform hover:scale-105"
                endContent={<ArrowRight className="h-5 w-5" />}
              >
                Explore Features
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}>
                      {stat.icon}
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.number}</span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Built with Modern Tech
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Cutting-edge technologies powering the future of recruitment
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="text-center group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className={`text-4xl mb-3 ${tech.name === 'AI/ML' ? 'text-2xl' : ''}`}>
                    {tech.icon}
                  </div>
                  <p className="text-white font-medium text-sm">{tech.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose HireRoyale?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Built with cutting-edge technology to solve real hiring challenges
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <Card className="bg-white/95 backdrop-blur shadow-2xl border-0 h-full overflow-hidden group-hover:shadow-3xl transition-all duration-500">
                  <CardBody className="p-6 sm:p-8 text-center relative">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} w-20 h-20 mx-auto mb-6 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                    <Badge className={`bg-gradient-to-r ${feature.color} text-white text-sm font-medium px-3 py-1`}>
                      {feature.stats}
                    </Badge>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl text-blue-100">
              Experience the future of hiring and onboarding
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Card className="bg-white/95 backdrop-blur shadow-2xl border-0 overflow-hidden">
              <CardBody className="p-0">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50" />
                  <div className="relative text-center z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="h-20 w-20 text-blue-600 mx-auto mb-4 drop-shadow-lg" />
                    </motion.div>
                    <p className="text-gray-600 text-lg font-medium">Interactive Demo Coming Soon</p>
                    <p className="text-gray-500 text-sm mt-2">Experience the platform firsthand</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg sm:text-xl text-blue-100">
              See what our users say about HireRoyale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-white/95 backdrop-blur shadow-xl border-0 h-full overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                  <CardBody className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar src={testimonial.avatar} size="lg" className="ring-2 ring-blue-100" />
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{testimonial.name}</h4>
                        <p className="text-gray-600">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                    <blockquote className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the revolution in talent acquisition and onboarding
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                startContent={<Rocket className="h-5 w-5" />}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6 transition-all duration-300 transform hover:scale-105"
                endContent={<ArrowRight className="h-5 w-5" />}
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">HireRoyale</span>
          </div>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Revolutionizing talent acquisition and onboarding for the modern workplace
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-blue-100 text-sm">
            <span>© 2024 HireRoyale</span>
            <span className="hidden sm:inline">•</span>
            <span>Privacy Policy</span>
            <span className="hidden sm:inline">•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Accessibility: Screen reader only content */}
      <div className="sr-only">
        <h2>Navigation</h2>
        <ul>
          <li>Home</li>
          <li>Features</li>
          <li>Demo</li>
          <li>Testimonials</li>
          <li>Get Started</li>
        </ul>
        
        <h2>Key Features</h2>
        <ul>
          <li>AI-powered resume shortlisting</li>
          <li>Live video interviews with WebRTC</li>
          <li>Gamified onboarding experience</li>
          <li>Real-time collaboration tools</li>
        </ul>
      </div>
    </div>
  )
}
