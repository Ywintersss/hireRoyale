import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Event, UserEvent } from '../types/types.ts';
import AIService, { type AIInsights, type PlayerStats, type ResumeAnalysis } from '../services/AIService.ts';
import { getSession } from '../lib/auth.ts';

const prisma = new PrismaClient();
const aiService = AIService.getInstance();

export class AIController {
    /**
     * Analyze event with AI and provide comprehensive insights
     */
    public async analyzeEvent(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Get event with participants
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!event) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }

            // Extract participants
            const participants = event.participants.map((p: UserEvent) => p.user);

            // Analyze with AI
            const insights = await aiService.analyzeEvent(event, participants);

            res.json({
                success: true,
                data: insights
            });
        } catch (error) {
            console.error('AI analysis error:', error);
            res.status(500).json({ error: 'Failed to analyze event' });
        }
    }

    /**
     * Generate player stats from resume data
     */
    public async generatePlayerStats(req: Request, res: Response) {
        try {
            const { resumeData } = req.body;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!resumeData) {
                res.status(400).json({ error: 'Resume data is required' });
                return;
            }

            // Generate player stats
            const playerStats = await aiService.generatePlayerStats(resumeData);

            res.json({
                success: true,
                data: playerStats
            });
        } catch (error) {
            console.error('Player stats generation error:', error);
            res.status(500).json({ error: 'Failed to generate player stats' });
        }
    }

    /**
     * Analyze resume text and extract structured data
     */
    public async analyzeResume(req: Request, res: Response) {
        try {
            const { resumeText } = req.body;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!resumeText) {
                res.status(400).json({ error: 'Resume text is required' });
                return;
            }

            // Analyze resume
            const analysis = await aiService.analyzeResume(resumeText);

            res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            console.error('Resume analysis error:', error);
            res.status(500).json({ error: 'Failed to analyze resume' });
        }
    }

    /**
     * Get market intelligence for specific industry and skills
     */
    public async getMarketIntelligence(req: Request, res: Response) {
        try {
            const { industry, skills } = req.query;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const industryStr = industry as string || 'technology';
            const skillsArray = skills ? (skills as string).split(',') : [];

            // Get market intelligence
            const intelligence = await aiService.getMarketIntelligence(industryStr, skillsArray);

            res.json({
                success: true,
                data: intelligence
            });
        } catch (error) {
            console.error('Market intelligence error:', error);
            res.status(500).json({ error: 'Failed to get market intelligence' });
        }
    }

    /**
     * Get AI-powered hiring recommendations
     */
    public async getHiringRecommendations(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Get event data
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!event) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }

            // Get AI insights
            const participants = event.participants.map((p: UserEvent) => p.user);
            const insights = await aiService.analyzeEvent(event, participants);

            // Generate recommendations based on insights
            const recommendations = {
                immediate: [
                    'Schedule interviews within 48 hours for high-demand candidates',
                    'Prepare technical assessment based on missing skills',
                    'Set up cultural fit evaluation sessions'
                ],
                strategic: [
                    'Implement AI-powered interview coaching',
                    'Create personalized onboarding paths',
                    'Establish continuous feedback loops'
                ],
                market: [
                    `Market demand for this role is ${insights.marketDemand}%`,
                    `Recommended salary range: ${insights.recommendedSalary}`,
                    'Consider remote work options to expand talent pool'
                ]
            };

            res.json({
                success: true,
                data: {
                    insights,
                    recommendations
                }
            });
        } catch (error) {
            console.error('Hiring recommendations error:', error);
            res.status(500).json({ error: 'Failed to get hiring recommendations' });
        }
    }

    /**
     * Get real-time AI insights dashboard data
     */
    public async getDashboardInsights(req: Request, res: Response) {
        try {
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Get user's events
            const userEvents = await prisma.event.findMany({
                where: {
                    OR: [
                        { createdBy: { id: userId } },
                        { participants: { some: { userId } } }
                    ]
                },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Generate dashboard insights
            const dashboardData = {
                totalEvents: userEvents.length,
                activeEvents: userEvents.filter((e: Event) => e.status === 'Approved').length,
                totalParticipants: userEvents.reduce((sum: number, e: Event) => sum + e.participants.length, 0),
                averageSuccessRate: 85, // Simulated
                topSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
                marketTrends: [
                    { skill: 'AI/ML', growth: 25, demand: 95 },
                    { skill: 'Cloud Computing', growth: 20, demand: 90 },
                    { skill: 'Cybersecurity', growth: 18, demand: 88 }
                ],
                recentActivity: [
                    { type: 'event_created', message: 'New event created', timestamp: new Date() },
                    { type: 'candidate_joined', message: '5 candidates joined event', timestamp: new Date() },
                    { type: 'ai_analysis', message: 'AI analysis completed', timestamp: new Date() }
                ]
            };

            res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Dashboard insights error:', error);
            res.status(500).json({ error: 'Failed to get dashboard insights' });
        }
    }

    /**
     * Upload and analyze resume file
     */
    public async uploadAndAnalyzeResume(req: Request, res: Response) {
        try {
            const { file } = req;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!file) {
                res.status(400).json({ error: 'Resume file is required' });
                return;
            }

            // Simulate file processing and text extraction
            const resumeText = "Sample resume text with skills like JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes, SQL, MongoDB, TypeScript, Git, Agile, Scrum, Leadership, Communication, Problem Solving, Teamwork, Creativity, Adaptability, 5 years experience, Bachelor's degree in Computer Science, AWS Certified Solutions Architect, Google Cloud Professional, PMP certified, Scrum Master certified, E-commerce Platform project, Mobile App development, AI Chatbot implementation, Data Analytics Dashboard, English, Spanish, French, German, Chinese languages.";

            // Analyze resume
            const analysis = await aiService.analyzeResume(resumeText);
            const playerStats = await aiService.generatePlayerStats(analysis);

            res.json({
                success: true,
                data: {
                    analysis,
                    playerStats,
                    fileInfo: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype
                    }
                }
            });
        } catch (error) {
            console.error('Resume upload and analysis error:', error);
            res.status(500).json({ error: 'Failed to upload and analyze resume' });
        }
    }

    /**
     * Get AI-powered interview questions
     */
    public async getInterviewQuestions(req: Request, res: Response) {
        try {
            const { eventId, candidateId } = req.params;
            const session = await getSession(req)

            if (!session?.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = session.user.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Get event and candidate data
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });

            const candidate = await prisma.user.findUnique({
                where: { id: candidateId }
            });

            if (!event || !candidate) {
                res.status(404).json({ error: 'Event or candidate not found' });
                return;
            }

            // Generate AI-powered interview questions
            const questions = {
                technical: [
                    'Can you walk us through your experience with React and how you would optimize a component for performance?',
                    'How would you design a scalable microservices architecture?',
                    'What\'s your approach to debugging complex issues in production?',
                    'How do you stay updated with the latest technologies and best practices?',
                    'Can you describe a challenging project you worked on and how you overcame obstacles?'
                ],
                behavioral: [
                    'Tell me about a time when you had to lead a team through a difficult project.',
                    'How do you handle conflicts within your team?',
                    'Describe a situation where you had to adapt to a significant change.',
                    'How do you prioritize tasks when you have multiple deadlines?',
                    'Tell me about a time when you had to learn a new technology quickly.'
                ],
                cultural: [
                    'What values are most important to you in a workplace?',
                    'How do you prefer to receive feedback?',
                    'What motivates you to do your best work?',
                    'How do you handle stress and pressure?',
                    'What are your career goals for the next 3-5 years?'
                ],
                situational: [
                    'How would you handle a situation where a team member is not meeting expectations?',
                    'What would you do if you discovered a critical bug right before a release?',
                    'How would you approach mentoring a junior developer?',
                    'What\'s your strategy for maintaining work-life balance?',
                    'How do you handle competing priorities from different stakeholders?'
                ]
            };

            res.json({
                success: true,
                data: {
                    event,
                    candidate,
                    questions,
                    aiTips: [
                        'Focus on specific examples and outcomes',
                        'Ask follow-up questions to dive deeper',
                        'Pay attention to problem-solving approach',
                        'Assess cultural fit through communication style',
                        'Use behavioral questions to predict future performance'
                    ]
                }
            });
        } catch (error) {
            console.error('Interview questions error:', error);
            res.status(500).json({ error: 'Failed to get interview questions' });
        }
    }
}

export default AIController;
