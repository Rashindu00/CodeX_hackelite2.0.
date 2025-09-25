import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { 
  CalendarIcon, 
  VideoCameraIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const PatientHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({
    appointments: [],
    consultations: [],
    recommendations: []
  });
  const [error, setError] = useState('');

  const tabs = [
    { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
    { id: 'consultations', name: 'Video Consultations', icon: VideoCameraIcon },
    { id: 'recommendations', name: 'Recommendations', icon: ClipboardDocumentListIcon }
  ];

  useEffect(() => {
    fetchPatientHistory();
  }, []);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setError('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'cancelled':
        return XCircleIcon;
      case 'confirmed':
        return ClockIcon;
      case 'pending':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAppointments = () => {
    if (history.appointments.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't had any appointments yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.appointments.map((appointment) => {
          const StatusIcon = getStatusIcon(appointment.status);
          return (
            <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {appointment.provider?.name || 'Unknown Provider'}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(appointment.appointmentDate)}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {appointment.appointmentTime}
                    </div>
                  </div>

                  {appointment.type && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {appointment.type}
                    </p>
                  )}

                  {appointment.notes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900">Notes:</p>
                      <p className="mt-1 text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConsultations = () => {
    if (history.consultations.length === 0) {
      return (
        <div className="text-center py-12">
          <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No video consultations</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't had any video consultations yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.consultations.map((consultation) => {
          const StatusIcon = getStatusIcon(consultation.status);
          return (
            <div key={consultation._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <VideoCameraIcon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {consultation.provider?.name || 'Unknown Provider'}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(consultation.startedAt)}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTime(consultation.startedAt)}
                    </div>
                    {consultation.endedAt && (
                      <div className="flex items-center">
                        <span className="font-medium">Duration:</span> {Math.round((new Date(consultation.endedAt) - new Date(consultation.startedAt)) / (1000 * 60))} minutes
                      </div>
                    )}
                  </div>

                  {consultation.topic && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Topic:</span> {consultation.topic}
                    </p>
                  )}

                  {consultation.summary && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900">Consultation Summary:</p>
                      <p className="mt-1 text-sm text-gray-600">{consultation.summary}</p>
                    </div>
                  )}

                  {consultation.recording && (
                    <div className="mt-3">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <VideoCameraIcon className="h-4 w-4 mr-1" />
                        View Recording
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (history.recommendations.length === 0) {
      return (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any doctor recommendations yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.recommendations.map((recommendation) => (
          <div key={recommendation._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <DocumentTextIcon className="h-6 w-6 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{recommendation.title}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(recommendation.createdAt)}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">From:</span> Dr. {recommendation.provider?.name || 'Unknown Provider'}
                </p>

                {recommendation.category && (
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {recommendation.category}
                  </p>
                )}

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900">Recommendation:</p>
                  <p className="mt-1 text-sm text-gray-600">{recommendation.description}</p>
                </div>

                {recommendation.medications && recommendation.medications.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">Prescribed Medications:</p>
                    <ul className="mt-1 text-sm text-gray-600 list-disc list-inside space-y-1">
                      {recommendation.medications.map((med, index) => (
                        <li key={index}>
                          {med.name} - {med.dosage} ({med.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.followUp && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Follow-up Required:</p>
                    <p className="mt-1 text-sm text-yellow-700">{recommendation.followUp}</p>
                  </div>
                )}

                {recommendation.priority && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recommendation.priority === 'high' ? 'text-red-600 bg-red-100' :
                      recommendation.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                      'text-green-600 bg-green-100'
                    }`}>
                      Priority: {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointments();
      case 'consultations':
        return renderConsultations();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderAppointments();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
          <p className="mt-2 text-gray-600">
            View your past appointments, consultations, and doctor recommendations
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientHistory;