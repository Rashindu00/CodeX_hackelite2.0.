import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  IdentificationIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { UserIcon as UserSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminProviders = () => {
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const providersPerPage = 10;

  // Mock providers data
  const [providers, setProviders] = useState([
    {
      id: 1,
      name: 'Dr. Saman Kumara',
      email: 'saman.kumara@hospital.lk',
      phone: '+94 77 111 2222',
      specialty: 'Cardiologist',
      licenseNumber: 'MD-12345',
      experience: 15,
      qualifications: ['MBBS', 'MD Cardiology', 'FACC'],
      hospital: 'National Hospital of Sri Lanka',
      address: 'No. 123, Regent Street, Colombo 07',
      registrationDate: '2023-06-15',
      lastActive: '2024-09-23',
      totalPatients: 145,
      totalAppointments: 567,
      rating: 4.9,
      reviews: 89,
      status: 'active',
      verificationStatus: 'verified',
      monthlyRevenue: 285000,
      avatar: null,
      documents: {
        medicalLicense: 'verified',
        qualificationCertificates: 'verified',
        hospitalAffiliation: 'verified'
      }
    },
    {
      id: 2,
      name: 'Dr. Priya Fernando',
      email: 'priya.fernando@private.lk',
      phone: '+94 71 333 4444',
      specialty: 'Dermatologist',
      licenseNumber: 'MD-23456',
      experience: 12,
      qualifications: ['MBBS', 'MD Dermatology'],
      hospital: 'Asiri Medical Hospital',
      address: 'No. 456, Galle Road, Colombo 03',
      registrationDate: '2023-08-20',
      lastActive: '2024-09-22',
      totalPatients: 132,
      totalAppointments: 423,
      rating: 4.8,
      reviews: 67,
      status: 'active',
      verificationStatus: 'verified',
      monthlyRevenue: 198000,
      avatar: null,
      documents: {
        medicalLicense: 'verified',
        qualificationCertificates: 'verified',
        hospitalAffiliation: 'pending'
      }
    },
    {
      id: 3,
      name: 'Dr. Ravi Mendis',
      email: 'ravi.mendis@neuro.lk',
      phone: '+94 70 555 6666',
      specialty: 'Neurologist',
      licenseNumber: 'MD-34567',
      experience: 18,
      qualifications: ['MBBS', 'MD Neurology', 'FRCP'],
      hospital: 'Lanka Hospital',
      address: 'No. 789, Duplication Road, Colombo 04',
      registrationDate: '2024-01-10',
      lastActive: '2024-09-20',
      totalPatients: 98,
      totalAppointments: 312,
      rating: 4.7,
      reviews: 45,
      status: 'active',
      verificationStatus: 'verified',
      monthlyRevenue: 156000,
      avatar: null,
      documents: {
        medicalLicense: 'verified',
        qualificationCertificates: 'verified',
        hospitalAffiliation: 'verified'
      }
    },
    {
      id: 4,
      name: 'Dr. Nimal Silva',
      email: 'nimal.silva@ortho.lk',
      phone: '+94 76 777 8888',
      specialty: 'Orthopedist',
      licenseNumber: 'MD-45678',
      experience: 8,
      qualifications: ['MBBS', 'MS Orthopedics'],
      hospital: 'Nawaloka Hospital',
      address: 'No. 321, Baseline Road, Colombo 09',
      registrationDate: '2024-09-01',
      lastActive: '2024-09-21',
      totalPatients: 67,
      totalAppointments: 189,
      rating: 4.6,
      reviews: 23,
      status: 'pending',
      verificationStatus: 'pending',
      monthlyRevenue: 89000,
      avatar: null,
      documents: {
        medicalLicense: 'pending',
        qualificationCertificates: 'verified',
        hospitalAffiliation: 'pending'
      }
    },
    {
      id: 5,
      name: 'Dr. Kamani Perera',
      email: 'kamani.perera@gyn.lk',
      phone: '+94 75 999 0000',
      specialty: 'Gynecologist',
      licenseNumber: 'MD-56789',
      experience: 20,
      qualifications: ['MBBS', 'MD Obstetrics & Gynecology', 'FRCOG'],
      hospital: 'Durdans Hospital',
      address: 'No. 654, Alfred Place, Colombo 03',
      registrationDate: '2023-03-25',
      lastActive: '2024-09-19',
      totalPatients: 189,
      totalAppointments: 678,
      rating: 4.9,
      reviews: 112,
      status: 'active',
      verificationStatus: 'verified',
      monthlyRevenue: 345000,
      avatar: null,
      documents: {
        medicalLicense: 'verified',
        qualificationCertificates: 'verified',
        hospitalAffiliation: 'verified'
      }
    }
  ]);

  const specialties = [
    'all', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 
    'Gynecologist', 'Pediatrician', 'Psychiatrist', 'ENT Specialist'
  ];

  // Filter providers based on search, status, and specialty
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || provider.status === selectedStatus;
    const matchesSpecialty = selectedSpecialty === 'all' || provider.specialty === selectedSpecialty;
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);
  const startIndex = (currentPage - 1) * providersPerPage;
  const endIndex = startIndex + providersPerPage;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  const handleSelectProvider = (providerId) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === currentProviders.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(currentProviders.map(provider => provider.id));
    }
  };

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleStatusChange = (providerId, newStatus) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId ? { ...provider, status: newStatus } : provider
    ));
  };

  const handleVerificationChange = (providerId, newVerificationStatus) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId ? { ...provider, verificationStatus: newVerificationStatus } : provider
    ));
  };

  const ProviderModal = ({ provider, onClose }) => {
    if (!provider) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          
          <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Provider Details</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-green-800 rounded-full transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Provider Info */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm text-gray-900 mt-1">{provider.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specialty</label>
                        <p className="text-sm text-gray-900 mt-1">{provider.specialty}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">License Number</label>
                        <p className="text-sm text-gray-900 mt-1">{provider.licenseNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-sm text-gray-900 mt-1">{provider.experience} years</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Hospital Affiliation</label>
                        <p className="text-sm text-gray-900 mt-1">{provider.hospital}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.qualifications.map((qualification, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {qualification}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{provider.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{provider.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-900">{provider.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Document Verification Status</h4>
                    <div className="space-y-3">
                      {Object.entries(provider.documents).map(([docType, status]) => (
                        <div key={docType} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {docType.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center">
                      <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{provider.totalPatients}</p>
                        <p className="text-sm text-blue-800">Total Patients</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{provider.totalAppointments}</p>
                        <p className="text-sm text-green-800">Total Appointments</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <StarSolid
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating) ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-600">{provider.rating}/5</p>
                        <p className="text-sm text-yellow-800">{provider.reviews} reviews</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-lg font-bold text-purple-600">
                          LKR {provider.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-purple-800">Monthly Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Status</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : provider.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Verification</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.verificationStatus === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : provider.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.verificationStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Registration Info</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Joined: {provider.registrationDate}</p>
                      <p>Last Active: {provider.lastActive}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {provider.verificationStatus === 'pending' && (
                  <button
                    onClick={() => handleVerificationChange(provider.id, 'verified')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Verify Provider
                  </button>
                )}
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Edit Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserSolid className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Provider Management</h1>
                <p className="text-sm text-gray-600">Manage healthcare providers and verifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <span className="text-sm text-gray-600">
                {providers.filter(p => p.verificationStatus === 'pending').length} pending verifications
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {filteredProviders.length} providers found
              </span>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedProviders.length === currentProviders.length && currentProviders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Specialty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hospital</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Experience</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Patients</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Verification</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProviders.map((provider) => (
                  <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={() => handleSelectProvider(provider.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-green-600">
                            {provider.name.charAt(3)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{provider.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{provider.specialty}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{provider.hospital}</td>
                    <td className="py-3 px-4 text-gray-600">{provider.experience}y</td>
                    <td className="py-3 px-4 text-gray-600">{provider.totalPatients}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <StarSolid className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{provider.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : provider.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        provider.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : provider.verificationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProvider(provider)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {provider.verificationStatus === 'pending' && (
                          <button
                            onClick={() => handleVerificationChange(provider.id, 'verified')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(provider.id, provider.status === 'active' ? 'inactive' : 'active')}
                          className={`p-1 ${provider.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {provider.status === 'active' ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProviders.length)} of {filteredProviders.length} providers
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Actions */}
        {selectedProviders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded-lg hover:bg-green-50">
                  Approve
                </button>
                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50">
                  Activate
                </button>
                <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50">
                  Suspend
                </button>
                <button className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 border border-purple-300 rounded-lg hover:bg-purple-50">
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      {showProviderModal && (
        <ProviderModal
          provider={selectedProvider}
          onClose={() => {
            setShowProviderModal(false);
            setSelectedProvider(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminProviders;