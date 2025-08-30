'use client'
import React, { useState } from 'react'
import { Card, CardBody, Button, Chip, Progress, Accordion, AccordionItem } from '@heroui/react'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Play, 
  Download, 
  ExternalLink,
  Code,
  Database,
  GitBranch,
  Package,
  Terminal,
  Shield
} from 'lucide-react'

type Guide = {
  id: string
  title: string
  description: string
  duration: string
  status: 'completed' | 'in-progress' | 'pending'
  type: 'video' | 'document' | 'interactive'
  url?: string
}

type GuideSection = {
  title: string
  guides: Guide[]
}

export default function GuidesPage() {
  const [selectedRole, setSelectedRole] = useState('frontend')

  const roleGuides: Record<string, GuideSection[]> = {
    frontend: [
      {
        title: 'Development Environment Setup',
        guides: [
          {
            id: '1',
            title: 'Install Node.js and npm',
            description: 'Set up your development environment with the latest Node.js version',
            duration: '5 min',
            status: 'completed',
            type: 'video',
            url: '#'
          },
          {
            id: '2',
            title: 'Clone Repository and Install Dependencies',
            description: 'Get the codebase running locally on your machine',
            duration: '10 min',
            status: 'completed',
            type: 'interactive',
            url: '#'
          },
          {
            id: '3',
            title: 'Configure VS Code Extensions',
            description: 'Essential extensions for React/TypeScript development',
            duration: '8 min',
            status: 'in-progress',
            type: 'document',
            url: '#'
          }
        ]
      },
      {
        title: 'Code Review Guidelines',
        guides: [
          {
            id: '4',
            title: 'Pull Request Best Practices',
            description: 'Learn how to create effective pull requests',
            duration: '15 min',
            status: 'pending',
            type: 'video',
            url: '#'
          },
          {
            id: '5',
            title: 'Code Review Checklist',
            description: 'Essential items to check before submitting code',
            duration: '12 min',
            status: 'pending',
            type: 'document',
            url: '#'
          }
        ]
      },
      {
        title: 'Testing and Deployment',
        guides: [
          {
            id: '6',
            title: 'Writing Unit Tests',
            description: 'Testing best practices for React components',
            duration: '20 min',
            status: 'pending',
            type: 'interactive',
            url: '#'
          },
          {
            id: '7',
            title: 'Deploy to Staging',
            description: 'How to deploy your changes to the staging environment',
            duration: '10 min',
            status: 'pending',
            type: 'video',
            url: '#'
          }
        ]
      }
    ],
    backend: [
      {
        title: 'Backend Environment Setup',
        guides: [
          {
            id: '1',
            title: 'Install Python and Dependencies',
            description: 'Set up Python environment and virtual environments',
            duration: '8 min',
            status: 'completed',
            type: 'video',
            url: '#'
          },
          {
            id: '2',
            title: 'Database Configuration',
            description: 'Configure PostgreSQL and run migrations',
            duration: '12 min',
            status: 'in-progress',
            type: 'interactive',
            url: '#'
          }
        ]
      }
    ]
  }

  const roles = [
    { id: 'frontend', name: 'Frontend Engineer', icon: <Code className="h-4 w-4" /> },
    { id: 'backend', name: 'Backend Engineer', icon: <Database className="h-4 w-4" /> },
    { id: 'devops', name: 'DevOps Engineer', icon: <Package className="h-4 w-4" /> },
    { id: 'qa', name: 'QA Engineer', icon: <Shield className="h-4 w-4" /> }
  ]

  const currentGuides = roleGuides[selectedRole] || []
  const totalGuides = currentGuides.reduce((sum, section) => sum + section.guides.length, 0)
  const completedGuides = currentGuides.reduce((sum, section) => 
    sum + section.guides.filter(g => g.status === 'completed').length, 0
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in-progress': return 'primary'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />
      case 'document': return <BookOpen className="h-4 w-4" />
      case 'interactive': return <Terminal className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Role-Specific Guides</h1>
          <p className="text-blue-100">Your personalized onboarding journey</p>
        </div>

        {/* Role Selection */}
        <Card className="bg-white/95 backdrop-blur mb-6">
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Your Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant={selectedRole === role.id ? 'solid' : 'bordered'}
                  className={`h-16 flex-col gap-2 ${
                    selectedRole === role.id ? 'bg-brand-teal text-white' : ''
                  }`}
                  onPress={() => setSelectedRole(role.id)}
                >
                  {role.icon}
                  <span className="text-xs">{role.name}</span>
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Progress Overview */}
        <Card className="bg-white/95 backdrop-blur mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
              <Chip className="bg-[#EEF2FF] text-brand-blue">
                {Math.round((completedGuides / totalGuides) * 100)}% Complete
              </Chip>
            </div>
            <Progress 
              value={(completedGuides / totalGuides) * 100} 
              className="mb-4"
              color="primary"
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-brand-blue">{completedGuides}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-teal">{totalGuides - completedGuides}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-orange">{totalGuides}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Guides */}
        <div className="space-y-6">
          {currentGuides.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="bg-white/95 backdrop-blur">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
                <div className="space-y-3">
                  {section.guides.map((guide) => (
                    <div key={guide.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        guide.status === 'completed' ? 'bg-green-100 text-green-600' :
                        guide.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {getTypeIcon(guide.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{guide.title}</div>
                        <div className="text-sm text-gray-600">{guide.description}</div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {guide.duration}
                          </div>
                          <Chip size="sm" color={getStatusColor(guide.status) as any}>
                            {guide.status === 'completed' ? 'Done' :
                             guide.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </Chip>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {guide.status === 'completed' ? (
                          <Button size="sm" variant="bordered" startContent={<ExternalLink className="h-4 w-4" />}>
                            Review
                          </Button>
                        ) : guide.status === 'in-progress' ? (
                          <Button size="sm" className="bg-brand-teal text-white" startContent={<Play className="h-4 w-4" />}>
                            Continue
                          </Button>
                        ) : (
                          <Button size="sm" variant="bordered" startContent={<Play className="h-4 w-4" />}>
                            Start
                          </Button>
                        )}
                        {guide.type === 'document' && (
                          <Button size="sm" variant="bordered" startContent={<Download className="h-4 w-4" />}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/95 backdrop-blur mt-6">
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="bordered" 
                className="h-16 flex-col gap-2"
                startContent={<BookOpen className="h-5 w-5" />}
              >
                Knowledge Base
              </Button>
              <Button 
                variant="bordered" 
                className="h-16 flex-col gap-2"
                startContent={<GitBranch className="h-5 w-5" />}
              >
                Git Workflow
              </Button>
              <Button 
                variant="bordered" 
                className="h-16 flex-col gap-2"
                startContent={<Package className="h-5 w-5" />}
              >
                Docker Setup
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}


