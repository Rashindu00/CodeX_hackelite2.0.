import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
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
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HealthRecords = () => {
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    description: '',
    category: 'general'
  });
  
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [medicationForm, setMedicationForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribedBy: '',
    notes: '',
    status: 'active'
  });
  
  const [allergyForm, setAllergyForm] = useState({
    allergen: '',
    severity: 'mild',
    reaction: '',
    diagnosedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch health records data
  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/health-records');
      const healthRecords = response.data.data.healthRecords;
      
      // Separate records by type
      const documents = healthRecords.filter(record => record.type === 'document');
      const vitalsData = healthRecords.filter(record => record.type === 'vitals');
      const medicationsData = healthRecords.filter(record => record.type === 'medication');
      const allergiesData = healthRecords.filter(record => record.type === 'allergy');
      
      setRecords(documents);
      setVitals(vitalsData);
      setMedications(medicationsData);
      setAllergies(allergiesData);
    } catch (error) {
      console.error('Error fetching health records:', error);
      toast.error('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);

      await api.post('/health-records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Health record uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ file: null, title: '', description: '', category: 'general' });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error uploading record:', error);
      toast.error('Failed to upload health record');
    } finally {
      setLoading(false);
    }
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/health-records/vitals', vitalsForm);
      toast.success('Vital signs added successfully!');
      setShowVitalsModal(false);
      setVitalsForm({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error adding vitals:', error);
      toast.error('Failed to add vital signs');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/health-records/medications', medicationForm);
      toast.success('Medication added successfully!');
      setShowMedicationModal(false);
      setMedicationForm({
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        prescribedBy: '',
        notes: '',
        status: 'active'
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const handleAllergySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/health-records/allergies', allergyForm);
      toast.success('Allergy added successfully!');
      setShowAllergyModal(false);
      setAllergyForm({
        allergen: '',
        severity: 'mild',
        reaction: '',
        diagnosedDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Failed to add allergy');
    } finally {
      setLoading(false);
    }
  };

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
    if (!severity) {
      return 'text-gray-600 bg-gray-100';
    }
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
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
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
                      <button 
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
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
                      <button 
                        onClick={() => setShowVitalsModal(true)}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
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
                      <button 
                        onClick={() => setShowMedicationModal(true)}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
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
                      <button 
                        onClick={() => setShowAllergyModal(true)}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Health Record</h3>
                <button onClick={() => setShowUploadModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="general">General</option>
                      <option value="lab">Lab Results</option>
                      <option value="prescription">Prescription</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vitals Modal */}
        {showVitalsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Vital Signs</h3>
                <button onClick={() => setShowVitalsModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleVitalsSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure (systolic/diastolic)
                    </label>
                    <input
                      type="text"
                      value={vitalsForm.bloodPressure}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitalsForm.heartRate}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="98.6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsForm.weight}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsForm.height}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, height: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="68"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={vitalsForm.date}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={vitalsForm.notes}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowVitalsModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Vitals'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medication Modal */}
        {showMedicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Medication</h3>
                <button onClick={() => setShowMedicationModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleMedicationSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medicationForm.medicationName}
                      onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter medication name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={medicationForm.dosage}
                      onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      value={medicationForm.frequency}
                      onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Once daily"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={medicationForm.startDate}
                      onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={medicationForm.endDate}
                      onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescribed By
                    </label>
                    <input
                      type="text"
                      value={medicationForm.prescribedBy}
                      onChange={(e) => setMedicationForm({ ...medicationForm, prescribedBy: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Doctor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={medicationForm.notes}
                      onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMedicationModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Medication'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Allergy Modal */}
        {showAllergyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Allergy</h3>
                <button onClick={() => setShowAllergyModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleAllergySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergen *
                    </label>
                    <input
                      type="text"
                      value={allergyForm.allergen}
                      onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Penicillin, Peanuts"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity *
                    </label>
                    <select
                      value={allergyForm.severity}
                      onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reaction
                    </label>
                    <input
                      type="text"
                      value={allergyForm.reaction}
                      onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Skin rash, Breathing difficulty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosed Date
                    </label>
                    <input
                      type="date"
                      value={allergyForm.diagnosedDate}
                      onChange={(e) => setAllergyForm({ ...allergyForm, diagnosedDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={allergyForm.notes}
                      onChange={(e) => setAllergyForm({ ...allergyForm, notes: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAllergyModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Allergy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default HealthRecords;
