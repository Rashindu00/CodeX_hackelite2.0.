import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import {
  DocumentTextIcon,
  HeartIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const HealthRecords = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);

  // Mock data
  useEffect(() => {
    // Mock health records
    setRecords([
      {
        id: 1,
        type: 'Lab Report',
        title: 'Complete Blood Count',
        date: '2024-01-15',
        provider: 'Dr. Sarah Johnson',
        status: 'Normal',
        file: 'blood_test_jan_2024.pdf'
      },
      {
        id: 2,
        type: 'Prescription',
        title: 'Blood Pressure Medication',
        date: '2024-01-10',
        provider: 'Dr. Michael Chen',
        status: 'Active',
        file: 'prescription_jan_2024.pdf'
      },
      {
        id: 3,
        type: 'Visit Summary',
        title: 'Annual Physical Examination',
        date: '2024-01-05',
        provider: 'Dr. Emily Davis',
        status: 'Complete',
        file: 'annual_checkup_2024.pdf'
      },
      {
        id: 4,
        type: 'Imaging',
        title: 'Chest X-Ray',
        date: '2023-12-20',
        provider: 'Radiology Department',
        status: 'Normal',
        file: 'chest_xray_dec_2023.pdf'
      }
    ]);

    // Mock vital signs
    setVitals([
      { date: '2024-01-15', bloodPressure: '120/80', heartRate: 72, temperature: 98.6, weight: 150 },
      { date: '2024-01-10', bloodPressure: '118/78', heartRate: 75, temperature: 98.4, weight: 149 },
      { date: '2024-01-05', bloodPressure: '122/82', heartRate: 70, temperature: 98.7, weight: 151 },
      { date: '2023-12-20', bloodPressure: '119/79', heartRate: 73, temperature: 98.5, weight: 150 }
    ]);

    // Mock medications
    setMedications([
      {
        id: 1,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Michael Chen',
        startDate: '2024-01-10',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2023-11-15',
        status: 'Active'
      }
    ]);

    // Mock allergies
    setAllergies([
      { id: 1, allergen: 'Penicillin', reaction: 'Skin rash', severity: 'Moderate' },
      { id: 2, allergen: 'Peanuts', reaction: 'Breathing difficulty', severity: 'Severe' }
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'complete':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'text-red-600 bg-red-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'mild':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'records', name: 'Medical Records', icon: DocumentTextIcon },
    { id: 'vitals', name: 'Vital Signs', icon: HeartIcon },
    { id: 'medications', name: 'Medications', icon: UserIcon },
    { id: 'allergies', name: 'Allergies', icon: CalendarIcon }
  ];

  return (
    <>
      <Helmet>
        <title>Health Records - MediConnect AI</title>
        <meta name="description" content="Manage and view your health records" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/patient')}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-8 w-8 mr-3 text-teal-600" />
                    Health Records
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Access and manage your medical information
                  </p>
                </div>
                <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload Record
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                          activeTab === tab.id
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quick Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <HeartIcon className="h-8 w-8 text-red-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Medications</p>
                            <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Records */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
                        <div className="space-y-3">
                          {records.slice(0, 3).map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">{record.title}</p>
                                  <p className="text-sm text-gray-600">{record.provider} • {record.date}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Latest Vitals */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vitals</h3>
                      {vitals.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Blood Pressure</span>
                            <span className="font-medium">{vitals[0].bloodPressure} mmHg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Heart Rate</span>
                            <span className="font-medium">{vitals[0].heartRate} bpm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Temperature</span>
                            <span className="font-medium">{vitals[0].temperature}°F</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weight</span>
                            <span className="font-medium">{vitals[0].weight} lbs</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-4">
                            Last updated: {vitals[0].date}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Records Tab */}
              {activeTab === 'records' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
                      <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Record
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((record) => (
                            <tr key={record.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-600">{record.type}</td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">{record.title}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{record.provider}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button className="text-teal-600 hover:text-teal-700">
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-700">
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Vitals Tab */}
              {activeTab === 'vitals' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Vital Signs History</h3>
                      <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Vitals
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Blood Pressure</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Heart Rate</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Temperature</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitals.map((vital, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-900">{vital.date}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{vital.bloodPressure} mmHg</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{vital.heartRate} bpm</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{vital.temperature}°F</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{vital.weight} lbs</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications Tab */}
              {activeTab === 'medications' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
                      <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Medication
                      </button>
                    </div>
                    <div className="space-y-4">
                      {medications.map((medication) => (
                        <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                              <p className="text-sm text-gray-600">
                                {medication.dosage} • {medication.frequency}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Prescribed by {medication.prescribedBy} on {medication.startDate}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medication.status)}`}>
                              {medication.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Allergies Tab */}
              {activeTab === 'allergies' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Known Allergies</h3>
                      <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Allergy
                      </button>
                    </div>
                    <div className="space-y-4">
                      {allergies.map((allergy) => (
                        <div key={allergy.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{allergy.allergen}</h4>
                              <p className="text-sm text-gray-600">{allergy.reaction}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(allergy.severity)}`}>
                              {allergy.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default HealthRecords;
