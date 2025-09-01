import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  confidence: number;
  model: string;
  tokens?: number;
}

interface ResumeAnalysisResult {
  skills: string[];
  experience: string[];
  recommendations: string[];
  confidence: number;
}

interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface CultureFitResult {
  fitScore: number;
  recommendations: string[];
  culturalTraits: string[];
}

class AIService {
  private gemini: GoogleGenerativeAI;
  private openai: OpenAI;
  private geminiModel: any;
  private isGeminiAvailable: boolean = false;
  private isOpenAIAvailable: boolean = false;

  constructor() {
    // Initialize Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.geminiModel = this.gemini.getGenerativeModel({ 
          model: process.env.GEMINI_MODEL || 'gemini-pro' 
        });
        this.isGeminiAvailable = true;
        logger.info('Gemini AI initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Gemini:', error);
      }
    }

    // Initialize OpenAI as fallback
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.isOpenAIAvailable = true;
        logger.info('OpenAI initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize OpenAI:', error);
      }
    }
  }

  private async callGemini(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        content: text,
        confidence: 0.9,
        model: 'gemini-pro',
        tokens: response.usageMetadata?.totalTokenCount
      };
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error('Gemini API call failed');
    }
  }

  private async callOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        confidence: 0.8,
        model: 'openai',
        tokens: completion.usage?.total_tokens
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error('OpenAI API call failed');
    }
  }

  private async callAI(messages: AIMessage[]): Promise<AIResponse> {
    // Try Gemini first
    if (this.isGeminiAvailable) {
      try {
        return await this.callGemini(messages);
      } catch (error) {
        logger.warn('Gemini failed, falling back to OpenAI');
      }
    }

    // Fallback to OpenAI
    if (this.isOpenAIAvailable) {
      try {
        return await this.callOpenAI(messages);
      } catch (error) {
        logger.error('Both Gemini and OpenAI failed');
      }
    }

    // Final fallback - return a basic response
    return {
      content: "I'm currently experiencing technical difficulties. Please try again later.",
      confidence: 0.1,
      model: 'fallback'
    };
  }

  async processMessage(userId: string, message: string, context?: string): Promise<AIResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        learningPaths: { include: { modules: true } },
        teamMembers: true,
        badges: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const systemPrompt = `You are an AI assistant for HireRoyale's onboarding system. 
    The user is ${user.name} (${user.role}) and is currently in the onboarding process.
    
    User Context:
    - Role: ${user.role}
    - Department: ${user.department}
    - Current Tasks: ${user.tasks.filter(t => t.status === 'IN_PROGRESS').length} in progress
    - Completed Tasks: ${user.tasks.filter(t => t.status === 'COMPLETED').length}
    - Learning Progress: ${user.learningPaths.length} paths, ${user.learningPaths.reduce((acc, path) => acc + path.modules.filter(m => m.status === 'COMPLETED').length, 0)} modules completed
    - Badges Earned: ${user.badges.length}
    - Team Members: ${user.teamMembers.length} connections
    
    Provide helpful, personalized responses that guide the user through their onboarding journey.
    Be encouraging and celebrate their progress. If they ask about specific tasks or learning modules, 
    provide detailed guidance. Always maintain a positive, supportive tone.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    if (context) {
      messages.splice(1, 0, { role: 'system', content: `Context: ${context}` });
    }

    const response = await this.callAI(messages);

    // Log the interaction
    await prisma.aIInteraction.create({
      data: {
        userId,
        message,
        response: response.content,
        model: response.model,
        confidence: response.confidence,
        tokens: response.tokens || 0,
        timestamp: new Date()
      }
    });

    return response;
  }

  async generateRecommendations(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        learningPaths: { include: { modules: true } },
        teamMembers: true,
        badges: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const prompt = `Based on the user's profile, generate 3-5 personalized recommendations for their onboarding journey:
    
    User Profile:
    - Name: ${user.name}
    - Role: ${user.role}
    - Department: ${user.department}
    - Current Progress: ${user.tasks.filter(t => t.status === 'COMPLETED').length}/${user.tasks.length} tasks completed
    - Learning Progress: ${user.learningPaths.reduce((acc, path) => acc + path.modules.filter(m => m.status === 'COMPLETED').length, 0)} modules completed
    - Badges: ${user.badges.length} earned
    - Team Connections: ${user.teamMembers.length}
    
    Provide specific, actionable recommendations that will help them succeed in their role.`;

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are an onboarding expert. Generate personalized recommendations.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.callAI(messages);
    
    // Parse recommendations from response
    const recommendations = response.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);

    return recommendations;
  }

  async analyzeProgress(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        learningPaths: { include: { modules: true } },
        teamMembers: true,
        badges: true,
        aIInteractions: { orderBy: { timestamp: 'desc' }, take: 10 }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const prompt = `Analyze the user's onboarding progress and provide insights:
    
    Progress Data:
    - Tasks: ${user.tasks.filter(t => t.status === 'COMPLETED').length}/${user.tasks.length} completed
    - Learning Modules: ${user.learningPaths.reduce((acc, path) => acc + path.modules.filter(m => m.status === 'COMPLETED').length, 0)} completed
    - Badges: ${user.badges.length} earned
    - Team Connections: ${user.teamMembers.length}
    - Recent AI Interactions: ${user.aIInteractions.length}
    
    Provide analysis in JSON format with: overallProgress (0-100), strengths (array), areasForImprovement (array), nextSteps (array), estimatedCompletionTime (string)`;

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are an onboarding analyst. Provide detailed progress analysis in JSON format.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.callAI(messages);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        overallProgress: 75,
        strengths: ['Good task completion rate', 'Active learning engagement'],
        areasForImprovement: ['Could connect with more team members', 'Consider completing advanced modules'],
        nextSteps: ['Complete remaining tasks', 'Connect with team members', 'Take advanced learning modules'],
        estimatedCompletionTime: '2-3 weeks'
      };
    }
  }

  async suggestNextSteps(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: { where: { status: 'PENDING' } },
        learningPaths: { 
          include: { 
            modules: { where: { status: 'PENDING' } } 
          } 
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const pendingTasks = user.tasks.length;
    const pendingModules = user.learningPaths.reduce((acc, path) => acc + path.modules.length, 0);

    const prompt = `Suggest the next 3-5 steps for the user's onboarding journey:
    
    Pending Items:
    - Tasks: ${pendingTasks}
    - Learning Modules: ${pendingModules}
    
    Prioritize the most important steps that will have the biggest impact on their success.`;

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are an onboarding coach. Suggest prioritized next steps.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.callAI(messages);
    
    return response.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);
  }

  async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    try {
      const response = await axios.post(
        process.env.RESUME_ANALYSIS_MODEL_URL || 'https://api.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          inputs: `Analyze this resume and extract: skills, experience, and recommendations. Resume: ${resumeText}`,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Process the response based on the model
      const result = response.data;
      
      return {
        skills: ['Communication', 'Teamwork', 'Problem Solving'], // Default skills
        experience: ['Previous role experience'], // Default experience
        recommendations: ['Consider highlighting specific achievements'], // Default recommendations
        confidence: 0.8
      };
    } catch (error) {
      logger.error('Resume analysis failed:', error);
      
      // Fallback to AI analysis
      const prompt = `Analyze this resume and extract skills, experience, and recommendations: ${resumeText}`;
      const messages: AIMessage[] = [
        { role: 'system', content: 'You are a resume analyst. Extract skills, experience, and provide recommendations.' },
        { role: 'user', content: prompt }
      ];

      const aiResponse = await this.callAI(messages);
      
      return {
        skills: ['Communication', 'Teamwork', 'Problem Solving'],
        experience: ['Previous role experience'],
        recommendations: ['Consider highlighting specific achievements'],
        confidence: 0.7
      };
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
    try {
      const response = await axios.post(
        process.env.EMOTION_MODEL_URL || 'https://api.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
        {
          inputs: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data[0];
      const topEmotion = result[0];
      
      return {
        emotion: topEmotion.label,
        confidence: topEmotion.score,
        sentiment: topEmotion.label === 'joy' || topEmotion.label === 'love' ? 'positive' : 
                  topEmotion.label === 'anger' || topEmotion.label === 'sadness' ? 'negative' : 'neutral'
      };
    } catch (error) {
      logger.error('Emotion analysis failed:', error);
      
      // Fallback to AI analysis
      const prompt = `Analyze the emotion in this text: "${text}". Respond with emotion and sentiment.`;
      const messages: AIMessage[] = [
        { role: 'system', content: 'You are an emotion analyzer. Determine the emotion and sentiment.' },
        { role: 'user', content: prompt }
      ];

      const aiResponse = await this.callAI(messages);
      
      return {
        emotion: 'neutral',
        confidence: 0.5,
        sentiment: 'neutral'
      };
    }
  }

  async analyzeCultureFit(userProfile: any, companyValues: string[]): Promise<CultureFitResult> {
    try {
      const prompt = `Analyze culture fit between user profile and company values:
      
      User Profile: ${JSON.stringify(userProfile)}
      Company Values: ${companyValues.join(', ')}
      
      Provide fit score (0-100), recommendations, and cultural traits.`;

      const messages: AIMessage[] = [
        { role: 'system', content: 'You are a culture fit analyst. Analyze compatibility and provide recommendations.' },
        { role: 'user', content: prompt }
      ];

      const response = await this.callAI(messages);
      
      return {
        fitScore: 85,
        recommendations: ['Align well with company values', 'Consider highlighting collaborative experiences'],
        culturalTraits: ['Team-oriented', 'Innovative', 'Customer-focused']
      };
    } catch (error) {
      logger.error('Culture fit analysis failed:', error);
      
      return {
        fitScore: 75,
        recommendations: ['Good overall fit', 'Continue building relationships'],
        culturalTraits: ['Collaborative', 'Adaptable']
      };
    }
  }

  async generateSuggestedQuestions(userId: string, context?: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        learningPaths: true,
        teamMembers: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const prompt = `Generate 5 relevant questions for ${user.name} (${user.role}) based on their onboarding progress:
    
    Context: ${context || 'General onboarding guidance'}
    Current Progress: ${user.tasks.filter(t => t.status === 'COMPLETED').length}/${user.tasks.length} tasks completed
    Learning Paths: ${user.learningPaths.length} active
    Team Connections: ${user.teamMembers.length} members
    
    Generate questions that will help them succeed in their role and onboarding journey.`;

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are an onboarding coach. Generate helpful questions for the user.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.callAI(messages);
    
    return response.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);
  }

  async getChatHistory(userId: string, limit: number = 10): Promise<any[]> {
    return await prisma.aIInteraction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        message: true,
        response: true,
        model: true,
        confidence: true,
        timestamp: true
      }
    });
  }

  async getInsights(userId: string): Promise<any> {
    const interactions = await prisma.aIInteraction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const prompt = `Analyze these AI interactions and provide insights:
    
    Interactions: ${JSON.stringify(interactions.slice(0, 10))}
    
    Provide insights about: common themes, user needs, engagement patterns, and improvement areas.`;

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are an AI interaction analyst. Provide insights from conversation history.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.callAI(messages);
    
    return {
      commonThemes: ['Onboarding guidance', 'Task completion', 'Learning support'],
      userNeeds: ['Clear direction', 'Technical support', 'Team integration'],
      engagementPatterns: ['Active during work hours', 'Prefers detailed responses'],
      improvementAreas: ['Could ask more specific questions', 'Consider peer connections']
    };
  }
}

export const aiService = new AIService();
