import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import {
  VideoCameraIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const ProviderConsultations = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const consultationsPerPage = 10;

  // Mock consultations data
  useEffect(() => {
    setConsultations([
      {
        id: 1,
        patientName: 'John Smith',
        patientId: 'P001',
        date: '2024-01-24',
        time: '09:00 AM',
        duration: '30 minutes',
        type: 'Video Call',
        status: 'completed',
        specialty: 'Cardiology',
        reason: 'Hypertension follow-up',
        diagnosis: 'Controlled hypertension',
        prescription: 'Continue current medication',
        notes: 'Patient is responding well to treatment. Blood pressure within normal range. Continue current medication regimen.',
        followUp: '2024-02-24',
        rating: 5,
        patientAge: 45,
        visitNumber: 3
      },
      {
        id: 2,
        patientName: 'Maria Garcia',
        patientId: 'P002',
        date: '2024-01-23',
        time: '10:30 AM',
        duration: '45 minutes',
        type: 'In-Person',
        status: 'completed',
        specialty: 'Endocrinology',
        reason: 'Diabetes management',
        diagnosis: 'Type 2 Diabetes Mellitus',
        prescription: 'Adjusted insulin dosage',
        notes: 'Blood sugar levels improved. Adjusted insulin from 20 units to 18 units twice daily. Patient education on carb counting provided.',
        followUp: '2024-02-15',
        rating: 5,
        patientAge: 32,
        visitNumber: 8
      },
      {
        id: 3,
        patientName: 'David Wilson',
        patientId: 'P003',
        date: '2024-01-22',
        time: '02:00 PM',
        duration: '30 minutes',
        type: 'Phone Call',
        status: 'completed',
        specialty: 'General Medicine',
        reason: 'Lab results review',
        diagnosis: 'Normal lab values',
        prescription: 'No changes needed',
        notes: 'All lab results within normal limits. Continue current lifestyle modifications. Schedule routine follow-up in 6 months.',
        followUp: '2024-07-22',
        rating: 4,
        patientAge: 28,
        visitNumber: 1
      },
      {
        id: 4,
        patientName: 'Sarah Johnson',
        patientId: 'P004',
        date: '2024-01-21',
        time: '11:00 AM',
        duration: '60 minutes',
        type: 'In-Person',
        status: 'completed',
        specialty: 'Cardiology',
        reason: 'Cardiac stress test review',
        diagnosis: 'Mild coronary artery disease',
        prescription: 'Started on statin therapy',
        notes: 'Stress test shows mild CAD. Started atorvastatin 20mg daily. Lifestyle counseling provided. Patient scheduled for echocardiogram.',
        followUp: '2024-02-21',
        rating: 5,
        patientAge: 38,
        visitNumber: 2
      },
      {
        id: 5,
        patientName: 'Michael Brown',
        patientId: 'P005',
        date: '2024-01-20',
        time: '03:30 PM',
        duration: '30 minutes',
        type: 'Video Call',
        status: 'completed',
        specialty: 'General Medicine',
        reason: 'Cholesterol management',
        diagnosis: 'Hyperlipidemia',
        prescription: 'Continue statin, add fish oil',
        notes: 'Cholesterol levels improved but not at target. Continue current statin, added omega-3 supplement. Dietary counseling reinforced.',
        followUp: '2024-04-20',
        rating: 4,
        patientAge: 52,
        visitNumber: 4
      },
      {
        id: 6,
        patientName: 'Emily Davis',
        patientId: 'P006',
        date: '2024-01-19',
        time: '09:30 AM',
        duration: '45 minutes',
        type: 'In-Person',
        status: 'no-show',
        specialty: 'Mental Health',
        reason: 'Therapy session',
        diagnosis: '',
        prescription: '',
        notes: 'Patient did not attend scheduled appointment. Contacted patient, rescheduled for next week.',
        followUp: '2024-01-26',
        rating: null,
        patientAge: 29,
        visitNumber: 5
      }
    ]);
  }, []);

  // Filter consultations based on search, status, and type
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    const matchesType = filterType === 'all' || consultation.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const indexOfLastConsultation = currentPage * consultationsPerPage;
  const indexOfFirstConsultation = indexOfLastConsultation - consultationsPerPage;
  const currentConsultations = filteredConsultations.slice(indexOfFirstConsultation, indexOfLastConsultation);
  const totalPages = Math.ceil(filteredConsultations.length / consultationsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'no-show':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'Phone Call':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      default:
        return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <StarIcon
            key={index}
            className={`h-4 w-4 ${
              index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Consultations - MediConnect AI</title>
        <meta name="description" content="View and manage your consultation history" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/provider')}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <VideoCameraIcon className="h-8 w-8 mr-3 text-teal-600" />
                    Consultations
                  </h1>
                  <p className="mt-2 text-gray-600">
                    View consultation history and patient notes
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <VideoCameraIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                    <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {consultations.filter(c => c.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <StarIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(consultations.filter(c => c.rating).reduce((acc, c) => acc + c.rating, 0) / 
                        consultations.filter(c => c.rating).length || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search consultations by patient, reason, specialty, or diagnosis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Types</option>
                        <option value="Video Call">Video Call</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Phone Call">Phone Call</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultations List */}
            <div className="space-y-6">
              {currentConsultations.map((consultation) => (
                <div key={consultation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              {consultation.patientName}
                              <span className="ml-3 text-sm text-gray-500">#{consultation.patientId}</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Visit #{consultation.visitNumber} • {consultation.specialty}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Date & Time</p>
                            <p className="text-sm text-gray-600">{consultation.date} at {consultation.time}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <div className="flex items-center">
                              {getTypeIcon(consultation.type)}
                              <span className="ml-2 text-sm text-gray-600">{consultation.duration} ({consultation.type})</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Reason</p>
                            <p className="text-sm text-gray-600">{consultation.reason}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Rating</p>
                            {renderStars(consultation.rating)}
                          </div>
                        </div>

                        {consultation.status === 'completed' && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                              <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Prescription</p>
                              <p className="text-sm text-gray-600">{consultation.prescription}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Notes</p>
                              <p className="text-sm text-gray-600">{consultation.notes}</p>
                            </div>
                            {consultation.followUp && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Follow-up</p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                  {consultation.followUp}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                        <button className="flex items-center justify-center px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">View</span>
                        </button>
                        <button className="flex items-center justify-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button className="flex items-center justify-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstConsultation + 1} to {Math.min(indexOfLastConsultation, filteredConsultations.length)} of {filteredConsultations.length} consultations
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === index + 1
                          ? 'bg-teal-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ProviderConsultations;
