# MediConnect AI - Environment Configuration

## Google Gemini API Setup

To enable the AI Medical Assistant chatbot functionality, you need to set up your Google Gemini API key:

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables
Add the following to your `.env` file in the backend directory:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Customize AI behavior
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
```

### 3. Install Required Dependencies
Run the following command in the backend directory:

```bash
npm install @google/generative-ai
```

## Chatbot Features

### 🤖 AI Medical Assistant Capabilities
- **Multi-language Support**: English, Sinhala (සිංහල), Tamil (தமிழ்)
- **Symptom Assessment**: Analyzes symptoms and provides guidance
- **Specialist Recommendations**: Suggests appropriate medical specialists
- **Emergency Detection**: Identifies urgent medical situations
- **Medication Information**: Provides medication guidance and safety info
- **Natural Language Processing**: Understands context and medical terminology

### 🌐 Supported Languages
- **English**: Primary language with full medical knowledge base
- **Sinhala (සිංහල)**: Localized responses for Sri Lankan patients
- **Tamil (தமிழ்)**: Tamil language support for Tamil-speaking patients

### 🏥 Medical Specialties Supported
The chatbot can recommend these specialists:
- Cardiology (Heart & Cardiovascular)
- Dermatology (Skin, Hair, Nails)
- Endocrinology (Hormonal Disorders)
- Gastroenterology (Digestive System)
- Neurology (Brain & Nervous System)
- Orthopedics (Bones, Joints, Muscles)
- Psychiatry (Mental Health)
- Pulmonology (Lungs & Respiratory)
- Urology (Urinary System)
- Gynecology (Women's Health)
- Pediatrics (Children's Health)
- Ophthalmology (Eye & Vision)
- ENT (Ear, Nose, Throat)
- Oncology (Cancer Care)

### 🚨 Emergency Detection
The system automatically detects emergency keywords:
- Chest pain, Heart attack, Stroke
- Severe bleeding, Difficulty breathing
- Severe injury, Poisoning, Seizure
- Severe allergic reaction, Overdose
- And more critical conditions

### 🔒 Privacy & Security
- All conversations are logged for quality and safety
- No personal health information is stored in chat logs
- Conversations are encrypted in transit
- Emergency alerts are prioritized and flagged

## API Endpoints

### Chat with AI Assistant
```
POST /api/chatbot/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "I have a headache and fever",
  "conversationId": "optional_conversation_id"
}
```

### Get Available Specialists
```
GET /api/chatbot/specialists
Authorization: Bearer <token>
```

### Get Supported Languages
```
GET /api/chatbot/languages
Authorization: Bearer <token>
```

## Integration with MediConnect Platform

### 🔗 Connected Features
- **Patient History**: Chatbot can access patient medical history for context
- **Appointment Booking**: Can suggest booking appointments with recommended specialists
- **Health Records**: Integrates with patient health records for personalized advice
- **Emergency Services**: Direct integration with emergency contact systems

### 📊 Analytics & Monitoring
- Conversation analytics for improving medical responses
- Emergency alert monitoring and response tracking
- Language usage statistics for multilingual optimization
- Specialist recommendation accuracy tracking

## Customization Options

### Language Customization
To add more languages, update the `languagePatterns` and `getSystemPrompt` functions in `/backend/routes/chatbot.js`

### Medical Knowledge Base
Extend the `specialists` object and emergency keywords array to add more medical specialties and conditions.

### AI Behavior Tuning
Adjust the system prompts in `getSystemPrompt()` to modify how the AI responds to different types of medical queries.

## Troubleshooting

### Common Issues
1. **API Key Error**: Ensure GEMINI_API_KEY is properly set in .env file
2. **Rate Limiting**: Gemini API has usage limits - consider implementing request queuing
3. **Language Detection**: If language detection is inaccurate, users can manually select language
4. **Emergency Responses**: Emergency keywords are case-insensitive and support multiple languages

### Monitoring & Logs
Check the application logs for chatbot-related errors:
- Backend logs: `backend/logs/combined.log`
- Emergency alerts: Logged with high priority in system logs
- API usage: Monitor Gemini API usage in Google Cloud Console

## Legal & Compliance

⚠️ **Important Medical Disclaimer**
This AI assistant is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

### Compliance Notes
- Ensure compliance with local healthcare regulations
- Consider HIPAA/GDPR requirements for health data
- Implement proper consent mechanisms for AI medical assistance
- Regular audits of AI responses for medical accuracy

---

For support or questions about the AI Medical Assistant integration, contact the development team.