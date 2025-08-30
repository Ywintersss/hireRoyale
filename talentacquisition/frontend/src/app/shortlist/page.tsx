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
  Divider
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
  Globe
} from 'lucide-react'

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
  const [rankedCandidates, setRankedCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('score')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [minScore, setMinScore] = useState(0)

  // Mock data for demonstration
  const mockCandidates: Candidate[] = useMemo(() => [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=1',
      score: 95,
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
      experience: '5 years',
      location: 'San Francisco, CA',
      education: 'MS Computer Science, Stanford',
      languages: ['English', 'Mandarin'],
      matchedKeywords: ['React', 'TypeScript', 'Node.js', 'Full-stack', 'API'],
      precision: 0.92,
      recall: 0.88,
      f1Score: 0.90,
      status: 'shortlisted'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=2',
      score: 87,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experience: '4 years',
      location: 'Austin, TX',
      education: 'BS Computer Science, UT Austin',
      languages: ['English', 'Spanish'],
      matchedKeywords: ['Python', 'Backend', 'Database', 'DevOps'],
      precision: 0.85,
      recall: 0.82,
      f1Score: 0.83,
      status: 'considering'
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
      status: 'considering'
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
      case 'considering': return 'primary'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase()
    if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular')) return <Code className="h-4 w-4" />
    if (skillLower.includes('python') || skillLower.includes('java') || skillLower.includes('javascript')) return <Code className="h-4 w-4" />
    if (skillLower.includes('aws') || skillLower.includes('azure') || skillLower.includes('gcp')) return <Cloud className="h-4 w-4" />
    if (skillLower.includes('mobile') || skillLower.includes('ios') || skillLower.includes('android')) return <Smartphone className="h-4 w-4" />
    if (skillLower.includes('database') || skillLower.includes('sql') || skillLower.includes('mongodb')) return <Database className="h-4 w-4" />
    return <Code className="h-4 w-4" />
  }

  const filteredCandidates = useMemo(() => {
    let filtered = rankedCandidates

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    filtered = filtered.filter(c => c.score >= minScore)

    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score)
        break
      case 'experience':
        filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience))
        break
      case 'f1Score':
        filtered.sort((a, b) => b.f1Score - a.f1Score)
        break
    }

    return filtered
  }, [rankedCandidates, filterStatus, minScore, sortBy])

  const averageScore = rankedCandidates.length > 0 
    ? rankedCandidates.reduce((sum, c) => sum + c.score, 0) / rankedCandidates.length 
    : 0

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316]'
    } p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                AI Resume Shortlisting
                <div className="p-2 bg-white/20 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </h1>
              <p className="text-xl text-blue-100">Machine learning-powered candidate ranking</p>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip content="Toggle Dark Mode">
                <Button
                  isIconOnly
                  variant="bordered"
                  className="text-white border-white/30 hover:bg-white/10"
                  onPress={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </Tooltip>
              <Tooltip content="Toggle Sound">
                <Button
                  isIconOnly
                  variant="bordered"
                  className="text-white border-white/30 hover:bg-white/10"
                  onPress={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Job Description */}
            <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Job Description
                </h2>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter the job description, requirements, and skills needed..."
                  className="mb-4"
                  minRows={8}
                />
                <div className="text-sm text-gray-500 mb-4">
                  AI will analyze this against candidate resumes to find the best matches.
                </div>
              </CardBody>
            </Card>

            {/* Resume Upload */}
            <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  Upload Resumes
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload resumes</p>
                    <p className="text-sm text-gray-500">PDF, DOC, DOCX, or TXT files</p>
                  </label>
                </div>
                
                {resumes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-800">Uploaded Files:</h3>
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{resume.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveResume(resume.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Analysis Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg py-6 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              onPress={handleShortlist}
              isDisabled={!jobDescription.trim() || resumes.length === 0 || isLoading}
              startContent={isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Brain className="h-5 w-5" />}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Candidates'}
            </Button>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            {rankedCandidates.length > 0 && (
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Analysis Results
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{rankedCandidates.length}</div>
                      <div className="text-sm text-gray-600">Candidates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(averageScore)}</div>
                      <div className="text-sm text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {rankedCandidates.filter(c => c.status === 'shortlisted').length}
                      </div>
                      <div className="text-sm text-gray-600">Shortlisted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(rankedCandidates.reduce((sum, c) => sum + c.f1Score, 0) / rankedCandidates.length * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg F1 Score</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Filters and Sorting */}
            {rankedCandidates.length > 0 && (
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Filters & Sorting</h3>
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => setShowFilters(!showFilters)}
                      startContent={<Filter className="h-4 w-4" />}
                    >
                      {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Sort By"
                      selectedKeys={[sortBy]}
                      onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                    >
                      <SelectItem key="score">Score</SelectItem>
                      <SelectItem key="experience">Experience</SelectItem>
                      <SelectItem key="f1Score">F1 Score</SelectItem>
                    </Select>
                    
                    <Select
                      label="Status"
                      selectedKeys={[filterStatus]}
                      onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0] as string)}
                    >
                      <SelectItem key="all">All</SelectItem>
                      <SelectItem key="shortlisted">Shortlisted</SelectItem>
                      <SelectItem key="considering">Considering</SelectItem>
                      <SelectItem key="rejected">Rejected</SelectItem>
                    </Select>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Min Score</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500">{minScore}+</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Candidate List */}
            {rankedCandidates.length > 0 && (
              <div className="space-y-4">
                {filteredCandidates.map((candidate, index) => (
                  <Card 
                    key={candidate.id} 
                    className="bg-white/95 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-200 cursor-pointer"
                    isPressable
                    onPress={() => setSelectedCandidate(candidate)}
                  >
                    <CardBody className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar and Basic Info */}
                        <div className="flex-shrink-0">
                          <Avatar src={candidate.avatar} size="lg" />
                          {index === 0 && (
                            <div className="mt-2 text-center">
                              <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                              <span className="text-xs text-yellow-600 font-medium">Top Match</span>
                            </div>
                          )}
                        </div>

                        {/* Candidate Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-1">{candidate.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {candidate.experience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {candidate.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  {candidate.education}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Chip 
                                  size="sm" 
                                  color={getScoreColor(candidate.score) as any}
                                  variant="flat"
                                >
                                  {candidate.score}/100
                                </Chip>
                                <Chip 
                                  size="sm" 
                                  color={getStatusColor(candidate.status) as any}
                                  variant="flat"
                                >
                                  {candidate.status}
                                </Chip>
                              </div>
                              <div className="text-xs text-gray-500">
                                Rank #{index + 1}
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill) => (
                                <Chip
                                  key={skill}
                                  size="sm"
                                  variant="flat"
                                  startContent={getSkillIcon(skill)}
                                  className="bg-blue-50 text-blue-700"
                                >
                                  {skill}
                                </Chip>
                              ))}
                            </div>
                          </div>

                          {/* Matched Keywords */}
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Matched Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.matchedKeywords.map((keyword) => (
                                <Chip
                                  key={keyword}
                                  size="sm"
                                  variant="flat"
                                  className="bg-green-50 text-green-700"
                                >
                                  {keyword}
                                </Chip>
                              ))}
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{Math.round(candidate.precision * 100)}%</div>
                              <div className="text-xs text-gray-500">Precision</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{Math.round(candidate.recall * 100)}%</div>
                              <div className="text-xs text-gray-500">Recall</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{Math.round(candidate.f1Score * 100)}%</div>
                              <div className="text-xs text-gray-500">F1 Score</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && rankedCandidates.length === 0 && (
              <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                <CardBody className="p-12 text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Analyze</h3>
                  <p className="text-gray-500">Upload resumes and enter a job description to get started with AI-powered shortlisting.</p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 