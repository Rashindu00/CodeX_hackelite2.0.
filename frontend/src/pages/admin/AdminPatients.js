import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon as UserGroupSolid } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminPatients = () => {
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const patientsPerPage = 10;

  // Mock patients data
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'Kasun Perera',
      email: 'kasun.perera@email.com',
      phone: '+94 77 123 4567',
      age: 32,
      gender: 'Male',
      address: 'No. 123, Galle Road, Colombo 03',
      registrationDate: '2024-01-15',
      lastVisit: '2024-09-20',
      totalAppointments: 8,
      status: 'active',
      medicalHistory: ['Hypertension', 'Diabetes Type 2'],
      emergencyContact: {
        name: 'Nimali Perera',
        phone: '+94 77 234 5678',
        relationship: 'Wife'
      },
      insurance: 'AIA Insurance',
      avatar: null
    },
    {
      id: 2,
      name: 'Nimali Silva',
      email: 'nimali.silva@email.com',
      phone: '+94 71 987 6543',
      age: 28,
      gender: 'Female',
      address: 'No. 456, Kandy Road, Malabe',
      registrationDate: '2024-02-20',
      lastVisit: '2024-09-18',
      totalAppointments: 12,
      status: 'active',
      medicalHistory: ['Asthma', 'Allergies'],
      emergencyContact: {
        name: 'Sunil Silva',
        phone: '+94 77 345 6789',
        relationship: 'Husband'
      },
      insurance: 'Janashakthi Insurance',
      avatar: null
    },
    {
      id: 3,
      name: 'Sunil Jayawardena',
      email: 'sunil.jay@email.com',
      phone: '+94 70 555 1234',
      age: 45,
      gender: 'Male',
      address: 'No. 789, Negombo Road, Wattala',
      registrationDate: '2023-11-10',
      lastVisit: '2024-08-15',
      totalAppointments: 15,
      status: 'inactive',
      medicalHistory: ['Heart Disease', 'High Cholesterol'],
      emergencyContact: {
        name: 'Mala Jayawardena',
        phone: '+94 77 456 7890',
        relationship: 'Wife'
      },
      insurance: 'Ceylinco Insurance',
      avatar: null
    },
    {
      id: 4,
      name: 'Priya Fernando',
      email: 'priya.fernando@email.com',
      phone: '+94 76 888 9999',
      age: 35,
      gender: 'Female',
      address: 'No. 321, Matara Road, Galle',
      registrationDate: '2024-03-05',
      lastVisit: '2024-09-22',
      totalAppointments: 6,
      status: 'active',
      medicalHistory: ['Migraine', 'Anxiety'],
      emergencyContact: {
        name: 'Rohan Fernando',
        phone: '+94 77 567 8901',
        relationship: 'Husband'
      },
      insurance: 'Union Assurance',
      avatar: null
    },
    {
      id: 5,
      name: 'Ravi Mendis',
      email: 'ravi.mendis@email.com',
      phone: '+94 75 222 3333',
      age: 52,
      gender: 'Male',
      address: 'No. 654, Kurunegala Road, Kiribathgoda',
      registrationDate: '2023-09-12',
      lastVisit: '2024-09-10',
      totalAppointments: 20,
      status: 'active',
      medicalHistory: ['Arthritis', 'Back Pain', 'Sleep Apnea'],
      emergencyContact: {
        name: 'Kamani Mendis',
        phone: '+94 77 678 9012',
        relationship: 'Wife'
      },
      insurance: 'SLIC Insurance',
      avatar: null
    }
  ]);

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === currentPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(currentPatients.map(patient => patient.id));
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleStatusChange = (patientId, newStatus) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId ? { ...patient, status: newStatus } : patient
    ));
  };

  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          
          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Patient Details</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-blue-800 rounded-full transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.age} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Gender</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{patient.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{patient.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-900">{patient.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Medical History</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.medicalHistory.map((condition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.emergencyContact.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Relationship</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.emergencyContact.relationship}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900 mt-1">{patient.emergencyContact.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{patient.totalAppointments}</p>
                        <p className="text-sm text-blue-800">Total Appointments</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center">
                      <HeartIcon className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Registration Date</p>
                        <p className="text-sm text-green-600">{patient.registrationDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-8 h-8 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Last Visit</p>
                        <p className="text-sm text-yellow-600">{patient.lastVisit}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center">
                      <UserGroupIcon className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Insurance</p>
                        <p className="text-sm text-purple-600">{patient.insurance}</p>
                      </div>
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
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Edit Patient
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupSolid className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-sm text-gray-600">Manage all registered patients</p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 mt-4 sm:mt-0">
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add New Patient
            </button>
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
                  placeholder="Search patients..."
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
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {filteredPatients.length} patients found
              </span>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === currentPatients.length && currentPatients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelectPatient(patient.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{patient.email}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.totalAppointments}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Edit Patient"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(patient.id, patient.status === 'active' ? 'inactive' : 'active')}
                          className={`p-1 ${patient.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={patient.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {patient.status === 'active' ? (
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
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
        {selectedPatients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded-lg hover:bg-green-50">
                  Activate
                </button>
                <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50">
                  Deactivate
                </button>
                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50">
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminPatients;