import express from 'express';
import { aiService } from '../services/ai';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();

// Chat with AI
const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.string().optional()
});

router.post('/chat', authenticateToken, validateRequest(chatSchema), async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    const response = await aiService.processMessage(userId, message, context);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Get personalized recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await aiService.generateRecommendations(userId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

// Analyze progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysis = await aiService.analyzeProgress(userId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Progress Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze progress'
    });
  }
});

// Get next steps
router.get('/next-steps', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const nextSteps = await aiService.suggestNextSteps(userId);

    res.json({
      success: true,
      data: nextSteps
    });
  } catch (error) {
    console.error('Next Steps Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest next steps'
    });
  }
});

// Analyze resume
const resumeSchema = z.object({
  resumeText: z.string().min(10, 'Resume text must be at least 10 characters')
});

router.post('/analyze-resume', authenticateToken, validateRequest(resumeSchema), async (req, res) => {
  try {
    const { resumeText } = req.body;
    const analysis = await aiService.analyzeResume(resumeText);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume'
    });
  }
});

// Analyze emotion in text
const emotionSchema = z.object({
  text: z.string().min(1, 'Text is required')
});

router.post('/analyze-emotion', authenticateToken, validateRequest(emotionSchema), async (req, res) => {
  try {
    const { text } = req.body;
    const analysis = await aiService.analyzeEmotion(text);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Emotion Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze emotion'
    });
  }
});

// Analyze culture fit
const cultureFitSchema = z.object({
  userProfile: z.object({
    name: z.string(),
    role: z.string(),
    department: z.string(),
    experience: z.string().optional(),
    skills: z.array(z.string()).optional()
  }),
  companyValues: z.array(z.string())
});

router.post('/analyze-culture-fit', authenticateToken, validateRequest(cultureFitSchema), async (req, res) => {
  try {
    const { userProfile, companyValues } = req.body;
    const analysis = await aiService.analyzeCultureFit(userProfile, companyValues);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Culture Fit Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze culture fit'
    });
  }
});

// Get suggested questions
const questionsSchema = z.object({
  context: z.string().optional()
});

router.post('/suggested-questions', authenticateToken, validateRequest(questionsSchema), async (req, res) => {
  try {
    const { context } = req.body;
    const userId = req.user.id;
    const questions = await aiService.generateSuggestedQuestions(userId, context);

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Suggested Questions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggested questions'
    });
  }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const history = await aiService.getChatHistory(userId, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history'
    });
  }
});

// Get AI insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const insights = await aiService.getInsights(userId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

// Get AI model status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        gemini: process.env['GEMINI_API_KEY'] ? 'Available' : 'Not configured',
        openai: process.env['OPENAI_API_KEY'] ? 'Available' : 'Not configured',
        huggingFace: process.env['HUGGING_FACE_TOKEN'] ? 'Available' : 'Not configured',
        primaryModel: process.env['GEMINI_API_KEY'] ? 'Gemini' : 'OpenAI'
      }
    });
  } catch (error) {
    console.error('AI Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI status'
    });
  }
});

export default router;
