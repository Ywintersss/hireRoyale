# AI Integration Guide for HireRoyale Onboarding System

This guide provides step-by-step instructions for obtaining free API keys and configuring AI models for the onboarding system.

## 🎯 Overview

The system uses three AI providers:
1. **Google Gemini** (Primary AI) - Free tier with generous limits
2. **Hugging Face** (Specialized models) - Free tier for inference
3. **OpenAI** (Fallback) - Free tier available

## 🔑 Step 1: Get Google Gemini API Key

### 1.1 Visit Google AI Studio
- Go to: https://makersuite.google.com/app/apikey
- Sign in with your Google account

### 1.2 Create API Key
- Click "Create API Key"
- Copy the generated key (starts with `AIza...`)
- **Free Tier Limits**: 15 requests per minute, 1500 requests per day

### 1.3 Configure in Environment
```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere
GEMINI_MODEL=gemini-pro
```

## 🔑 Step 2: Get Hugging Face Token

### 2.1 Create Hugging Face Account
- Visit: https://huggingface.co/join
- Sign up for a free account

### 2.2 Generate Access Token
- Go to: https://huggingface.co/settings/tokens
- Click "New token"
- Name it: "HireRoyale-Onboarding"
- Select "Read" permissions
- Copy the token (starts with `hf_...`)

### 2.3 Configure in Environment
```env
HUGGING_FACE_TOKEN=hf_YourActualTokenHere
HUGGING_FACE_API_URL=https://api.huggingface.co
```

## 🤖 Step 3: Configure Free Model URLs

### 3.1 Resume Analysis Model
**URL**: `https://api.huggingface.co/models/microsoft/DialoGPT-medium`
- **Purpose**: Analyze resume text and extract skills/experience
- **Free**: Yes, with rate limits
- **Alternative**: Use Gemini for text analysis

### 3.2 Emotion Analysis Model
**URL**: `https://api.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base`
- **Purpose**: Analyze emotion in user messages
- **Free**: Yes, with rate limits
- **Capabilities**: joy, sadness, anger, fear, surprise, disgust, neutral

### 3.3 Culture Fit Model
**URL**: `https://api.huggingface.co/models/facebook/bart-large-cnn`
- **Purpose**: Analyze text for cultural fit assessment
- **Free**: Yes, with rate limits
- **Alternative**: Use Gemini for cultural analysis

## 🔧 Step 4: Complete Environment Configuration

Update your `.env` file with all the keys:

```env
# Google Gemini Configuration (Primary AI)
GEMINI_API_KEY=AIzaSyYourActualKeyHere
GEMINI_MODEL=gemini-pro

# Hugging Face Configuration
HUGGING_FACE_TOKEN=hf_YourActualTokenHere
HUGGING_FACE_API_URL=https://api.huggingface.co

# Custom Model Endpoints (Free Models)
RESUME_ANALYSIS_MODEL_URL=https://api.huggingface.co/models/microsoft/DialoGPT-medium
EMOTION_MODEL_URL=https://api.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base
CULTURE_FIT_MODEL_URL=https://api.huggingface.co/models/facebook/bart-large-cnn

# OpenAI Configuration (Fallback - Optional)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

## 🚀 Step 5: Install Dependencies

Run these commands in your backend directory:

```bash
cd onboarding/backend
npm install @google/generative-ai langchain-google-genai axios node-fetch
```

## 🧪 Step 6: Test the Integration

### 6.1 Test Gemini Chat
```bash
curl -X POST http://localhost:8001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello! I need help with my onboarding."
  }'
```

### 6.2 Test Emotion Analysis
```bash
curl -X POST http://localhost:8001/api/ai/analyze-emotion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "I am excited to start my new role!"
  }'
```

### 6.3 Check AI Status
```bash
curl -X GET http://localhost:8001/api/ai/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Free Tier Limits & Costs

### Google Gemini
- **Requests**: 15 per minute, 1,500 per day
- **Cost**: $0 (completely free)
- **Model**: gemini-pro (latest)

### Hugging Face
- **Requests**: 30,000 per month
- **Cost**: $0 (completely free)
- **Models**: All public models available

### OpenAI (Optional Fallback)
- **Requests**: 3 requests per minute (free tier)
- **Cost**: $0.002 per 1K tokens (very cheap)
- **Model**: gpt-3.5-turbo

## 🔄 Fallback Strategy

The system implements intelligent fallback:

1. **Primary**: Gemini (fastest, free)
2. **Secondary**: OpenAI (if Gemini fails)
3. **Tertiary**: Basic responses (if both fail)

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Gemini API key not found"
- Ensure `GEMINI_API_KEY` is set in `.env`
- Check for typos in the key
- Verify the key starts with `AIza`

#### 2. "Hugging Face token invalid"
- Regenerate token at https://huggingface.co/settings/tokens
- Ensure token starts with `hf_`
- Check token permissions

#### 3. "Rate limit exceeded"
- Wait for rate limit to reset
- Implement request queuing
- Use fallback models

#### 4. "Model not available"
- Check model URL is correct
- Verify model is public
- Try alternative models

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.GEMINI_API_KEY ? 'Gemini: OK' : 'Gemini: Missing')"
node -e "console.log(process.env.HUGGING_FACE_TOKEN ? 'HF: OK' : 'HF: Missing')"

# Test API connectivity
curl -H "Authorization: Bearer YOUR_HF_TOKEN" \
  https://api.huggingface.co/models/microsoft/DialoGPT-medium
```

## 📈 Monitoring & Analytics

### Track Usage
- Monitor API calls in logs
- Check rate limit usage
- Track response times

### Log Files
- `logs/combined.log` - All requests
- `logs/error.log` - Errors only

### Metrics to Watch
- Response success rate
- Average response time
- Rate limit hits
- Fallback usage

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days)
4. **Monitor usage** for unusual patterns
5. **Implement rate limiting** on your side

## 🎯 Hackathon Tips

### For Demo
1. **Pre-load responses** for common questions
2. **Use mock data** if APIs are slow
3. **Show fallback behavior** as a feature
4. **Highlight cost savings** vs. paid APIs

### For Judges
1. **Emphasize free tier usage**
2. **Show real-time AI responses**
3. **Demonstrate fallback reliability**
4. **Highlight scalability potential**

## 📞 Support

If you encounter issues:

1. **Check logs**: `tail -f logs/combined.log`
2. **Verify keys**: Use debug commands above
3. **Test endpoints**: Use curl commands above
4. **Check documentation**: 
   - Gemini: https://ai.google.dev/
   - Hugging Face: https://huggingface.co/docs

## 🎉 Success!

Once configured, your onboarding system will have:
- ✅ Free AI chat powered by Gemini
- ✅ Free emotion analysis
- ✅ Free resume analysis
- ✅ Free culture fit assessment
- ✅ Intelligent fallback system
- ✅ Real-time responses
- ✅ Cost-effective operation

Your hackathon project now has cutting-edge AI capabilities at zero cost! 🚀

