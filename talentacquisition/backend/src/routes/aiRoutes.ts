import { Router } from 'express';
import AIController from '../controllers/AIController.ts';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const aiController = new AIController();

// Apply authentication middleware to all AI routes
router.use(authenticateToken);

/**
 * @route GET /api/ai/analyze-event/:eventId
 * @desc Analyze event with AI and provide comprehensive insights
 * @access Private
 */
router.get('/analyze-event/:eventId', aiController.analyzeEvent.bind(aiController));

/**
 * @route POST /api/ai/generate-player-stats
 * @desc Generate player stats from resume data
 * @access Private
 */
router.post('/generate-player-stats', aiController.generatePlayerStats.bind(aiController));

/**
 * @route POST /api/ai/analyze-resume
 * @desc Analyze resume text and extract structured data
 * @access Private
 */
router.post('/analyze-resume', aiController.analyzeResume.bind(aiController));

/**
 * @route GET /api/ai/market-intelligence
 * @desc Get market intelligence for specific industry and skills
 * @access Private
 */
router.get('/market-intelligence', aiController.getMarketIntelligence.bind(aiController));

/**
 * @route GET /api/ai/hiring-recommendations/:eventId
 * @desc Get AI-powered hiring recommendations
 * @access Private
 */
router.get('/hiring-recommendations/:eventId', aiController.getHiringRecommendations.bind(aiController));

/**
 * @route GET /api/ai/dashboard-insights
 * @desc Get real-time AI insights dashboard data
 * @access Private
 */
router.get('/dashboard-insights', aiController.getDashboardInsights.bind(aiController));

/**
 * @route POST /api/ai/upload-analyze-resume
 * @desc Upload and analyze resume file
 * @access Private
 */
router.post('/upload-analyze-resume', aiController.uploadAndAnalyzeResume.bind(aiController));

/**
 * @route GET /api/ai/interview-questions/:eventId/:candidateId
 * @desc Get AI-powered interview questions
 * @access Private
 */
router.get('/interview-questions/:eventId/:candidateId', aiController.getInterviewQuestions.bind(aiController));

export default router;
