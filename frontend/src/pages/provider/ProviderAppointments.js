import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  VideoCameraIcon,
  PhoneIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const ProviderAppointments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  // Mock appointments data
  useEffect(() => {
    setAppointments([
      {
        id: 1,
        patientName: 'John Smith',
        patientId: 'P001',
        date: '2024-01-25',
        time: '09:00 AM',
        duration: '30 min',
        type: 'In-Person',
        specialty: 'Cardiology',
        status: 'confirmed',
        reason: 'Regular checkup for hypertension',
        notes: 'Patient reports feeling better with new medication',
        patientAge: 45,
        patientPhone: '+1 (555) 123-4567',
        isUrgent: false
      },
      {
        id: 2,
        patientName: 'Maria Garcia',
        patientId: 'P002',
        date: '2024-01-25',
        time: '10:30 AM',
        duration: '45 min',
        type: 'Video Call',
        specialty: 'Endocrinology',
        status: 'confirmed',
        reason: 'Diabetes management consultation',
        notes: 'Follow-up on insulin dosage adjustment',
        patientAge: 32,
        patientPhone: '+1 (555) 234-5678',
        isUrgent: true
      },
      {
        id: 3,
        patientName: 'David Wilson',
        patientId: 'P003',
        date: '2024-01-25',
        time: '02:00 PM',
        duration: '30 min',
        type: 'In-Person',
        specialty: 'General Medicine',
        status: 'pending',
        reason: 'Annual physical examination',
        notes: '',
        patientAge: 28,
        patientPhone: '+1 (555) 345-6789',
        isUrgent: false
      },
      {
        id: 4,
        patientName: 'Sarah Johnson',
        patientId: 'P004',
        date: '2024-01-26',
        time: '11:00 AM',
        duration: '60 min',
        type: 'In-Person',
        specialty: 'Cardiology',
        status: 'confirmed',
        reason: 'Cardiac stress test results',
        notes: 'Review test results and discuss treatment options',
        patientAge: 38,
        patientPhone: '+1 (555) 456-7890',
        isUrgent: true
      },
      {
        id: 5,
        patientName: 'Michael Brown',
        patientId: 'P005',
        date: '2024-01-26',
        time: '03:30 PM',
        duration: '30 min',
        type: 'Phone Call',
        specialty: 'General Medicine',
        status: 'cancelled',
        reason: 'Cholesterol management follow-up',
        notes: 'Patient requested to reschedule',
        patientAge: 52,
        patientPhone: '+1 (555) 567-8901',
        isUrgent: false
      },
      {
        id: 6,
        patientName: 'Emily Davis',
        patientId: 'P006',
        date: '2024-01-27',
        time: '09:30 AM',
        duration: '45 min',
        type: 'Video Call',
        specialty: 'Mental Health',
        status: 'confirmed',
        reason: 'Therapy session',
        notes: 'Continue cognitive behavioral therapy',
        patientAge: 29,
        patientPhone: '+1 (555) 678-9012',
        isUrgent: false
      }
    ]);
  }, []);

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = appointment.date === '2024-01-25';
    } else if (filterDate === 'tomorrow') {
      matchesDate = appointment.date === '2024-01-26';
    } else if (filterDate === 'week') {
      matchesDate = ['2024-01-25', '2024-01-26', '2024-01-27'].includes(appointment.date);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'Phone Call':
        return <PhoneIcon className="h-4 w-4" />;
      default:
        return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  return (
    <>
      <Helmet>
        <title>Appointments - MediConnect AI</title>
        <meta name="description" content="Manage your appointments and schedule" />
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
                    <CalendarDaysIcon className="h-8 w-8 mr-3 text-teal-600" />
                    Appointments
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage your appointment schedule and patient visits
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button className="bg-white text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
                    View Calendar
                  </button>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(apt => apt.date === '2024-01-25').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(apt => apt.isUrgent).length}
                    </p>
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
                        placeholder="Search appointments by patient, reason, or specialty..."
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
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="week">This Week</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Specialty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAppointments.map((appointment) => (
                        <tr key={appointment.id} className={`border-b border-gray-100 hover:bg-gray-50 ${appointment.isUrgent ? 'bg-red-50' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900 flex items-center">
                                  {appointment.patientName}
                                  {appointment.isUrgent && (
                                    <span className="ml-2 text-red-500 text-xs font-bold">URGENT</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">ID: {appointment.patientId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                            <p className="text-sm text-gray-600">{appointment.time} ({appointment.duration})</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getTypeIcon(appointment.type)}
                              <span className="ml-2 text-sm text-gray-900">{appointment.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900">{appointment.specialty}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">{appointment.reason}</p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button 
                                className="text-teal-600 hover:text-teal-700"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-blue-600 hover:text-blue-700"
                                title="Edit Appointment"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              {appointment.type === 'Video Call' && (
                                <button 
                                  className="text-green-600 hover:text-green-700"
                                  title="Start Video Call"
                                >
                                  <VideoCameraIcon className="h-4 w-4" />
                                </button>
                              )}
                              {appointment.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <button 
                                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                    className="text-green-600 hover:text-green-700"
                                    title="Confirm"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                    className="text-red-600 hover:text-red-700"
                                    title="Cancel"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
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
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ProviderAppointments;
