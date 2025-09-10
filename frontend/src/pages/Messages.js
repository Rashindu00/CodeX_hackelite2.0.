import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/layout/DashboardLayout';

const Messages = () => {
  const mockMessages = [
    {
      id: 1,
      sender: 'Dr. Sarah Johnson',
      message: 'Your test results are ready. Please schedule a follow-up appointment.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      sender: 'MediConnect Support',
      message: 'Welcome to MediConnect! Feel free to reach out if you have any questions.',
      time: '1 day ago',
      unread: false
    },
    {
      id: 3,
      sender: 'Dr. Michael Chen',
      message: 'Don\'t forget to take your medication as prescribed.',
      time: '2 days ago',
      unread: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Messages - MediConnect AI</title>
        <meta name="description" content="View and manage your healthcare messages" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-teal-600" />
                Messages
              </h1>
              <p className="mt-2 text-gray-600">
                Communicate with your healthcare providers
              </p>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mockMessages.map((message) => (
                  <div key={message.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${message.unread ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.sender}
                          </p>
                          <p className="text-sm text-gray-500">{message.time}</p>
                        </div>
                        <p className={`mt-1 text-sm ${message.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {message.message}
                        </p>
                        {message.unread && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose Message */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                      To
                    </label>
                    <select
                      id="recipient"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option>Select a healthcare provider</option>
                      <option>Dr. Sarah Johnson</option>
                      <option>Dr. Michael Chen</option>
                      <option>MediConnect Support</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows="4"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Messages;
