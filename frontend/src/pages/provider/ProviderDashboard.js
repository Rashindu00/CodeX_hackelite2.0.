import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats] = useState({
    totalPatients: 145,
    todayAppointments: 8,
    pendingConsultations: 3,
    completedToday: 5
  });

  // Mock data for demonstration
  useEffect(() => {
    setTodayAppointments([
      {
        id: 1,
        patient: 'John Smith',
        time: '09:00 AM',
        type: 'Follow-up',
        status: 'confirmed',
        condition: 'Hypertension',
        isUrgent: false
      },
      {
        id: 2,
        patient: 'Maria Garcia',
        time: '10:30 AM',
        type: 'Consultation',
        status: 'in-progress',
        condition: 'Diabetes Management',
        isUrgent: false
      },
      {
        id: 3,
        patient: 'David Wilson',
        time: '11:00 AM',
        type: 'Emergency',
        status: 'urgent',
        condition: 'Chest Pain',
        isUrgent: true
      },
      {
        id: 4,
        patient: 'Sarah Johnson',
        time: '02:00 PM',
        type: 'Check-up',
        status: 'confirmed',
        condition: 'Routine Physical',
        isUrgent: false
      }
    ]);
  }, []);

  const quickActions = [
    {
      name: 'Start Video Call',
      icon: VideoCameraIcon,
      color: 'bg-blue-500',
      count: stats.pendingConsultations
    },
    {
      name: 'View Patient Records',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      count: null
    },
    {
      name: 'Emergency Alerts',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      count: 2
    },
    {
      name: 'Messages',
      icon: BellIcon,
      color: 'bg-purple-500',
      count: 7
    }
  ];

  const dashboardStats = [
    {
      name: 'Total Patients',
      value: stats.totalPatients,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: CalendarDaysIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending Consultations',
      value: stats.pendingConsultations,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Completed Today',
      value: stats.completedToday,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Provider Dashboard - MediConnect AI</title>
        <meta name="description" content="Healthcare provider dashboard for managing patients and appointments." />
      </Helmet>

      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Good morning, Dr. {user?.lastName || 'Provider'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                      You have {stats.todayAppointments} appointments today
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      Emergency
                  </button>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center">
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Start Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} rounded-lg p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <button
                key={action.name}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center relative"
              >
                {action.count && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.count}
                  </span>
                )}
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">{action.name}</h3>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-teal-600" />
                    Today's Appointments
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`border rounded-lg p-4 ${
                          appointment.isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                              <UserGroupIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                              <p className="text-sm text-gray-600">{appointment.condition}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{appointment.type}</span>
                          <div className="flex space-x-2">
                            <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                              Video Call
                            </button>
                            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
                              View Records
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-500 rounded-full p-2 mr-3">
                        <UserGroupIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Consultation completed</p>
                        <p className="text-xs text-gray-500">Patient: John Smith</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-500 rounded-full p-2 mr-3">
                        <DocumentTextIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Lab results reviewed</p>
                        <p className="text-xs text-gray-500">Patient: Maria Garcia</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-500 rounded-full p-2 mr-3">
                        <BellIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New message received</p>
                        <p className="text-xs text-gray-500">Patient: Sarah Johnson</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Alerts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
                    Patient Alerts
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <h3 className="font-medium text-red-900">Critical Alert</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Patient David Wilson reported severe chest pain
                      </p>
                      <button className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Review Immediately
                      </button>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <h3 className="font-medium text-yellow-900">Medication Alert</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Patient Emma Thompson missed medication dose
                      </p>
                      <button className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                        Contact Patient
                      </button>
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

  export default ProviderDashboard;
