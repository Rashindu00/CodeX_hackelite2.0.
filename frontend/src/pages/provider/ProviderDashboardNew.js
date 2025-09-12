import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TrendingUpIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for appointments
  const todayAppointments = [
    {
      id: 1,
      patientName: 'John Smith',
      time: '9:00 AM',
      type: 'Follow-up',
      status: 'confirmed',
      isUrgent: false,
      specialty: 'Cardiology'
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'New Patient',
      status: 'pending',
      isUrgent: true,
      specialty: 'Cardiology'
    },
    {
      id: 3,
      patientName: 'Michael Brown',
      time: '2:00 PM',
      type: 'Consultation',
      status: 'confirmed',
      isUrgent: false,
      specialty: 'General Medicine'
    },
    {
      id: 4,
      patientName: 'Emily Davis',
      time: '3:30 PM',
      type: 'Video Call',
      status: 'confirmed',
      isUrgent: false,
      specialty: 'Mental Health'
    }
  ];

  const recentPatients = [
    { id: 1, name: 'John Smith', lastVisit: '2 days ago', condition: 'Hypertension', riskLevel: 'moderate' },
    { id: 2, name: 'Maria Garcia', lastVisit: '1 week ago', condition: 'Diabetes', riskLevel: 'high' },
    { id: 3, name: 'David Wilson', lastVisit: '3 days ago', condition: 'Annual Checkup', riskLevel: 'low' },
    { id: 4, name: 'Sarah Johnson', lastVisit: '1 day ago', condition: 'Cardiac Monitoring', riskLevel: 'high' }
  ];

  const notifications = [
    { id: 1, type: 'urgent', message: 'Lab results ready for Maria Garcia', time: '5 min ago' },
    { id: 2, type: 'info', message: 'New appointment request from David Wilson', time: '15 min ago' },
    { id: 3, type: 'reminder', message: 'Follow-up call scheduled with John Smith', time: '1 hour ago' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Provider Dashboard - MediConnect AI</title>
        <meta name="description" content="Healthcare provider dashboard for managing patients and appointments" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header with Time and Quick Actions */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, Dr. {user?.name || 'Provider'}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} • {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button 
                    onClick={() => navigate('/provider/appointments')}
                    className="bg-white text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    View Schedule
                  </button>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
                      <p className="text-2xl font-bold text-gray-900">247</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <TrendingUpIcon className="h-4 w-4 mr-1" />
                      +12%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-teal-600 text-sm font-medium">
                      {todayAppointments.filter(apt => apt.status === 'confirmed').length} confirmed
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 text-sm">
                      124 reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-teal-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Today</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 text-sm font-medium">
                      On schedule
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Today's Appointments - Takes 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-teal-600" />
                      Today's Appointments
                    </h2>
                    <button 
                      onClick={() => navigate('/provider/appointments')}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment.id} className={`flex items-center justify-between p-4 rounded-lg border ${appointment.isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                            {appointment.type === 'Video Call' ? (
                              <VideoCameraIcon className="h-5 w-5 text-teal-600" />
                            ) : (
                              <UserGroupIcon className="h-5 w-5 text-teal-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900 flex items-center">
                              {appointment.patientName}
                              {appointment.isUrgent && (
                                <span className="ml-2 text-red-500 text-xs font-bold">URGENT</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.specialty} • {appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {todayAppointments.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications - Takes 1/3 width */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-teal-600" />
                    Notifications
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-teal-600" />
                      Recent Patients
                    </h2>
                    <button 
                      onClick={() => navigate('/provider/patients')}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-600">{patient.condition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                          <span className={`text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel} risk
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-teal-600" />
                    This Week's Overview
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consultations</span>
                      <span className="text-lg font-semibold text-gray-900">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Video Calls</span>
                      <span className="text-lg font-semibold text-gray-900">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New Patients</span>
                      <span className="text-lg font-semibold text-gray-900">6</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Follow-ups</span>
                      <span className="text-lg font-semibold text-gray-900">18</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => navigate('/provider/patients')}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <UserGroupIcon className="h-6 w-6 text-teal-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">My Patients</p>
                    </button>
                    <button 
                      onClick={() => navigate('/provider/appointments')}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <CalendarDaysIcon className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Appointments</p>
                    </button>
                    <button 
                      onClick={() => navigate('/provider/consultations')}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <VideoCameraIcon className="h-6 w-6 text-green-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Consultations</p>
                    </button>
                    <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ChartBarIcon className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Analytics</p>
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

export default ProviderDashboard;
