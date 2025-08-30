'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Textarea, 
  Chip, 
  Progress, 
  Avatar, 
  Badge, 
  Tooltip,
  Select,
  SelectItem,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import { 
  Upload, 
  FileText, 
  Brain, 
  Trophy, 
  Star, 
  TrendingUp, 
  Target, 
  Users,
  Award,
  Sparkles,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Filter,
  SortAsc,
  Zap,
  CheckCircle,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Languages,
  Code,
  Database,
  Cloud,
  Smartphone,
  Globe,
  Crown,
  Sword,
  Shield,
  Heart,
  Zap as Lightning,
  Target as Crosshair,
  Users as Team,
  BookOpen,
  Calendar,
  MessageSquare,
  Video,
  Mic,
  MicOff,
  Monitor,
  Smartphone as Mobile,
  Globe as World,
  TrendingUp as Chart,
  BarChart3,
  PieChart,
  Activity,
  Brain as Intelligence,
  Rocket,
  Flame,
  Diamond,
  Gem
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Candidate {
  id: string
  name: string
  avatar: string
  score: number
  skills: string[]
  experience: string
  location: string
  education: string
  languages: string[]
  matchedKeywords: string[]
  precision: number
  recall: number
  f1Score: number
  status: 'shortlisted' | 'considering' | 'rejected'
  notes?: string
  // New gaming-inspired stats
  technicalSkill: number
  communicationSkill: number
  leadershipSkill: number
  adaptabilitySkill: number
  problemSolvingSkill: number
  teamWorkSkill: number
  experienceLevel: number
  educationLevel: number
  certifications: string[]
  achievements: string[]
  personalityTraits: string[]
  workStyle: 'collaborative' | 'independent' | 'hybrid'
  availability: 'immediate' | '2-weeks' | '1-month'
  salaryExpectation: string
  remotePreference: 'remote' | 'hybrid' | 'onsite'
}

interface ResumeFile {
  id: string
  name: string
  size: number
  type: string
  content: string
}

export default function ShortlistPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumes, setResumes] = useState<ResumeFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rankedCandidates, setRankedCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('score')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'stats'>('stats')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(100)

  // Enhanced mock data with gaming-inspired stats
  const mockCandidates: Candidate[] = useMemo(() => [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=1',
      score: 95,
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
      experience: '5 years',
      location: 'San Francisco, CA',
      education: 'MS Computer Science, Stanford',
      languages: ['English', 'Mandarin'],
      matchedKeywords: ['React', 'TypeScript', 'Full-stack', 'AWS', 'Docker'],
      precision: 0.92,
      recall: 0.88,
      f1Score: 0.90,
      status: 'shortlisted',
      technicalSkill: 95,
      communicationSkill: 88,
      leadershipSkill: 82,
      adaptabilitySkill: 90,
      problemSolvingSkill: 93,
      teamWorkSkill: 87,
      experienceLevel: 95,
      educationLevel: 98,
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
      achievements: ['Led team of 8 developers', 'Reduced deployment time by 60%'],
      personalityTraits: ['Analytical', 'Proactive', 'Team Player'],
      workStyle: 'collaborative',
      availability: 'immediate',
      salaryExpectation: '$120k - $150k',
      remotePreference: 'hybrid'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=2',
      score: 87,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Git'],
      experience: '3 years',
      location: 'Austin, TX',
      education: 'BS Data Science, UT Austin',
      languages: ['English', 'Spanish'],
      matchedKeywords: ['Python', 'ML', 'Data Science', 'SQL'],
      precision: 0.85,
      recall: 0.82,
      f1Score: 0.83,
      status: 'considering',
      technicalSkill: 89,
      communicationSkill: 85,
      leadershipSkill: 75,
      adaptabilitySkill: 88,
      problemSolvingSkill: 91,
      teamWorkSkill: 82,
      experienceLevel: 80,
      educationLevel: 85,
      certifications: ['TensorFlow Developer', 'AWS ML Specialty'],
      achievements: ['Built ML model with 94% accuracy', 'Mentored 3 junior developers'],
      personalityTraits: ['Curious', 'Detail-oriented', 'Innovative'],
      workStyle: 'independent',
      availability: '2-weeks',
      salaryExpectation: '$100k - $130k',
      remotePreference: 'remote'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      score: 82,
      skills: ['JavaScript', 'Vue.js', 'CSS', 'UI/UX', 'Figma'],
      experience: '3 years',
      location: 'New York, NY',
      education: 'BS Design, Parsons',
      languages: ['English'],
      matchedKeywords: ['Frontend', 'JavaScript', 'Design', 'UI/UX'],
      precision: 0.78,
      recall: 0.75,
      f1Score: 0.76,
      status: 'considering',
      technicalSkill: 82,
      communicationSkill: 90,
      leadershipSkill: 78,
      adaptabilitySkill: 85,
      problemSolvingSkill: 80,
      teamWorkSkill: 88,
      experienceLevel: 75,
      educationLevel: 80,
      certifications: ['Google UX Design', 'Adobe Creative Suite'],
      achievements: ['Redesigned 5 major products', 'Improved user engagement by 40%'],
      personalityTraits: ['Creative', 'Empathetic', 'Collaborative'],
      workStyle: 'collaborative',
      availability: '1-month',
      salaryExpectation: '$90k - $110k',
      remotePreference: 'hybrid'
    }
  ], [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          const newResume: ResumeFile = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            content
          }
          setResumes(prev => [...prev, newResume])
        }
        reader.readAsText(file)
      })
    }
  }

  const handleRemoveResume = (id: string) => {
    setResumes(prev => prev.filter(resume => resume.id !== id))
  }

  const handleShortlist = async () => {
    if (!jobDescription.trim() || resumes.length === 0) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Sort candidates by score
    const sorted = [...mockCandidates].sort((a, b) => b.score - a.score)
    setRankedCandidates(sorted)
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 80) return 'primary'
    if (score >= 70) return 'warning'
    return 'danger'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'success'
      case 'considering': return 'warning'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase()
    if (skillLower.includes('react') || skillLower.includes('javascript')) return <Code className="h-4 w-4" />
    if (skillLower.includes('python') || skillLower.includes('ml')) return <Brain className="h-4 w-4" />
    if (skillLower.includes('aws') || skillLower.includes('cloud')) return <Cloud className="h-4 w-4" />
    if (skillLower.includes('ui') || skillLower.includes('design')) return <Smartphone className="h-4 w-4" />
    if (skillLower.includes('sql') || skillLower.includes('database')) return <Database className="h-4 w-4" />
    return <Code className="h-4 w-4" />
  }

  const filteredCandidates = useMemo(() => {
    let filtered = rankedCandidates.length > 0 ? rankedCandidates : mockCandidates

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    filtered = filtered.filter(c => c.score >= minScore && c.score <= maxScore)

    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score)
        break
      case 'experience':
        filtered.sort((a, b) => b.experienceLevel - a.experienceLevel)
        break
      case 'communication':
        filtered.sort((a, b) => b.communicationSkill - a.communicationSkill)
        break
      case 'leadership':
        filtered.sort((a, b) => b.leadershipSkill - a.leadershipSkill)
        break
    }

    return filtered
  }, [rankedCandidates, mockCandidates, filterStatus, searchTerm, sortBy, minScore, maxScore])

  const StatBar = ({ label, value, icon, color = 'primary' }: { label: string, value: number, icon: React.ReactNode, color?: string }) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-[120px]">
        {icon}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex-1">
        <Progress 
          value={value} 
          color={color as any}
          className="h-2"
          showValueLabel={false}
        />
      </div>
      <span className="text-sm font-bold text-gray-800 min-w-[40px]">{value}</span>
    </div>
  )

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar 
                src={candidate.avatar} 
                name={candidate.name}
                size="lg"
                className="ring-2 ring-blue-100"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{candidate.name}</h3>
                <p className="text-sm text-gray-600">{candidate.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={getScoreColor(candidate.score)} variant="flat">
                    {candidate.score}% Match
                  </Badge>
                  <Badge color={getStatusColor(candidate.status)} variant="flat">
                    {candidate.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Crown className="h-5 w-5" />
                <span className="font-bold">{candidate.score}</span>
              </div>
              <p className="text-xs text-gray-500">Overall Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Sword className="h-4 w-4 text-red-500" />
                Technical Skills
              </h4>
              <StatBar label="Technical" value={candidate.technicalSkill} icon={<Code className="h-4 w-4 text-blue-500" />} />
              <StatBar label="Problem Solving" value={candidate.problemSolvingSkill} icon={<Target className="h-4 w-4 text-green-500" />} />
              <StatBar label="Adaptability" value={candidate.adaptabilitySkill} icon={<Zap className="h-4 w-4 text-yellow-500" />} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Soft Skills
              </h4>
              <StatBar label="Communication" value={candidate.communicationSkill} icon={<MessageSquare className="h-4 w-4 text-purple-500" />} />
              <StatBar label="Leadership" value={candidate.leadershipSkill} icon={<Crown className="h-4 w-4 text-orange-500" />} />
              <StatBar label="Team Work" value={candidate.teamWorkSkill} icon={<Team className="h-4 w-4 text-green-500" />} />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Gem className="h-4 w-4 text-purple-500" />
              Key Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 5).map((skill, index) => (
                <Chip 
                  key={index} 
                  size="sm" 
                  variant="flat" 
                  color="primary"
                  startContent={getSkillIcon(skill)}
                >
                  {skill}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {candidate.experience}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {candidate.education.split(',')[0]}
              </div>
            </div>
            <Button 
              size="sm" 
              color="primary" 
              variant="flat"
              onPress={() => setSelectedCandidate(candidate)}
            >
              View Details
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">AI Resume Shortlisting</h1>
              <p className="text-gray-600">Gamified candidate analysis with advanced AI scoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Championship Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Advanced AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>Precision Matching</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Job Description
                </h3>
                <Textarea
                  placeholder="Enter the job description to match against resumes..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-500" />
                  Upload Resumes
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click to upload resumes or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, DOCX, TXT</p>
                  </label>
                </div>
                
                {resumes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded Files:</h4>
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{resume.name}</span>
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveResume(resume.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                color="primary"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8"
                onPress={handleShortlist}
                isLoading={isLoading}
                startContent={<Brain className="h-5 w-5" />}
              >
                {isLoading ? 'Analyzing Resumes...' : 'Start AI Analysis'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Results Section */}
        {filteredCandidates.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Rankings</h2>
                <p className="text-gray-600">AI-powered analysis results with gaming-inspired stats</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select
                  placeholder="Sort by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="sm"
                >
                  <SelectItem key="score" value="score">Score</SelectItem>
                  <SelectItem key="experience" value="experience">Experience</SelectItem>
                  <SelectItem key="communication" value="communication">Communication</SelectItem>
                  <SelectItem key="leadership" value="leadership">Leadership</SelectItem>
                </Select>
                
                <Select
                  placeholder="Filter by status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="sm"
                >
                  <SelectItem key="all" value="all">All</SelectItem>
                  <SelectItem key="shortlisted" value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem key="considering" value="considering">Considering</SelectItem>
                  <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Candidate Detail Modal */}
        <Modal 
          isOpen={selectedCandidate !== null} 
          onClose={() => setSelectedCandidate(null)}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {selectedCandidate && (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Avatar src={selectedCandidate.avatar} name={selectedCandidate.name} size="lg" />
                    <div>
                      <h2 className="text-xl font-bold">{selectedCandidate.name}</h2>
                      <p className="text-gray-600">{selectedCandidate.position || 'Software Engineer'}</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Skills & Experience</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Technical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map((skill, index) => (
                              <Chip key={index} size="sm" color="primary" variant="flat">
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Personality Traits</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.personalityTraits.map((trait, index) => (
                              <Chip key={index} size="sm" color="secondary" variant="flat">
                                {trait}
                              </Chip>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Certifications</h4>
                          <div className="space-y-2">
                            {selectedCandidate.certifications.map((cert, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-yellow-500" />
                                {cert}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Detailed Stats</h3>
                      <div className="space-y-4">
                        <StatBar label="Technical Skill" value={selectedCandidate.technicalSkill} icon={<Code className="h-4 w-4" />} />
                        <StatBar label="Communication" value={selectedCandidate.communicationSkill} icon={<MessageSquare className="h-4 w-4" />} />
                        <StatBar label="Leadership" value={selectedCandidate.leadershipSkill} icon={<Crown className="h-4 w-4" />} />
                        <StatBar label="Problem Solving" value={selectedCandidate.problemSolvingSkill} icon={<Target className="h-4 w-4" />} />
                        <StatBar label="Team Work" value={selectedCandidate.teamWorkSkill} icon={<Team className="h-4 w-4" />} />
                        <StatBar label="Adaptability" value={selectedCandidate.adaptabilitySkill} icon={<Zap className="h-4 w-4" />} />
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Match Analysis</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{selectedCandidate.precision.toFixed(2)}</div>
                            <div className="text-xs text-gray-600">Precision</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{selectedCandidate.recall.toFixed(2)}</div>
                            <div className="text-xs text-gray-600">Recall</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">{selectedCandidate.f1Score.toFixed(2)}</div>
                            <div className="text-xs text-gray-600">F1 Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={() => setSelectedCandidate(null)}>
                    Close
                  </Button>
                  <Button color="primary" onPress={() => {
                    // Handle shortlist action
                    setSelectedCandidate(null)
                  }}>
                    Shortlist Candidate
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
} 