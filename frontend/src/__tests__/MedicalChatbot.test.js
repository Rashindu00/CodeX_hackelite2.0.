import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MedicalChatbot from '../pages/patient/MedicalChatbot';
import authSlice from '../store/slices/authSlice';

// Mock API
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockStore = configureStore({
  reducer: {
    auth: authSlice,
  },
  preloadedState: {
    auth: {
      isAuthenticated: true,
      user: {
        id: '1',
        role: 'patient',
        name: 'Test Patient',
        email: 'test@example.com'
      },
      token: 'mock-token'
    }
  }
});

const renderWithProviders = (component) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('MedicalChatbot', () => {
  const mockApi = require('../services/api');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    mockApi.get.mockImplementation((url) => {
      if (url === '/chatbot/specialists') {
        return Promise.resolve({
          data: {
            data: {
              'cardiology': 'Cardiologist - Heart and cardiovascular diseases',
              'dermatology': 'Dermatologist - Skin, hair, and nail conditions'
            }
          }
        });
      }
      if (url === '/chatbot/languages') {
        return Promise.resolve({
          data: {
            data: {
              'en': 'English',
              'si': 'සිංහල',
              'ta': 'தமிழ்'
            }
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    mockApi.post.mockImplementation((url, data) => {
      if (url === '/chatbot/chat') {
        return Promise.resolve({
          data: {
            data: {
              response: 'Based on your symptoms of headache and fever, I recommend staying hydrated and getting rest. If symptoms persist or worsen, please consult a healthcare provider.',
              detectedLanguage: 'en',
              isEmergency: false,
              specialistRecommendations: [],
              conversationId: 'chat_test_123',
              timestamp: new Date().toISOString()
            }
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('renders chatbot interface correctly', async () => {
    renderWithProviders(<MedicalChatbot />);

    // Check if main elements are present
    expect(screen.getByText('MediConnect AI')).toBeInTheDocument();
    expect(screen.getByText('Your Personal Medical Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about your symptoms/)).toBeInTheDocument();
    
    // Wait for welcome message to load
    await waitFor(() => {
      expect(screen.getByText(/Hello! I'm MediConnect AI/)).toBeInTheDocument();
    });
  });

  test('sends message and receives response', async () => {
    renderWithProviders(<MedicalChatbot />);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type a message
    fireEvent.change(messageInput, { target: { value: 'I have a headache and fever' } });
    expect(messageInput.value).toBe('I have a headache and fever');

    // Send the message
    fireEvent.click(sendButton);

    // Wait for the API call and response
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/chatbot/chat', {
        message: 'I have a headache and fever',
        conversationId: null
      });
    });

    // Check if response appears
    await waitFor(() => {
      expect(screen.getByText(/Based on your symptoms of headache and fever/)).toBeInTheDocument();
    });
  });

  test('handles emergency detection', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        data: {
          response: '🚨 EMERGENCY: If this is a medical emergency, please call emergency services immediately (911).',
          detectedLanguage: 'en',
          isEmergency: true,
          specialistRecommendations: [],
          conversationId: 'chat_test_123',
          timestamp: new Date().toISOString()
        }
      }
    });

    renderWithProviders(<MedicalChatbot />);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'I am having chest pain' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Emergency Alert')).toBeInTheDocument();
    });
  });

  test('handles specialist recommendations', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        data: {
          response: 'Based on your heart symptoms, I recommend consulting a cardiologist.',
          detectedLanguage: 'en',
          isEmergency: false,
          specialistRecommendations: [
            {
              specialty: 'cardiology',
              description: 'Cardiologist - Heart and cardiovascular diseases'
            }
          ],
          conversationId: 'chat_test_123',
          timestamp: new Date().toISOString()
        }
      }
    });

    renderWithProviders(<MedicalChatbot />);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'I have heart palpitations' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Recommended Specialists:')).toBeInTheDocument();
      expect(screen.getByText(/Cardiologist - Heart and cardiovascular diseases/)).toBeInTheDocument();
    });
  });

  test('language selector works correctly', async () => {
    renderWithProviders(<MedicalChatbot />);

    const languageSelector = screen.getByDisplayValue('English');
    
    // Change language to Sinhala
    fireEvent.change(languageSelector, { target: { value: 'si' } });
    
    expect(languageSelector.value).toBe('si');
    
    // Check if placeholder text changes
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ඔබේ රෝග ලක්ෂණ/)).toBeInTheDocument();
    });
  });

  test('clear chat functionality works', async () => {
    renderWithProviders(<MedicalChatbot />);

    // Wait for initial welcome message
    await waitFor(() => {
      expect(screen.getByText(/Hello! I'm MediConnect AI/)).toBeInTheDocument();
    });

    // Send a message first
    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Clear chat
    const clearButton = screen.getByText('Clear Chat');
    fireEvent.click(clearButton);

    // Should only have welcome message
    await waitFor(() => {
      const messages = screen.queryAllByText(/Test message/);
      expect(messages).toHaveLength(0);
    });
  });

  test('quick action buttons work', async () => {
    renderWithProviders(<MedicalChatbot />);

    const quickActionButton = screen.getByText('Headache & Fever');
    fireEvent.click(quickActionButton);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    expect(messageInput.value).toBe('I have a headache and fever');
  });

  test('handles API errors gracefully', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: {
        data: {
          error: {
            fallbackResponse: 'I apologize, but I\'m experiencing technical difficulties.'
          }
        }
      }
    });

    renderWithProviders(<MedicalChatbot />);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I apologize, but I'm experiencing technical difficulties/)).toBeInTheDocument();
    });
  });

  test('prevents sending empty messages', () => {
    renderWithProviders(<MedicalChatbot />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Button should be disabled when input is empty
    expect(sendButton).toBeDisabled();

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    fireEvent.change(messageInput, { target: { value: '   ' } }); // Only whitespace

    expect(sendButton).toBeDisabled();
  });

  test('keyboard shortcuts work', async () => {
    renderWithProviders(<MedicalChatbot />);

    const messageInput = screen.getByPlaceholderText(/Ask about your symptoms/);
    
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/chatbot/chat', {
        message: 'Test message',
        conversationId: null
      });
    });
  });
});