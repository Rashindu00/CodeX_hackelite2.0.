import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  HeartIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [healthMetrics] = useState({
    bloodPressure: '120/80',
    heartRate: '72',
    weight: '70',
    lastCheckup: '2025-08-15'
  });

  // Emergency handler function
  const handleEmergency = () => {
    const emergencyNumbers = [
      '911 - Emergency Services',
      '1-800-273-8255 - Crisis Hotline',
      'Hospital Emergency: (555) 123-4567'
    ];
    
    const message = `EMERGENCY CONTACTS:\n\n${emergencyNumbers.join('\n')}\n\nIf this is a life-threatening emergency, call 911 immediately!`;
    
    if (window.confirm(message + '\n\nWould you like to call 911 now?')) {
      window.open('tel:911');
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call for appointments
    setUpcomingAppointments([
      {
        id: 1,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        date: '2025-09-15',
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'confirmed'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Chen',
        specialty: 'General Practitioner',
        date: '2025-09-20',
        time: '2:30 PM',
        type: 'Consultation',
        status: 'pending'
      }
    ]);
  }, []);

  const quickActions = [
    {
      name: 'Book Appointment',
      icon: CalendarDaysIcon,
      color: 'bg-blue-500',
      href: '/patient/appointment-booking'
    },
    {
      name: 'Video Consultation',
      icon: VideoCameraIcon,
      color: 'bg-teal-500',
      href: '/patient/video-consultation'
    },
    {
      name: 'Health Records',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      href: '/patient/health-records'
    },
    {
      name: 'Symptom Checker',
      icon: HeartIcon,
      color: 'bg-red-500',
      href: '/patient/symptom-checker'
    },
    {
      name: 'Medical History',
      icon: ClockIcon,
      color: 'bg-purple-500',
      href: '/patient/history'
    }
  ];

  const healthStats = [
    {
      name: 'Blood Pressure',
      value: healthMetrics.bloodPressure,
      unit: 'mmHg',
      status: 'normal',
      color: 'text-green-600'
    },
    {
      name: 'Heart Rate',
      value: healthMetrics.heartRate,
      unit: 'bpm',
      status: 'normal',
      color: 'text-green-600'
    },
    {
      name: 'Weight',
      value: healthMetrics.weight,
      unit: 'kg',
      status: 'stable',
      color: 'text-blue-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Patient Dashboard - MediConnect AI</title>
        <meta name="description" content="Your personal healthcare dashboard with appointments, health records, and more." />
      </Helmet>

      <DashboardLayout>
        {/* Header - hidden on mobile since we have mobile header in layout */}
        <div className="hidden md:block bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.firstName || 'Patient'}!
                  </h1>
                  <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                    Here's your health summary for today
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleEmergency()}
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Emergency
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header content */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Patient'}!
            </h1>
            <p className="mt-1 text-gray-600 text-sm">
              Here's your health summary for today
            </p>
          </div>
          <div className="mt-3 flex justify-center">
            <button 
              onClick={() => handleEmergency()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Emergency
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.href)}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center hover:border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <div className={`${action.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{action.name}</h3>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Health Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-teal-600" />
                    Health Metrics
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {healthStats.map((stat) => (
                      <div key={stat.name} className="text-center">
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                          <p className={`text-xl sm:text-2xl font-bold ${stat.color} mt-1`}>
                            {stat.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {stat.unit}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{stat.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <button 
                      onClick={() => navigate('/patient/health-records')}
                      className="w-full bg-teal-50 text-teal-700 py-2 px-4 rounded-lg hover:bg-teal-100 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      Update Health Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-500 rounded-full p-2 mr-3">
                        <DocumentTextIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Lab results uploaded</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-500 rounded-full p-2 mr-3">
                        <CalendarDaysIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Appointment confirmed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-500 rounded-full p-2 mr-3">
                        <HeartIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Health metrics updated</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-teal-600" />
                    Upcoming Appointments
                  </h2>
                </div>
                <div className="p-6">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{appointment.doctor}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{appointment.specialty}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {appointment.date} at {appointment.time}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{appointment.type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                  )}
                  <button 
                    onClick={() => navigate('/patient/appointment-booking')}
                    className="w-full mt-4 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Book New Appointment
                  </button>
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Health Tips</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <h3 className="font-medium text-blue-900">Stay Hydrated</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Drink at least 8 glasses of water daily for optimal health.
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                      <h3 className="font-medium text-green-900">Regular Exercise</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Aim for 30 minutes of moderate exercise 5 times a week.
                      </p>
                    </div>
                  </div>
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

  export default PatientDashboard;
