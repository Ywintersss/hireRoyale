import express from 'express';
import { aiService } from '../services/ai';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();

// Chat with AI
const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required'),
    context: z.string().optional()
  })
});

router.post('/chat', validateRequest(chatSchema), asyncHandler(async (req, res) => {
  const { message, context } = req.body;
  const userId = req.user.id;

  const response = await aiService.processMessage(userId, message, context);

  res.json({
    success: true,
    data: response
  });
}));

// Get personalized recommendations
router.get('/recommendations', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const recommendations = await aiService.generateRecommendations(userId);

  res.json({
    success: true,
    data: recommendations
  });
}));

// Analyze progress
router.get('/progress', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const analysis = await aiService.analyzeProgress(userId);

  res.json({
    success: true,
    data: analysis
  });
}));

// Get next steps
router.get('/next-steps', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nextSteps = await aiService.suggestNextSteps(userId);

  res.json({
    success: true,
    data: nextSteps
  });
}));

// Analyze resume
const resumeSchema = z.object({
  body: z.object({
    resumeText: z.string().min(10, 'Resume text must be at least 10 characters')
  })
});

router.post('/analyze-resume', validateRequest(resumeSchema), asyncHandler(async (req, res) => {
  const { resumeText } = req.body;
  const analysis = await aiService.analyzeResume(resumeText);

  res.json({
    success: true,
    data: analysis
  });
}));

// Analyze emotion in text
const emotionSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text is required')
  })
});

router.post('/analyze-emotion', validateRequest(emotionSchema), asyncHandler(async (req, res) => {
  const { text } = req.body;
  const analysis = await aiService.analyzeEmotion(text);

  res.json({
    success: true,
    data: analysis
  });
}));

// Analyze culture fit
const cultureFitSchema = z.object({
  body: z.object({
    userProfile: z.object({
      name: z.string(),
      role: z.string(),
      department: z.string(),
      experience: z.string().optional(),
      skills: z.array(z.string()).optional()
    }),
    companyValues: z.array(z.string())
  })
});

router.post('/analyze-culture-fit', validateRequest(cultureFitSchema), asyncHandler(async (req, res) => {
  const { userProfile, companyValues } = req.body;
  const analysis = await aiService.analyzeCultureFit(userProfile, companyValues);

  res.json({
    success: true,
    data: analysis
  });
}));

// Get suggested questions
const questionsSchema = z.object({
  body: z.object({
    context: z.string().optional()
  })
});

router.post('/suggested-questions', validateRequest(questionsSchema), asyncHandler(async (req, res) => {
  const { context } = req.body;
  const userId = req.user.id;
  const questions = await aiService.generateSuggestedQuestions(userId, context);

  res.json({
    success: true,
    data: questions
  });
}));

// Get chat history
router.get('/history', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit as string) || 10;
  const history = await aiService.getChatHistory(userId, limit);

  res.json({
    success: true,
    data: history
  });
}));

// Get AI insights
router.get('/insights', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const insights = await aiService.getInsights(userId);

  res.json({
    success: true,
    data: insights
  });
}));

// Get AI model status
router.get('/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      gemini: process.env['GEMINI_API_KEY'] ? 'Available' : 'Not configured',
      openai: process.env['OPENAI_API_KEY'] ? 'Available' : 'Not configured',
      huggingFace: process.env['HUGGING_FACE_TOKEN'] ? 'Available' : 'Not configured',
      primaryModel: process.env['GEMINI_API_KEY'] ? 'Gemini' : 'OpenAI'
    }
  });
}));

export default router;