import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const ProviderPatients = () => {
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // Mock patients data
  useEffect(() => {
    setPatients([
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        age: 45,
        gender: 'Male',
        bloodType: 'O+',
        lastVisit: '2024-01-15',
        nextAppointment: '2024-01-25',
        condition: 'Hypertension',
        status: 'active',
        riskLevel: 'moderate',
        avatar: '/api/placeholder/40/40'
      },
      {
        id: 2,
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 234-5678',
        age: 32,
        gender: 'Female',
        bloodType: 'A+',
        lastVisit: '2024-01-18',
        nextAppointment: '2024-01-22',
        condition: 'Diabetes Type 2',
        status: 'active',
        riskLevel: 'high',
        avatar: '/api/placeholder/40/40'
      },
      {
        id: 3,
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+1 (555) 345-6789',
        age: 28,
        gender: 'Male',
        bloodType: 'B+',
        lastVisit: '2024-01-10',
        nextAppointment: null,
        condition: 'Annual Checkup',
        status: 'inactive',
        riskLevel: 'low',
        avatar: '/api/placeholder/40/40'
      },
      {
        id: 4,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 456-7890',
        age: 38,
        gender: 'Female',
        bloodType: 'AB+',
        lastVisit: '2024-01-20',
        nextAppointment: '2024-01-30',
        condition: 'Cardiac Monitoring',
        status: 'active',
        riskLevel: 'high',
        avatar: '/api/placeholder/40/40'
      },
      {
        id: 5,
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1 (555) 567-8901',
        age: 52,
        gender: 'Male',
        bloodType: 'O-',
        lastVisit: '2024-01-12',
        nextAppointment: '2024-01-28',
        condition: 'Cholesterol Management',
        status: 'active',
        riskLevel: 'moderate',
        avatar: '/api/placeholder/40/40'
      }
    ]);
  }, []);

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Patients - MediConnect AI</title>
        <meta name="description" content="Manage your patients and their medical records" />
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
                    <UserGroupIcon className="h-8 w-8 mr-3 text-teal-600" />
                    My Patients
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage and monitor your patients' health records
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    Add New Patient
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.riskLevel === 'high').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
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
                        placeholder="Search patients by name, email, or condition..."
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Info</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Last Visit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPatients.map((patient) => (
                        <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-600">{patient.age} years old</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">{patient.email}</p>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">{patient.gender}</p>
                            <p className="text-sm text-gray-600">Blood: {patient.bloodType}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900">{patient.condition}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(patient.riskLevel)}`}>
                              {patient.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">{patient.lastVisit}</p>
                            {patient.nextAppointment && (
                              <p className="text-sm text-gray-600">Next: {patient.nextAppointment}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-teal-600 hover:text-teal-700">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-700">
                                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-700">
                                <PhoneIcon className="h-4 w-4" />
                              </button>
                              <button className="text-purple-600 hover:text-purple-700">
                                <VideoCameraIcon className="h-4 w-4" />
                              </button>
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
                      Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
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

export default ProviderPatients;
