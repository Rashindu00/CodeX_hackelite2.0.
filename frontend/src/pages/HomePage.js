import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated && user?.role) {
      const getDashboardRoute = (role) => {
        switch (role) {
          case 'patient':
            return '/patient';
          case 'provider':
            return '/provider';
          case 'admin':
            return '/admin';
          default:
            return '/';
        }
      };
      navigate(getDashboardRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  return (
    <>
      <Helmet>
        <title>MediConnect AI - Bridging Healthcare Gaps Through Technology</title>
        <meta name="description" content="AI-powered telemedicine platform for rural healthcare accessibility. Connect with healthcare providers, manage health records, and access medical care from anywhere." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-primary-600">MediConnect AI</span>
                <br />
                Healthcare for Everyone
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Bridging healthcare gaps through technology. Access quality medical care from anywhere with our AI-powered telemedicine platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn-primary btn-lg px-8 py-4 text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary btn-lg px-8 py-4 text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Healthcare Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need for modern healthcare delivery
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="health-card text-center">
                  <div className="text-primary-600 text-4xl mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of patients and healthcare providers using MediConnect AI
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Your Journey Today
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

const features = [
  {
    icon: '🩺',
    title: 'Video Consultations',
    description: 'Connect with healthcare providers through secure video calls from anywhere.'
  },
  {
    icon: '📋',
    title: 'Health Records',
    description: 'Securely store and manage your medical history and health data.'
  },
  {
    icon: '🤖',
    title: 'AI Symptom Checker',
    description: 'Get preliminary health assessments with our intelligent symptom analyzer.'
  },
  {
    icon: '📅',
    title: 'Easy Scheduling',
    description: 'Book appointments with healthcare providers that fit your schedule.'
  },
  {
    icon: '💊',
    title: 'Prescription Management',
    description: 'Track medications and receive reminders for doses and refills.'
  },
  {
    icon: '🌐',
    title: 'Multi-Language Support',
    description: 'Available in English, Sinhala, and Tamil for better accessibility.'
  }
];

export default HomePage;
