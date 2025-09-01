# 🚀 HireRoyale Onboarding System

A comprehensive AI-powered onboarding platform designed to streamline new employee experiences with gamification, real-time collaboration, and intelligent assistance.

## ✨ Key Features

### 🤖 AI-Powered Assistance
- **Intelligent Chatbot**: Context-aware AI assistant with personalized responses
- **Progress Analysis**: AI-driven insights and recommendations
- **Suggested Questions**: Smart question suggestions based on user context
- **Confidence Scoring**: AI response confidence indicators

### 🎮 Gamification System
- **Badge System**: Earn badges for completing tasks and milestones
- **Points & Levels**: Experience points and level progression
- **Leaderboards**: Compare progress with team members
- **Achievement Tracking**: Real-time achievement notifications

### 📊 Real-Time Features
- **Live Updates**: Real-time task and progress updates
- **Socket.IO Integration**: WebSocket connections for instant communication
- **Live Notifications**: Push notifications for important events
- **Collaborative Features**: Team member interactions and meetings

### 🎯 Personalized Learning
- **Role-Based Content**: Customized learning paths by role
- **Progress Tracking**: Detailed progress analytics
- **Interactive Modules**: Video, document, and quiz content
- **Adaptive Learning**: AI-recommended next steps

### 🔧 Technical Excellence
- **TypeScript**: Full type safety and better developer experience
- **Prisma ORM**: Type-safe database operations
- **Real-time WebSockets**: Socket.IO for live updates
- **RESTful APIs**: Clean, documented API endpoints
- **Authentication**: JWT-based secure authentication

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** with **SQLite**
- **Socket.IO** for real-time features
- **OpenAI API** for AI integration
- **JWT** for authentication
- **Winston** for logging

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **HeroUI** components
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **Zustand** for state management
- **React Query** for data fetching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd onboarding/backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your OpenAI API key
OPENAI_API_KEY=your-openai-api-key-here

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd onboarding/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **Health Check**: http://localhost:8001/health

## 📁 Project Structure

```
onboarding/
├── backend/
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   └── server.ts        # Main server file
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and API
│   │   └── store/          # State management
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=8001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8001
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Tasks
- `GET /api/tasks` - Get user tasks
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/stats/overview` - Get task statistics

### AI Features
- `POST /api/ai/chat` - AI chat response
- `GET /api/ai/recommendations` - Get AI recommendations
- `GET /api/ai/progress-analysis` - Analyze progress
- `GET /api/ai/suggested-questions` - Get suggested questions

### Badges & Gamification
- `GET /api/badges` - Get user badges
- `GET /api/badges/leaderboard` - Get leaderboard

### Learning
- `GET /api/learning` - Get learning paths
- `PATCH /api/learning/modules/:id/progress` - Update module progress

### Real-time Events (Socket.IO)
- `task-update` - Task status updates
- `progress-update` - Progress updates
- `badges-earned` - Badge unlock notifications
- `ai-message` - AI chat messages
- `ai-response` - AI responses

## 🎮 Gamification System

### Badge Types
- **Task Badges**: Complete onboarding tasks
- **Learning Badges**: Finish learning modules
- **Social Badges**: Connect with team members
- **Time Badges**: Stay active over time

### Points System
- **Task Completion**: 50 points per task
- **Learning Modules**: 25 points per module
- **Meetings**: 30 points per meeting
- **Badges**: 100 points per badge
- **Daily Activity**: 10 points per day

### Levels
- **Level 1**: 0-999 points
- **Level 2**: 1000-1999 points
- **Level 3**: 2000-2999 points
- And so on...

## 🤖 AI Integration

### Features
- **Context-Aware Responses**: AI considers user progress and role
- **Personalized Recommendations**: Tailored suggestions based on user data
- **Confidence Scoring**: AI response confidence indicators
- **Category Classification**: Responses categorized by type
- **Suggested Actions**: AI-recommended next steps

### AI Categories
- **Task**: Task-related questions and guidance
- **Learning**: Learning path and module assistance
- **Social**: Team collaboration and networking
- **Technical**: Technical setup and development
- **Policy**: Company policies and procedures

## 🔧 Development

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Code Quality
```bash
# Backend linting
npm run lint

# Backend formatting
npm run format

# Frontend linting
npm run lint
```

### Testing
```bash
# Backend tests
npm test

# Frontend tests
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Run database migrations
3. Build the application
4. Start the server

### Frontend Deployment
1. Set up environment variables
2. Build the application
3. Deploy to your hosting platform

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8001
CMD ["npm", "start"]
```

## 📊 Performance Features

### Frontend Optimizations
- **Virtual Scrolling**: Efficient rendering of large lists
- **Lazy Loading**: Components loaded on demand
- **Debounced Updates**: Optimized state changes
- **Intersection Observer**: Performance monitoring

### Backend Optimizations
- **Rate Limiting**: API request throttling
- **Compression**: Response compression
- **Caching**: Redis caching (optional)
- **Connection Pooling**: Database connection optimization

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schema validation
- **CORS Protection**: Cross-origin request control
- **Helmet**: Security headers
- **SQL Injection Prevention**: Prisma ORM protection

## 🎨 UI/UX Features

### Accessibility
- **Screen Reader Support**: ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop Experience**: Enhanced desktop features

### Animations
- **Framer Motion**: Smooth page transitions
- **Micro-interactions**: Hover effects and feedback
- **Loading States**: Skeleton screens and spinners

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic onboarding system
- ✅ AI chatbot integration
- ✅ Gamification features
- ✅ Real-time updates

### Phase 2 (Future)
- 🔄 Mobile app development
- 🔄 Advanced analytics dashboard
- 🔄 HRIS integration
- 🔄 Multi-tenant support

### Phase 3 (Future)
- 🔄 Machine learning insights
- 🔄 Predictive analytics
- 🔄 Advanced AI features
- 🔄 Enterprise features

---

**Built with ❤️ for modern onboarding experiences**



