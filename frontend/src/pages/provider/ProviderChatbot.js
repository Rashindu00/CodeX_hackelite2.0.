import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

const ProviderChatbot = () => {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [conversationId, setConversationId] = useState(null);
  const [specialists, setSpecialists] = useState({});
  const [languages, setLanguages] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSupportData();
    initializeChat();
  }, []);

  const fetchSupportData = async () => {
    try {
      const [specialistsRes, languagesRes] = await Promise.all([
        api.get('/chatbot/specialists'),
        api.get('/chatbot/languages')
      ]);
      
      setSpecialists(specialistsRes.data.data);
      setLanguages(languagesRes.data.data);
    } catch (error) {
      console.error('Error fetching support data:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessages = {
      'en': {
        text: "Hello Dr. " + (user?.firstName || 'Doctor') + "! I'm MediConnect AI, your medical assistant. I can help you with:\n\n• Patient case consultation and analysis\n• Differential diagnosis suggestions\n• Treatment protocol recommendations\n• Drug interaction checks\n• Medical literature references\n• Clinical decision support\n• Patient education materials\n\nHow can I assist you with your medical practice today?",
        isBot: true,
        timestamp: new Date().toISOString()
      },
      'si': {
        text: "ආයුබෝවන් " + (user?.firstName || 'වෛද්‍යතුමා') + "! මම MediConnect AI, ඔබේ වෛද්‍ය සහායකයා. මට ඔබට උදව් කළ හැකිය:\n\n• රෝගී සිද්ධි උපදේශනය සහ විශ්ලේෂණය\n• විකල්ප රෝග විනිශ්චය යෝජනා\n• ප්‍රතිකාර ක්‍රමවේද නිර්දේශ\n• ඖෂධ අන්තර්ක්‍රියා පරීක්ෂාව\n• වෛද්‍ය සාහිත්‍ය යොමු කිරීම්\n• සායනික තීරණ සහාය\n• රෝගී අධ්‍යාපන ද්‍රව්‍ය\n\nඅද ඔබේ වෛද්‍ය ප්‍රායෝගික කටයුතු සඳහා මට ඔබට කෙසේ සහාය විය හැකිද?",
        isBot: true,
        timestamp: new Date().toISOString()
      },
      'ta': {
        text: "வணக்கம் டாக்டர் " + (user?.firstName || 'அவர்களே') + "! நான் MediConnect AI, உங்கள் மருத்துவ உதவியாளர். நான் உங்களுக்கு உதவ முடியும்:\n\n• நோயாளி வழக்கு ஆலோசனை மற்றும் பகுப்பாய்வு\n• வேறுபாடு நோய் கண்டறிதல் பரிந்துரைகள்\n• சிகிச்சை நெறிமுறை பரிந்துரைகள்\n• மருந்து தொடர்பு சோதனைகள்\n• மருத்துவ இலக்கியம் குறிப்புகள்\n• மருத்துவ முடிவு ஆதரவு\n• நோயாளி கல்வி பொருட்கள்\n\nஇன்று உங்கள் மருத்துவ நடைமுறையில் நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        isBot: true,
        timestamp: new Date().toISOString()
      }
    };

    setMessages([welcomeMessages[selectedLanguage] || welcomeMessages['en']]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      text: newMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/chat', {
        message: newMessage,
        conversationId
      });

      const { data } = response.data;
      
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage = {
        text: data.response,
        isBot: true,
        timestamp: data.timestamp,
        isEmergency: data.isEmergency,
        detectedLanguage: data.detectedLanguage,
        specialistRecommendations: data.specialistRecommendations
      };

      setMessages(prev => [...prev, botMessage]);

      // Update selected language if different from detected
      if (data.detectedLanguage !== selectedLanguage) {
        setSelectedLanguage(data.detectedLanguage);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        text: error.response?.data?.error?.fallbackResponse || 
              "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        isBot: true,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    initializeChat();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                <HeartSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediConnect AI - Provider</h1>
                <p className="text-sm text-gray-600">Clinical Decision Support System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <LanguageIcon className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              
              {/* Clear Chat Button */}
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-4xl ${
                  message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    message.isBot
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                >
                  {message.isBot ? (
                    <HeartIcon className="w-5 h-5 text-white" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.isBot
                      ? message.isError
                        ? 'bg-red-100 border border-red-200'
                        : message.isEmergency
                        ? 'bg-red-50 border-2 border-red-300'
                        : 'bg-white border border-gray-200'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}
                >
                  {/* Emergency Warning */}
                  {message.isEmergency && (
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Critical Case Alert</span>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className={`text-sm ${message.isBot && !message.isError ? 'text-gray-800' : ''}`}>
                    {formatMessageText(message.text)}
                  </p>

                  {/* Specialist Recommendations */}
                  {message.specialistRecommendations && message.specialistRecommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        Specialist Consultation Recommended:
                      </h4>
                      <div className="space-y-1">
                        {message.specialistRecommendations.map((specialist, idx) => (
                          <div key={idx} className="text-xs text-blue-700">
                            <span className="font-medium">{specialist.specialty}</span>: {specialist.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${
                    message.isBot ? 'text-gray-500' : 'text-blue-200'
                  }`}>
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    {formatTimestamp(message.timestamp)}
                    {message.detectedLanguage && message.detectedLanguage !== 'en' && (
                      <span className="ml-2">({languages[message.detectedLanguage]})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedLanguage === 'si' ? "ඔබේ වෛද්‍ය ප්‍රශ්නය හෝ රෝගී සිද්ධිය ගැන අහන්න..." :
                  selectedLanguage === 'ta' ? "உங்கள் மருத்துவ கேள்வி அல்லது நோயாளி வழக்கைப் பற்றி கேளுங்கள்..." :
                  "Ask about clinical cases, diagnosis, treatment protocols..."
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions for Providers */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setNewMessage("Patient presents with chest pain and shortness of breath")}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
            >
              <HeartIcon className="w-3 h-3 inline mr-1" />
              Chest Pain Case
            </button>
            <button
              onClick={() => setNewMessage("Drug interaction check for metformin and warfarin")}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200"
            >
              <DocumentTextIcon className="w-3 h-3 inline mr-1" />
              Drug Interactions
            </button>
            <button
              onClick={() => setNewMessage("Differential diagnosis for fever and abdominal pain")}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200"
            >
              <UserGroupIcon className="w-3 h-3 inline mr-1" />
              Differential Dx
            </button>
            <button
              onClick={() => setNewMessage("Treatment protocol for hypertension in elderly patients")}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors duration-200"
            >
              <CalendarDaysIcon className="w-3 h-3 inline mr-1" />
              Treatment Protocol
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderChatbot;