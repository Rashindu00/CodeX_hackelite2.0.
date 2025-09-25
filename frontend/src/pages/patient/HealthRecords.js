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
  XMarkIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  // Edit states
  const [editingVital, setEditingVital] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
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
      
      // Separate records by type and sort by date (most recent first)
      const documents = healthRecords.filter(record => record.type === 'document')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const vitalsData = healthRecords.filter(record => record.type === 'vitals')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const medicationsData = healthRecords.filter(record => record.type === 'medication')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const allergiesData = healthRecords.filter(record => record.type === 'allergy')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setRecords(documents);
      setVitals(vitalsData);
      setMedications(medicationsData);
      setAllergies(allergiesData);
      
      // Enhanced debug logging
      console.log('=== HEALTH RECORDS DATA ANALYSIS ===');
      console.log('Vitals data:', vitalsData);
      console.log('Medications data:', medicationsData);
      console.log('Allergies data:', allergiesData);
      console.log('Records data:', documents);
      console.log('All health records:', healthRecords);
      
      if (vitalsData.length > 0) {
        console.log('Latest vital:', vitalsData[0]);
        console.log('Latest vital data structure:', vitalsData[0].data);
      }
      if (medicationsData.length > 0) {
        console.log('First medication:', medicationsData[0]);
        console.log('First medication data structure:', medicationsData[0].data);
      }
      if (allergiesData.length > 0) {
        console.log('First allergy:', allergiesData[0]);
        console.log('First allergy data structure:', allergiesData[0].data);
      }
      if (documents.length > 0) {
        console.log('Latest document:', documents[0]);
      }
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
      if (editingVital) {
        // Update existing vital
        await api.put(`/health-records/vitals/${editingVital._id}`, vitalsForm);
        toast.success('Vital signs updated successfully!');
      } else {
        // Create new vital
        await api.post('/health-records/vitals', vitalsForm);
        toast.success('Vital signs added successfully!');
      }
      setShowVitalsModal(false);
      setEditingVital(null);
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
      console.error('Error saving vitals:', error);
      toast.error(editingVital ? 'Failed to update vital signs' : 'Failed to add vital signs');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingMedication) {
        // Update existing medication
        await api.put(`/health-records/medications/${editingMedication._id}`, medicationForm);
        toast.success('Medication updated successfully!');
      } else {
        // Create new medication
        await api.post('/health-records/medications', medicationForm);
        toast.success('Medication added successfully!');
      }
      setShowMedicationModal(false);
      setEditingMedication(null);
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
      console.error('Error saving medication:', error);
      toast.error(editingMedication ? 'Failed to update medication' : 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const handleAllergySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAllergy) {
        // Update existing allergy
        await api.put(`/health-records/allergies/${editingAllergy._id}`, allergyForm);
        toast.success('Allergy updated successfully!');
      } else {
        // Create new allergy
        await api.post('/health-records/allergies', allergyForm);
        toast.success('Allergy added successfully!');
      }
      setShowAllergyModal(false);
      setEditingAllergy(null);
      setAllergyForm({
        allergen: '',
        severity: 'mild',
        reaction: '',
        diagnosedDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error saving allergy:', error);
      toast.error(editingAllergy ? 'Failed to update allergy' : 'Failed to add allergy');
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEditVital = (vital) => {
    setEditingVital(vital);
    setVitalsForm({
      bloodPressure: vital.data?.bloodPressure ? `${vital.data.bloodPressure.systolic}/${vital.data.bloodPressure.diastolic}` : '',
      heartRate: vital.data?.heartRate || '',
      temperature: vital.data?.temperature || '',
      weight: vital.data?.weight || '',
      height: vital.data?.height || '',
      notes: vital.data?.notes || '',
      date: vital.date ? vital.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowVitalsModal(true);
  };

  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setMedicationForm({
      medicationName: medication.data?.name || medication.data?.medicationName || '',
      dosage: medication.data?.dosage || '',
      frequency: medication.data?.frequency || '',
      startDate: medication.data?.startDate ? medication.data.startDate.split('T')[0] : medication.date.split('T')[0],
      endDate: medication.data?.endDate ? medication.data.endDate.split('T')[0] : '',
      prescribedBy: medication.data?.prescribedBy || '',
      notes: medication.data?.notes || '',
      status: medication.status || 'active'
    });
    setShowMedicationModal(true);
  };

  const handleEditAllergy = (allergy) => {
    setEditingAllergy(allergy);
    setAllergyForm({
      allergen: allergy.data?.allergen || '',
      severity: allergy.data?.severity || 'mild',
      reaction: allergy.data?.reaction || '',
      diagnosedDate: allergy.data?.diagnosedDate ? allergy.data.diagnosedDate.split('T')[0] : allergy.date.split('T')[0],
      notes: allergy.data?.notes || ''
    });
    setShowAllergyModal(true);
  };

  // Delete handlers
  const handleDeleteConfirm = (record, type) => {
    setDeleteTarget({ record, type });
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;
    
    try {
      setLoading(true);
      const { record, type } = deleteTarget;
      
      switch (type) {
        case 'vital':
          await api.delete(`/health-records/vitals/${record._id}`);
          toast.success('Vital signs deleted successfully!');
          break;
        case 'medication':
          await api.delete(`/health-records/medications/${record._id}`);
          toast.success('Medication deleted successfully!');
          break;
        case 'allergy':
          await api.delete(`/health-records/allergies/${record._id}`);
          toast.success('Allergy deleted successfully!');
          break;
        case 'document':
          await api.delete(`/health-records/${record._id}`);
          toast.success('Medical record deleted successfully!');
          break;
        default:
          throw new Error('Unknown record type');
      }
      
      setShowDeleteConfirmModal(false);
      setDeleteTarget(null);
      fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
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

  // Handler functions for view and download
  const handleViewRecord = (record) => {
    console.log('🔥 PATH CLEANING ACTIVE - View Record 🔥');
    // Check if record has file data
    const filePath = record.data?.filePath || record.filePath;
    const fileName = record.data?.filename || record.data?.originalName;
    
    console.log('=== DEBUGGING VIEW RECORD ===');
    console.log('Full record object:', record);
    console.log('record.data:', record.data);
    console.log('record.filePath:', record.filePath);
    console.log('Final filePath value:', filePath);
    console.log('filePath type:', typeof filePath);
    console.log('filePath length:', filePath?.length);
    
    if (filePath) {
      // If it's a file, open in new tab
      let fileUrl;
      if (filePath.startsWith('http')) {
        fileUrl = filePath;
        console.log('Using HTTP URL directly:', fileUrl);
      } else {
        // For local files, construct the URL using the static file server
        console.log('Processing local file path...');
        console.log('Original filePath:', filePath);
        
        // Handle various path formats more robustly - aggressive cleaning
        let cleanPath = filePath;
        
        // First, normalize backslashes to forward slashes (Windows path fix)
        cleanPath = cleanPath.replace(/\\/g, '/');
        console.log('After normalizing slashes:', cleanPath);
        
        // Remove any leading slashes
        cleanPath = cleanPath.replace(/^\/+/, '');
        
        // Remove any uploads prefix (multiple variations)
        cleanPath = cleanPath.replace(/^uploads\/+/, '');
        cleanPath = cleanPath.replace(/^\/+uploads\/+/, '');
        cleanPath = cleanPath.replace(/^uploads\/uploads\/+/, ''); // Handle double uploads
        
        // Final safety check - ensure no uploads at the beginning
        while (cleanPath.startsWith('uploads/') || cleanPath.startsWith('/uploads/')) {
          cleanPath = cleanPath.replace(/^\/*(uploads\/)+/, '');
        }
        
        console.log('Cleaned path:', cleanPath);
        
        // Specific fix for the exact error we're seeing
        if (cleanPath.includes('uploads/')) {
          cleanPath = cleanPath.replace(/.*uploads\//, ''); // Remove everything up to and including 'uploads/'
          console.log('Further cleaned path (removed all uploads):', cleanPath);
        }
        
        // Ensure we don't have double uploads in the URL
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        fileUrl = `${baseUrl}/uploads/${cleanPath}`;
        console.log('Final constructed file URL:', fileUrl);
      }
      window.open(fileUrl, '_blank');
    } else {
      // Show record details in a modal or alert
      toast.info(`Record: ${record.title}\nDate: ${new Date(record.date || record.createdAt).toLocaleDateString()}\nDescription: ${record.description || 'No description available'}`);
    }
  };

  const handleDownloadRecord = async (record) => {
    try {
      const filePath = record.data?.filePath || record.filePath;
      const fileName = record.data?.filename || record.data?.originalName || record.title;
      
      console.log('=== DEBUGGING DOWNLOAD RECORD ===');
      console.log('Full record object:', record);
      console.log('record.data:', record.data);
      console.log('Final filePath value:', filePath);
      console.log('Final fileName value:', fileName);
      
      if (filePath) {
        let downloadUrl;
        
        if (filePath.startsWith('http')) {
          downloadUrl = filePath;
          console.log('Using HTTP URL directly for download:', downloadUrl);
        } else {
          // For local files, construct the URL using the static file server
          console.log('Processing local file path for download...');
          console.log('Original filePath:', filePath);
          
          // Handle various path formats more robustly - aggressive cleaning
          let cleanPath = filePath;
          
          // First, normalize backslashes to forward slashes (Windows path fix)
          cleanPath = cleanPath.replace(/\\/g, '/');
          console.log('After normalizing slashes for download:', cleanPath);
          
          // Remove any leading slashes
          cleanPath = cleanPath.replace(/^\/+/, '');
          
          // Remove any uploads prefix (multiple variations)
          cleanPath = cleanPath.replace(/^uploads\/+/, '');
          cleanPath = cleanPath.replace(/^\/+uploads\/+/, '');
          cleanPath = cleanPath.replace(/^uploads\/uploads\/+/, ''); // Handle double uploads
          
          // Final safety check - ensure no uploads at the beginning
          while (cleanPath.startsWith('uploads/') || cleanPath.startsWith('/uploads/')) {
            cleanPath = cleanPath.replace(/^\/*(uploads\/)+/, '');
          }
          
          console.log('Cleaned path for download:', cleanPath);
          
          // Specific fix for the exact error we're seeing
          if (cleanPath.includes('uploads/')) {
            cleanPath = cleanPath.replace(/.*uploads\//, ''); // Remove everything up to and including 'uploads/'
            console.log('Further cleaned download path (removed all uploads):', cleanPath);
          }
          
          // Ensure we don't have double uploads in the URL
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          downloadUrl = `${baseUrl}/uploads/${cleanPath}`;
          console.log('Final constructed download URL:', downloadUrl);
        }
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'medical-record';
        link.target = '_blank'; // Add this to handle CORS issues
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Download started');
      } else {
        toast.error('No file available for download');
      }
    } catch (error) {
      console.error('Error downloading record:', error);
      toast.error('Failed to download record');
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
                      {vitals.length > 0 && vitals[0].data ? (
                        <div className="space-y-4">
                          {vitals[0].data.bloodPressure && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Blood Pressure</span>
                              <span className="font-medium">
                                {vitals[0].data.bloodPressure.systolic}/{vitals[0].data.bloodPressure.diastolic} mmHg
                              </span>
                            </div>
                          )}
                          {vitals[0].data.heartRate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Heart Rate</span>
                              <span className="font-medium">{vitals[0].data.heartRate} bpm</span>
                            </div>
                          )}
                          {vitals[0].data.temperature && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Temperature</span>
                              <span className="font-medium">{vitals[0].data.temperature}°F</span>
                            </div>
                          )}
                          {vitals[0].data.weight && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weight</span>
                              <span className="font-medium">{vitals[0].data.weight} lbs</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-4">
                            Last updated: {new Date(vitals[0].date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <HeartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No vital signs recorded yet</p>
                          <button 
                            onClick={() => setShowVitalsModal(true)}
                            className="mt-2 text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Add your first vital signs
                          </button>
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
                          {records.length > 0 ? records.map((record) => (
                            <tr key={record._id || record.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-600 capitalize">{record.type}</td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">{record.title || 'Medical Document'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {record.addedBy?.name || record.provider || 'Self-uploaded'}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(record.date || record.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status || 'active')}`}>
                                  {record.status || 'active'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleViewRecord(record)}
                                    className="text-teal-600 hover:text-teal-700 p-1 rounded hover:bg-teal-50"
                                    title="View record"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadRecord(record)}
                                    className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50"
                                    title="Download record"
                                  >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteConfirm(record, 'document')}
                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                    title="Delete record"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-gray-500">
                                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No medical records found</p>
                                <button 
                                  onClick={() => setShowUploadModal(true)}
                                  className="mt-2 text-teal-600 hover:text-teal-700 font-medium"
                                >
                                  Upload your first record
                                </button>
                              </td>
                            </tr>
                          )}
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
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitals.length > 0 ? vitals.map((vital, index) => (
                            <tr key={vital._id || index} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {new Date(vital.date || vital.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {vital.data?.bloodPressure ? 
                                  `${vital.data.bloodPressure.systolic}/${vital.data.bloodPressure.diastolic}` : 
                                  'N/A'
                                } mmHg
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {vital.data?.heartRate || 'N/A'} bpm
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {vital.data?.temperature || 'N/A'}°F
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {vital.data?.weight || 'N/A'} lbs
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleEditVital(vital)}
                                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                    title="Edit vital signs"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteConfirm(vital, 'vital')}
                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                    title="Delete vital signs"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-gray-500">
                                <HeartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No vital signs recorded</p>
                                <button 
                                  onClick={() => setShowVitalsModal(true)}
                                  className="mt-2 text-teal-600 hover:text-teal-700 font-medium"
                                >
                                  Add your first vital signs
                                </button>
                              </td>
                            </tr>
                          )}
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
                      {medications.length > 0 ? medications.map((medication) => (
                        <div key={medication._id || medication.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {medication.data?.name || medication.name || 'Unknown Medication'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {medication.data?.dosage || medication.dosage || 'N/A'} • {medication.data?.frequency || medication.frequency || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Prescribed by {medication.data?.prescribedBy || medication.prescribedBy || medication.addedBy?.name || 'Doctor'} on {new Date(medication.date || medication.createdAt).toLocaleDateString()}
                              </p>
                              {medication.data?.instructions && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Instructions:</span> {medication.data.instructions}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medication.status || 'active')}`}>
                                {medication.status || 'active'}
                              </span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleEditMedication(medication)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                  title="Edit medication"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteConfirm(medication, 'medication')}
                                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                  title="Delete medication"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <HeartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 mb-2">No medications recorded</p>
                          <button 
                            onClick={() => setShowMedicationModal(true)}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Add your first medication
                          </button>
                        </div>
                      )}
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
                      {allergies.length > 0 ? allergies.map((allergy) => (
                        <div key={allergy._id || allergy.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {allergy.data?.allergen || allergy.allergen || 'Unknown Allergen'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reaction:</span> {allergy.data?.reaction || allergy.reaction || 'Not specified'}
                              </p>
                              {allergy.data?.notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <span className="font-medium">Notes:</span> {allergy.data.notes}
                                </p>
                              )}
                              <p className="text-sm text-gray-400 mt-1">
                                Recorded on {new Date(allergy.date || allergy.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(allergy.data?.severity || allergy.severity || 'moderate')}`}>
                                {allergy.data?.severity || allergy.severity || 'moderate'}
                              </span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleEditAllergy(allergy)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                  title="Edit allergy"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteConfirm(allergy, 'allergy')}
                                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                  title="Delete allergy"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 mb-2">No allergies recorded</p>
                          <button 
                            onClick={() => setShowAllergyModal(true)}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Add allergy information
                          </button>
                        </div>
                      )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{editingVital ? 'Edit Vital Signs' : 'Add Vital Signs'}</h3>
                <button onClick={() => {
                  setShowVitalsModal(false);
                  setEditingVital(null);
                }}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleVitalsSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-6">
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
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowVitalsModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (editingVital ? 'Updating...' : 'Adding...') : (editingVital ? 'Update Vitals' : 'Add Vitals')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medication Modal */}
        {showMedicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{editingMedication ? 'Edit Medication' : 'Add Medication'}</h3>
                <button onClick={() => {
                  setShowMedicationModal(false);
                  setEditingMedication(null);
                }}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleMedicationSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-6">
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
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowMedicationModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (editingMedication ? 'Updating...' : 'Adding...') : (editingMedication ? 'Update Medication' : 'Add Medication')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Allergy Modal */}
        {showAllergyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{editingAllergy ? 'Edit Allergy' : 'Add Allergy'}</h3>
                <button onClick={() => {
                  setShowAllergyModal(false);
                  setEditingAllergy(null);
                }}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleAllergySubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-6">
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
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowAllergyModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (editingAllergy ? 'Updating...' : 'Adding...') : (editingAllergy ? 'Update Allergy' : 'Add Allergy')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {deleteTarget.type === 'document' ? 'medical record' : deleteTarget.type}? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRecord}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default HealthRecords;
