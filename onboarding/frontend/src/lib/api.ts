import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  points: number;
  level: number;
  onboardingStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  estimatedTime: number;
  order: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  criteria: string;
  isEarned: boolean;
  earnedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  modules: LearningModule[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  order: number;
  completedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  email: string;
  isConnected: boolean;
  connectedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  attendees: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  model: string;
  tokens?: number;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  recommendations: string[];
  confidence: number;
}

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface CultureFitAnalysis {
  fitScore: number;
  recommendations: string[];
  culturalTraits: string[];
}

export interface ProgressAnalysis {
  overallProgress: number;
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
  estimatedCompletionTime: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/users/profile');
    return response.data as { success: boolean; data: User };
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<{ success: boolean; data: Task[] }> => {
    const response = await api.get('/tasks');
    return response.data as { success: boolean; data: Task[] };
  },

  getById: async (id: string): Promise<{ success: boolean; data: Task }> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data as { success: boolean; data: Task };
  },

  updateStatus: async (id: string, status: Task['status']) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  updateProgress: async (id: string, progress: number) => {
    const response = await api.patch(`/tasks/${id}/progress`, { progress });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },
};

// Badges API
export const badgesAPI = {
  getUserBadges: async (): Promise<{ success: boolean; data: Badge[] }> => {
    const response = await api.get('/badges/user');
    return response.data as { success: boolean; data: Badge[] };
  },

  getLeaderboard: async () => {
    const response = await api.get('/badges/leaderboard');
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/badges/available');
    return response.data;
  },
};

// Meetings API
export const meetingsAPI = {
  getAll: async (): Promise<{ success: boolean; data: Meeting[] }> => {
    const response = await api.get('/meetings');
    return response.data as { success: boolean; data: Meeting[] };
  },

  create: async (meetingData: {
    title: string;
    description: string;
    date: string;
    duration: number;
    attendees: string[];
  }) => {
    const response = await api.post('/meetings', meetingData);
    return response.data;
  },

  updateStatus: async (id: string, status: Meeting['status']) => {
    const response = await api.patch(`/meetings/${id}/status`, { status });
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<{ success: boolean; data: Notification[] }> => {
    const response = await api.get('/notifications');
    return response.data as { success: boolean; data: Notification[] };
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

// Learning API
export const learningAPI = {
  getPaths: async (): Promise<{ success: boolean; data: LearningPath[] }> => {
    const response = await api.get('/learning/paths');
    return response.data as { success: boolean; data: LearningPath[] };
  },

  getModules: async (pathId: string) => {
    const response = await api.get(`/learning/paths/${pathId}/modules`);
    return response.data;
  },

  updateModuleProgress: async (moduleId: string, status: LearningModule['status']) => {
    const response = await api.patch(`/learning/modules/${moduleId}/progress`, { status });
    return response.data;
  },
};

// Team API
export const teamAPI = {
  getMembers: async (): Promise<{ success: boolean; data: TeamMember[] }> => {
    const response = await api.get('/team/members');
    return response.data as { success: boolean; data: TeamMember[] };
  },

  getStats: async () => {
    const response = await api.get('/team/stats');
    return response.data;
  },
};

// AI API - Updated for Gemini and Hugging Face
export const aiAPI = {
  // Chat with AI (Gemini primary, OpenAI fallback)
  chat: async (message: string, context?: string): Promise<{ success: boolean; data: AIResponse }> => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data as { success: boolean; data: AIResponse };
  },

  // Get personalized recommendations
  getRecommendations: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/ai/recommendations');
    return response.data as { success: boolean; data: string[] };
  },

  // Analyze progress
  analyzeProgress: async (): Promise<{ success: boolean; data: ProgressAnalysis }> => {
    const response = await api.get('/ai/progress');
    return response.data as { success: boolean; data: ProgressAnalysis };
  },

  // Get next steps
  getNextSteps: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/ai/next-steps');
    return response.data as { success: boolean; data: string[] };
  },

  // Analyze resume (Hugging Face model)
  analyzeResume: async (resumeText: string): Promise<{ success: boolean; data: ResumeAnalysis }> => {
    const response = await api.post('/ai/analyze-resume', { resumeText });
    return response.data as { success: boolean; data: ResumeAnalysis };
  },

  // Analyze emotion in text (Hugging Face model)
  analyzeEmotion: async (text: string): Promise<{ success: boolean; data: EmotionAnalysis }> => {
    const response = await api.post('/ai/analyze-emotion', { text });
    return response.data as { success: boolean; data: EmotionAnalysis };
  },

  // Analyze culture fit
  analyzeCultureFit: async (
    userProfile: any,
    companyValues: string[]
  ): Promise<{ success: boolean; data: CultureFitAnalysis }> => {
    const response = await api.post('/ai/analyze-culture-fit', { userProfile, companyValues });
    return response.data as { success: boolean; data: CultureFitAnalysis };
  },

  // Get suggested questions
  getSuggestedQuestions: async (context?: string): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.post('/ai/suggested-questions', { context });
    return response.data as { success: boolean; data: string[] };
  },

  // Get chat history
  getChatHistory: async (limit?: number): Promise<{ success: boolean; data: any[] }> => {
    const params = limit ? { limit } : {};
    const response = await api.get('/ai/history', { params });
    return response.data as { success: boolean; data: any[] };
  },

  // Get AI insights
  getInsights: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/ai/insights');
    return response.data as { success: boolean; data: any };
  },

  // Get AI model status
  getStatus: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/ai/status');
    return response.data as { success: boolean; data: any };
  },
};

export default api;
