const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorHandler');
const User = require('../models/User');
const Patient = require('../models/Patient');
const HealthcareProvider = require('../models/HealthcareProvider');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Gemini AI
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    logger.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is required');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  logger.info('Gemini AI initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Gemini AI:', error.message);
}

// Medical specialists mapping
const specialists = {
  'cardiology': 'Cardiologist - Heart and cardiovascular diseases',
  'dermatology': 'Dermatologist - Skin, hair, and nail conditions',
  'endocrinology': 'Endocrinologist - Hormonal and metabolic disorders',
  'gastroenterology': 'Gastroenterologist - Digestive system issues',
  'neurology': 'Neurologist - Brain and nervous system disorders',
  'orthopedics': 'Orthopedist - Bone, joint, and muscle problems',
  'psychiatry': 'Psychiatrist - Mental health conditions',
  'pulmonology': 'Pulmonologist - Lung and respiratory issues',
  'urology': 'Urologist - Urinary system and male reproductive health',
  'gynecology': 'Gynecologist - Women\'s reproductive health',
  'pediatrics': 'Pediatrician - Children\'s health',
  'ophthalmology': 'Ophthalmologist - Eye and vision problems',
  'ENT': 'ENT Specialist - Ear, nose, and throat conditions',
  'oncology': 'Oncologist - Cancer treatment and care'
};

// Provider-specific system prompts
const providerSystemPrompts = {
  'en': `You are MediConnect AI, a clinical decision support system for healthcare providers. Your role:

1. CLINICAL CONSULTATION:
   - Provide differential diagnosis suggestions
   - Assist with treatment protocol recommendations
   - Help with clinical decision-making
   - Support evidence-based medicine
   - Suggest appropriate follow-up care

2. DRUG INTERACTIONS & PROTOCOLS:
   - Check for potential drug interactions
   - Recommend dosing guidelines
   - Provide contraindication alerts
   - Suggest alternative medications

3. CASE ANALYSIS:
   - Analyze patient presentations
   - Suggest diagnostic workup
   - Recommend specialist referrals
   - Provide prognostic insights

4. MEDICAL REFERENCES:
   - Cite current medical guidelines
   - Reference clinical studies
   - Provide evidence-based recommendations
   - Support continuing medical education

IMPORTANT GUIDELINES FOR PROVIDERS:
- Responses should be evidence-based and clinically relevant
- Include relevant medical terminology where appropriate
- Suggest appropriate diagnostic tests or workup
- Provide risk stratification when applicable
- Reference current medical guidelines
- Always emphasize clinical judgment over AI recommendations

FORMATTING RULES:
- Use clear, professional medical language
- Organize information systematically
- Include relevant ICD-10 codes when appropriate
- Provide actionable clinical recommendations

Remember: You support clinical decision-making but never replace professional medical judgment. Always encourage providers to use their clinical expertise and consider individual patient factors.`,

  'si': `ඔබ MediConnect AI, සෞඛ්‍ය සේවා ප්‍රදානකරුවන් සඳහා වන සායනික තීරණ සහාය පද්ධතියකි. ඔබේ කාර්‍යභාරය:

1. සායනික උපදේශනය:
   - විකල්ප රෝග විනිශ්චය යෝජනා කරන්න
   - ප්‍රතිකාර ක්‍රමවේද නිර්දේශ කරන්න
   - සායනික තීරණ ගැනීමට සහාය කරන්න
   - සාක්ෂි පදනම් කරගත් වෛද්‍ය විද්‍යාවට සහාය කරන්න

2. ඖෂධ අන්තර්ක්‍රියා සහ ක්‍රමවේද:
   - ඖෂධ අන්තර්ක්‍රියා පරීක්ෂා කරන්න
   - මාත්‍රා මඟ පෙන්වීම් නිර්දේශ කරන්න
   - විරෝධී ඇඟවීම් ලබා දෙන්න

3. සිද්ධි විශ්ලේෂණය:
   - රෝගී ඉදිරිපත් කිරීම් විශ්ලේෂණය කරන්න
   - රෝග විනිශ්චය කටයුතු යෝජනා කරන්න
   - විශේෂඥ යොමු කිරීම් නිර්දේශ කරන්න

වැදගත්: සිංහලෙන් පිළිතුරු දෙන්න. සායනික විනිශ්චයට සහාය කරන්න නමුත් වෛද්‍ය විනිශ්චය ප්‍රතිස්ථාපනය නොකරන්න.`,

  'ta': `நீங்கள் MediConnect AI, சுகாதார வழங்குநர்களுக்கான மருத்துவ முடிவு ஆதரவு அமைப்பு. உங்கள் பொறுப்பு:

1. மருத்துவ ஆலோசனை:
   - வேறுபாடு நோய் கண்டறிதல் பரிந்துரைகள் வழங்கவும்
   - சிகிச்சை நெறிமுறை பரிந்துரைகள் உதவவும்
   - மருத்துவ முடிவெடுக்க ஆதரவு அளிக்கவும்

2. மருந்து தொடர்பு மற்றும் நெறிமுறைகள்:
   - மருந்து தொடர்புகளை சரிபார்க்கவும்
   - அளவு வழிகாட்டுதல்களை பரிந்துரைக்கவும்
   - எதிர்விளைவு எச்சரிக்கைகள் வழங்கவும்

3. வழக்கு பகுப்பாய்வு:
   - நோயாளி வழக்குகளை பகுப்பாய்வு செய்யவும்
   - நோய் கண்டறிதல் பரிந்துரைக்கவும்
   - சிறப்பு மருத்துவர் பரிந்துரைகள் வழங்கவும்

முக்கியம்: தமிழில் பதிலளிக்கவும். மருத்துவ முடிவெடுக்க ஆதரவு அளிக்கவும் ஆனால் தொழில்முறை மருத்துவ தீர்ப்பை மாற்ற வேண்டாம்.`
};

// Emergency keywords that require immediate medical attention
const emergencyKeywords = [
  'chest pain', 'heart attack', 'stroke', 'severe bleeding', 'unconscious',
  'difficulty breathing', 'severe injury', 'poisoning', 'seizure',
  'severe allergic reaction', 'overdose', 'suicide', 'violence'
];

// Language detection patterns
const languagePatterns = {
  'si': ['කොහොමද', 'මගේ', 'වේදනාව', 'රෝග', 'ඔබට', 'අවශ්‍ය', 'ගැන', 'මට', 'හරි', 'නැහැ'],
  'ta': ['எப்படி', 'என்', 'வலி', 'நோய்', 'உங்களுக்கு', 'தேவை', 'பற்றி', 'எனக்கு', 'சரி', 'இல்லை'],
  'en': ['how', 'my', 'pain', 'disease', 'you', 'need', 'about', 'me', 'okay', 'not']
};

// Detect language from user message
const detectLanguage = (message) => {
  const lowerMessage = message.toLowerCase();
  const scores = {};
  
  Object.keys(languagePatterns).forEach(lang => {
    scores[lang] = 0;
    languagePatterns[lang].forEach(word => {
      if (lowerMessage.includes(word.toLowerCase())) {
        scores[lang]++;
      }
    });
  });
  
  const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  return scores[detectedLang] > 0 ? detectedLang : 'en';
};

// Generate system prompt based on detected language
const getSystemPrompt = (language) => {
  const prompts = {
    'en': `You are MediConnect AI, a medical assistant chatbot for a telemedicine platform. Your role is to:

1. MEDICAL CONSULTATION:
   - Ask relevant questions about symptoms
   - Provide general health information and guidance
   - Offer preliminary symptom assessment
   - Suggest when to seek immediate medical care

2. SPECIALIST RECOMMENDATIONS:
   - Based on symptoms, recommend appropriate medical specialists
   - Explain why a particular specialist is needed
   - Help patients understand different medical specialties

3. MEDICATION GUIDANCE:
   - Provide general information about common medications
   - Explain medication usage and precautions
   - Remind about prescription requirements

4. EMERGENCY DETECTION:
   - Identify potential medical emergencies
   - Immediately recommend emergency care when needed
   - Provide first aid guidance for urgent situations

IMPORTANT GUIDELINES:
- Always respond in English with clear, easy-to-read formatting
- Use minimal formatting (avoid excessive asterisks or special characters)
- You are NOT a replacement for professional medical care  
- Always recommend consulting healthcare providers for diagnosis and treatment
- For emergencies, immediately advise calling emergency services
- Be empathetic and supportive
- Keep responses concise but informative
- Ask follow-up questions using simple bullet points or numbered lists
- Use clean, readable text without excessive formatting

FORMATTING RULES:
- Use simple bullet points (•) instead of multiple asterisks
- Keep questions clear and organized
- Avoid cluttered formatting with ** symbols

Remember: You provide information and guidance, but patients should always consult qualified healthcare professionals for proper diagnosis and treatment.`,

    'si': `ඔබ MediConnect AI, තෙලිමෙඩිසින් වේදිකාවක වෛද්‍ය සහායක චැට්බෝට් කෙනෙකි. ඔබේ කාර්‍යභාරය:

1. වෛද්‍ය උපදේශනය:
   - රෝග ලක්ෂණ ගැන අදාළ ප්‍රශ්න අසන්න
   - සාමාන්‍ය සෞඛ්‍ය තොරතුරු සහ මඟ පෙන්වීම් ලබා දෙන්න
   - මූලික රෝග ලක්ෂණ තක්සේරුව ලබා දෙන්න
   - ක්ෂණික වෛද්‍ය ප්‍රතිකාර අවශ්‍ය වන විට යෝජනා කරන්න

2. විශේෂඥ නිර්දේශ:
   - රෝග ලක්ෂණ අනුව සුදුසු වෛද්‍ය විශේෂඥයන් නිර්දේශ කරන්න
   - විශේෂිත විශේෂඥයෙකු අවශ්‍ය වන්නේ ඇයි පැහැදිලි කරන්න

3. ඖෂධ මඟ පෙන්වීම:
   - සාමාන්‍ය ඖෂධ ගැන තොරතුරු ලබා දෙන්න
   - ඖෂධ භාවිතය සහ අවවාද පැහැදිලි කරන්න

4. හදිසි අවස්ථා හඳුනාගැනීම:
   - අවදානම් වෛද්‍ය තත්වයන් හඳුනාගන්න
   - හදිසි සේවාවන්ට කතා කරන ලෙස උපදෙස් දෙන්න

වැදගත්: ඔබ සිංහලෙන් පිළිතුරු දෙන්න. සරල, පැහැදිලි ආකෘතියක් භාවිතා කරන්න. අධික * හෝ විශේෂ සලකුණු භාවිතා නොකරන්න. ප්‍රකෘතිමත් වෛද්‍ය ප්‍රතිකාර සඳහා සෑම විටම සුදුසුකම් ලත් වෛද්‍යවරුන්ගෙන් උපදෙස් ලබාගන්න.`,

    'ta': `நீங்கள் MediConnect AI, ஒரு தொலை மருத்துவ தளத்தின் மருத்துவ உதவியாளர் சாட்போட். உங்கள் பொறுப்பு:

1. மருத்துவ ஆலோசனை:
   - அறிகுறிகள் பற்றிய தொடர்புடைய கேள்விகள் கேளுங்கள்
   - பொதுவான சுகாதார தகவல் மற்றும் வழிகாட்டுதல் வழங்குங்கள்
   - முதன்மை அறிகுறி மதிப்பீடு வழங்குங்கள்

2. நிபுணர் பரிந்துரைகள்:
   - அறிகுறிகளின் அடிப்படையில் பொருத்தமான மருத்துவ நிபுணர்களை பரிந்துரைக்கவும்
   - ஏன் ஒரு குறிப்பிட்ட நிபுணர் தேவை என்பதை விளக்குங்கள்

3. மருந்து வழிகாட்டுதல்:
   - பொதுவான மருந்துகள் பற்றிய தகவல் வழங்குங்கள்
   - மருந்து பயன்பாடு மற்றும் முன்னெச்சரிக்கைகளை விளக்குங்கள்

4. அவசர நிலை கண்டறிதல்:
   - அபாயகரமான மருத்துவ நிலைமைகளை அடையாளம் காணுங்கள்
   - அவசர சேவைகளை தொடர்பு கொள்ளுமாறு உடனடியாக அறிவுறுத்துங்கள்

முக்கியம்: நீங்கள் தமிழில் பதிலளிக்க வேண்டும். எளிமையான, தெளிவான வடிவமைப்பைப் பயன்படுத்துங்கள். அதிகமான * அல்லது சிறப்பு குறியீடுகளைப் பயன்படுத்த வேண்டாம். எப்போதும் தகுதிவாய்ந்த மருத்துவர்களிடமிருந்து ஆலோசனை பெறுமாறு பரிந்துரைக்கவும்.`
  };
  
  return prompts[language] || prompts['en'];
};

// Chat validation
const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('conversationId')
    .optional({ nullable: true })
    .isString()
    .withMessage('Conversation ID must be a string')
];

// @route   POST /api/chatbot/chat
// @desc    Send message to AI chatbot
// @access  Private
router.post('/chat', authenticateToken, chatValidation, asyncHandler(async (req, res) => {
  // Log request details for debugging
  logger.info('Chatbot request received', {
    userId: req.user?.id,
    body: req.body,
    headers: req.headers['content-type']
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Chatbot validation failed', {
      errors: errors.array(),
      body: req.body
    });
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formatValidationErrors(errors.array())
      }
    });
  }

  const { message, conversationId } = req.body;
  const userId = req.user.id;

  try {
    // Get user info for personalized responses
    const user = await User.findById(userId);
    let patient = null;
    if (user.role === 'patient') {
      patient = await Patient.findOne({ user: userId });
    }

    // Detect language
    const detectedLanguage = detectLanguage(message);
    
    // Check for emergency keywords
    const isEmergency = emergencyKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Prepare context for AI
    let context = '';
    let isProvider = false;
    
    // Check if user is a provider
    if (user.role === 'provider') {
      isProvider = true;
      context = `Healthcare Provider Context: This is a clinical consultation from a healthcare provider.`;
    } else if (patient) {
      context = `Patient Info: Age ${patient.age || 'unknown'}, Gender: ${patient.gender || 'unknown'}`;
      if (patient.medicalHistory && patient.medicalHistory.length > 0) {
        context += `, Medical History: ${patient.medicalHistory.join(', ')}`;
      }
    }

    // Check if Gemini AI is initialized
    if (!genAI) {
      logger.error('Gemini AI not initialized');
      return res.status(500).json({
        success: false,
        error: {
          message: 'AI service unavailable',
          fallbackResponse: 'I apologize, but the AI medical assistant is currently unavailable. Please consult with a healthcare provider directly.'
        }
      });
    }

    // Generate AI response
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Use provider-specific prompts if user is a provider
    const systemPrompt = isProvider ? 
      (providerSystemPrompts[detectedLanguage] || providerSystemPrompts['en']) : 
      getSystemPrompt(detectedLanguage);
    
    const messageLabel = isProvider ? 'Provider Query' : 'Patient Message';
    const fullPrompt = `${systemPrompt}\n\n${context ? `Context: ${context}\n\n` : ''}${messageLabel}: ${message}`;

    const result = await model.generateContent(fullPrompt);
    let aiResponse = result.response.text();

    // Add emergency warning if needed
    if (isEmergency) {
      const emergencyWarnings = {
        'en': '🚨 EMERGENCY: If this is a medical emergency, please call emergency services immediately (911) or go to the nearest emergency room. Do not rely solely on this chatbot for emergency medical care.',
        'si': '🚨 හදිසි අවස්ථාව: මෙය වෛද්‍ය හදිසි අවස්ථාවක් නම්, කරුණාකර වහාම හදිසි සේවාවන්ට (119) ඇමතුම් කරන්න හෝ ළඟම ගැති කිරීමේ කාමරයට යන්න.',
        'ta': '🚨 அவசரநிலை: இது மருத்துவ அவசரநிலை என்றால், உடனடியாக அவசர சேவைகளை (108) அழைக்கவும் அல்லது அருகிலுள்ள அவசர அறைக்குச் செல்லவும்.'
      };
      
      aiResponse = `${emergencyWarnings[detectedLanguage] || emergencyWarnings['en']}\n\n${aiResponse}`;
    }

    // Extract specialist recommendations from AI response with better matching
    const specialistRecommendations = [];
    
    // Create keyword mapping for better specialist detection
    const specialistKeywords = {
      'cardiology': ['heart', 'cardiac', 'cardiovascular', 'chest pain', 'cardiology', 'cardiologist'],
      'dermatology': ['skin', 'rash', 'acne', 'dermatology', 'dermatologist'],
      'endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrinology', 'endocrinologist'],
      'gastroenterology': ['stomach', 'digestive', 'abdominal', 'gastro', 'gastroenterology', 'gastroenterologist', 'nausea', 'vomiting', 'diarrhea'],
      'neurology': ['brain', 'neurological', 'headache', 'migraine', 'neurology', 'neurologist'],
      'orthopedics': ['bone', 'joint', 'muscle', 'orthopedic', 'orthopedics', 'orthopedist'],
      'psychiatry': ['mental', 'depression', 'anxiety', 'psychiatry', 'psychiatrist'],
      'pulmonology': ['lung', 'respiratory', 'breathing', 'cough', 'pulmonology', 'pulmonologist'],
      'urology': ['urinary', 'kidney', 'bladder', 'urology', 'urologist'],
      'gynecology': ['gynecological', 'women', 'gynecology', 'gynecologist'],
      'pediatrics': ['child', 'children', 'pediatric', 'pediatrics', 'pediatrician'],
      'ophthalmology': ['eye', 'vision', 'sight', 'ophthalmology', 'ophthalmologist'],
      'ENT': ['ear', 'nose', 'throat', 'ENT', 'otolaryngology'],
      'oncology': ['cancer', 'tumor', 'oncology', 'oncologist']
    };
    
    Object.keys(specialistKeywords).forEach(specialty => {
      const keywords = specialistKeywords[specialty];
      const messageAndResponse = (message + ' ' + aiResponse).toLowerCase();
      
      const hasMatch = keywords.some(keyword => 
        messageAndResponse.includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        specialistRecommendations.push({
          specialty,
          description: specialists[specialty]
        });
      }
    });

    // Log conversation for analytics
    logger.info('Chatbot conversation', {
      userId,
      language: detectedLanguage,
      messageLength: message.length,
      isEmergency,
      hasSpecialistRecommendation: specialistRecommendations.length > 0
    });

    res.json({
      success: true,
      data: {
        response: aiResponse,
        detectedLanguage,
        isEmergency,
        specialistRecommendations,
        conversationId: conversationId || `chat_${Date.now()}_${userId}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Chatbot error:', error);
    
    // Fallback response in detected language
    const fallbackResponses = {
      'en': 'I apologize, but I\'m experiencing technical difficulties. Please try again later or consult with a healthcare provider directly.',
      'si': 'මට කණගාටුයි, මට තාක්ෂණික අපහසුතා ඇති වේ. කරුණාකර පසුව නැවත උත්සාහ කරන්න හෝ වෛද්‍යවරයෙකුගෙන් සෘජුවම උපදෙස් ලබාගන්න.',
      'ta': 'மன்னிக்கவும், எனக்கு தொழில்நுட்ப சிக்கல்கள் உள்ளன. பின்னர் மீண்டும் முயற்சிக்கவும் அல்லது நேரடியாக மருத்துவரை அணுகவும்.'
    };

    const detectedLanguage = detectLanguage(req.body.message);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Chatbot service temporarily unavailable',
        fallbackResponse: fallbackResponses[detectedLanguage] || fallbackResponses['en']
      }
    });
  }
}));

// @route   GET /api/chatbot/test
// @desc    Test chatbot route (no auth required for debugging)
// @access  Public
router.get('/test', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot route is working',
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/chatbot/specialists
// @desc    Get list of available specialists
// @access  Private
router.get('/specialists', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: specialists
  });
}));

// @route   GET /api/chatbot/languages
// @desc    Get supported languages
// @access  Private
router.get('/languages', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      'en': 'English',
      'si': 'සිංහල',
      'ta': 'தமிழ்'
    }
  });
}));

module.exports = router;