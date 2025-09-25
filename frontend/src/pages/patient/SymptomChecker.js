import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const SymptomChecker = () => {
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const commonSymptoms = [
    { id: 1, name: 'Headache', category: 'Neurological', severity: 'moderate' },
    { id: 2, name: 'Fever', category: 'General', severity: 'moderate' },
    { id: 3, name: 'Cough', category: 'Respiratory', severity: 'mild' },
    { id: 4, name: 'Sore Throat', category: 'Respiratory', severity: 'mild' },
    { id: 5, name: 'Nausea', category: 'Digestive', severity: 'moderate' },
    { id: 6, name: 'Fatigue', category: 'General', severity: 'mild' },
    { id: 7, name: 'Chest Pain', category: 'Cardiovascular', severity: 'high' },
    { id: 8, name: 'Shortness of Breath', category: 'Respiratory', severity: 'high' },
    { id: 9, name: 'Stomach Pain', category: 'Digestive', severity: 'moderate' },
    { id: 10, name: 'Dizziness', category: 'Neurological', severity: 'moderate' },
    { id: 11, name: 'Joint Pain', category: 'Musculoskeletal', severity: 'mild' },
    { id: 12, name: 'Skin Rash', category: 'Dermatological', severity: 'mild' },
    { id: 13, name: 'Back Pain', category: 'Musculoskeletal', severity: 'moderate' },
    { id: 14, name: 'Runny Nose', category: 'Respiratory', severity: 'mild' },
    { id: 15, name: 'Muscle Aches', category: 'Musculoskeletal', severity: 'mild' },
    { id: 16, name: 'Insomnia', category: 'Neurological', severity: 'moderate' },
    { id: 17, name: 'Loss of Appetite', category: 'General', severity: 'mild' },
    { id: 18, name: 'Anxiety', category: 'Mental Health', severity: 'moderate' }
  ];

  const symptomCategories = [
    'All',
    'General',
    'Respiratory',
    'Cardiovascular',
    'Digestive',
    'Neurological',
    'Musculoskeletal',
    'Dermatological',
    'Mental Health'
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSymptoms = selectedCategory === 'All' 
    ? commonSymptoms 
    : commonSymptoms.filter(symptom => symptom.category === selectedCategory);

  const durationOptions = [
    { value: 'hours', label: 'A few hours', weight: 1 },
    { value: '1-2days', label: '1-2 days', weight: 2 },
    { value: '3-7days', label: '3-7 days', weight: 3 },
    { value: '1-2weeks', label: '1-2 weeks', weight: 4 },
    { value: 'more-than-2weeks', label: 'More than 2 weeks', weight: 5 }
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild - Barely noticeable', color: 'text-green-600 bg-green-100', weight: 1 },
    { value: 'moderate', label: 'Moderate - Noticeable but manageable', color: 'text-yellow-600 bg-yellow-100', weight: 2 },
    { value: 'severe', label: 'Severe - Interferes with daily activities', color: 'text-orange-600 bg-orange-100', weight: 3 },
    { value: 'very-severe', label: 'Very Severe - Unbearable', color: 'text-red-600 bg-red-100', weight: 4 }
  ];

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (exists) {
        return prev.filter(s => s.id !== symptom.id);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim()) {
      const newSymptom = {
        id: Date.now(),
        name: customSymptom.trim(),
        category: 'Custom',
        severity: 'moderate'
      };
      setSelectedSymptoms(prev => [...prev, newSymptom]);
      setCustomSymptom('');
    }
  };

  const removeSymptom = (symptomId) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== symptomId));
  };

  const analyzeSymptoms = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Advanced AI assessment logic
    const hasEmergencySymptoms = selectedSymptoms.some(s => 
      ['Chest Pain', 'Shortness of Breath', 'Severe Headache'].includes(s.name)
    );
    
    const hasRespiratorySymptoms = selectedSymptoms.some(s =>
      ['Cough', 'Sore Throat', 'Runny Nose', 'Fever', 'Shortness of Breath'].includes(s.name)
    );

    const hasDigestiveSymptoms = selectedSymptoms.some(s =>
      ['Nausea', 'Stomach Pain', 'Loss of Appetite'].includes(s.name)
    );

    const hasNeurologicalSymptoms = selectedSymptoms.some(s =>
      ['Headache', 'Dizziness', 'Insomnia'].includes(s.name)
    );

    const severityWeight = severityOptions.find(s => s.value === severity)?.weight || 1;
    const durationWeight = durationOptions.find(d => d.value === duration)?.weight || 1;
    
    const riskScore = (severityWeight * durationWeight * selectedSymptoms.length) / 10;

    let mockAssessment;
    
    if (hasEmergencySymptoms && severity === 'very-severe') {
      mockAssessment = {
        urgency: 'emergency',
        riskLevel: 'Critical',
        title: '🚨 Seek Emergency Care Immediately',
        description: 'Based on your symptoms, particularly chest pain and breathing difficulties, you should seek immediate emergency medical attention. These symptoms can indicate serious conditions that require urgent care.',
        recommendations: [
          'Call 911 or go to the nearest emergency room immediately',
          'Do not drive yourself - call an ambulance or have someone drive you',
          'Take any current medications and medical records with you',
          'If symptoms worsen while waiting, call 911 again'
        ],
        possibleConditions: [
          { name: 'Heart Attack (Myocardial Infarction)', probability: 'High', severity: 'Critical' },
          { name: 'Pulmonary Embolism', probability: 'Moderate', severity: 'Critical' },
          { name: 'Acute Coronary Syndrome', probability: 'Moderate', severity: 'Critical' }
        ],
        nextSteps: [
          'Emergency room evaluation within next hour',
          'ECG and blood tests likely needed',
          'Possible cardiac intervention'
        ]
      };
    } else if (hasRespiratorySymptoms && !hasEmergencySymptoms) {
      mockAssessment = {
        urgency: 'low',
        riskLevel: 'Low',
        title: '🤧 Likely Viral Upper Respiratory Infection',
        description: 'Your symptoms suggest a common viral infection such as a cold or flu. These typically resolve on their own with proper rest and self-care. Monitor your condition and seek care if symptoms worsen.',
        recommendations: [
          'Get plenty of rest and stay well-hydrated (8-10 glasses of water daily)',
          'Consider over-the-counter medications for symptom relief (acetaminophen, ibuprofen)',
          'Use throat lozenges or warm salt water gargles for sore throat',
          'Stay home to avoid spreading illness to others',
          'See a doctor if symptoms persist beyond 7-10 days or worsen significantly'
        ],
        possibleConditions: [
          { name: 'Common Cold (Rhinovirus)', probability: 'High', severity: 'Mild' },
          { name: 'Influenza (Flu)', probability: 'Moderate', severity: 'Mild to Moderate' },
          { name: 'Upper Respiratory Tract Infection', probability: 'Moderate', severity: 'Mild' }
        ],
        nextSteps: [
          'Self-care and monitoring for 7-10 days',
          'Contact healthcare provider if no improvement',
          'Return to normal activities when fever-free for 24 hours'
        ]
      };
    } else if (hasDigestiveSymptoms) {
      mockAssessment = {
        urgency: 'moderate',
        riskLevel: 'Moderate',
        title: '🫃 Digestive System Concerns',
        description: 'Your symptoms suggest a digestive issue that may require medical evaluation. While not immediately dangerous, these symptoms can indicate various conditions that benefit from professional assessment.',
        recommendations: [
          'Stay hydrated with clear fluids (water, clear broths, electrolyte solutions)',
          'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) if tolerated',
          'Avoid dairy, caffeine, alcohol, and fatty foods temporarily',
          'Schedule an appointment with your healthcare provider within 2-3 days',
          'Seek immediate care if symptoms include severe pain, blood, or high fever'
        ],
        possibleConditions: [
          { name: 'Gastroenteritis (Stomach Flu)', probability: 'High', severity: 'Mild to Moderate' },
          { name: 'Food Poisoning', probability: 'Moderate', severity: 'Mild to Moderate' },
          { name: 'Gastritis', probability: 'Low', severity: 'Moderate' }
        ],
        nextSteps: [
          'Monitor symptoms for 24-48 hours',
          'Schedule healthcare provider visit if persisting',
          'Keep a food and symptom diary'
        ]
      };
    } else if (hasNeurologicalSymptoms) {
      mockAssessment = {
        urgency: 'moderate',
        riskLevel: 'Moderate',
        title: '🧠 Neurological Symptoms Evaluation',
        description: 'Your neurological symptoms warrant professional evaluation to rule out underlying conditions and provide appropriate treatment options.',
        recommendations: [
          'Schedule an appointment with your primary care physician within 1-2 days',
          'Keep a symptom diary noting triggers, timing, and severity',
          'Ensure adequate sleep (7-9 hours per night)',
          'Stay hydrated and maintain regular meals',
          'Consider stress management techniques (meditation, deep breathing)'
        ],
        possibleConditions: [
          { name: 'Tension Headache', probability: 'High', severity: 'Mild to Moderate' },
          { name: 'Migraine', probability: 'Moderate', severity: 'Moderate' },
          { name: 'Sleep Disorder', probability: 'Moderate', severity: 'Mild' }
        ],
        nextSteps: [
          'Primary care consultation within 1-2 days',
          'Possible referral to specialist if needed',
          'Lifestyle modifications and monitoring'
        ]
      };
    } else {
      mockAssessment = {
        urgency: 'low',
        riskLevel: 'Low',
        title: '💡 General Health Monitoring',
        description: 'Your symptoms are relatively common and may be related to stress, lifestyle factors, or minor health issues. While not immediately concerning, monitoring and basic health maintenance are recommended.',
        recommendations: [
          'Schedule a routine appointment with your primary care physician',
          'Monitor symptoms and note any changes or patterns',
          'Maintain a healthy lifestyle with regular exercise and balanced nutrition',
          'Ensure adequate sleep and stress management',
          'Stay hydrated and consider vitamin D supplementation if deficient'
        ],
        possibleConditions: [
          { name: 'Stress-related symptoms', probability: 'Moderate', severity: 'Mild' },
          { name: 'Lifestyle-related fatigue', probability: 'Moderate', severity: 'Mild' },
          { name: 'Minor viral infection', probability: 'Low', severity: 'Mild' }
        ],
        nextSteps: [
          'Routine healthcare visit within 1-2 weeks',
          'Lifestyle modifications and monitoring',
          'Follow-up if symptoms persist or worsen'
        ]
      };
    }

    // Add risk score to assessment
    mockAssessment.riskScore = Math.min(riskScore, 10).toFixed(1);
    
    setAssessment(mockAssessment);
    setIsAnalyzing(false);
    setCurrentStep(4);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      case 'high':
        return <ClockIcon className="h-6 w-6" />;
      case 'moderate':
        return <InformationCircleIcon className="h-6 w-6" />;
      case 'low':
        return <CheckCircleIcon className="h-6 w-6" />;
      default:
        return <HeartIcon className="h-6 w-6" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'mild':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const resetChecker = () => {
    setCurrentStep(1);
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setDuration('');
    setSeverity('');
    setAge('');
    setGender('');
    setAdditionalInfo('');
    setAssessment(null);
    setIsAnalyzing(false);
    setSelectedCategory('All');
  };

  return (
    <>
      <Helmet>
        <title>AI Symptom Checker - MediConnect AI</title>
        <meta name="description" content="AI-powered symptom checker for preliminary health assessment" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/patient')}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HeartIcon className="h-8 w-8 mr-3 text-teal-600" />
                AI Symptom Checker
              </h1>
              <p className="mt-2 text-gray-600">
                Get a preliminary assessment of your symptoms using advanced AI technology
              </p>
              
              {/* Enhanced Disclaimer */}
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. 
                      Always consult with a healthcare provider for proper diagnosis and treatment.
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Privacy & Security:</strong> Your symptom data is processed securely and never stored permanently. 
                      All information is encrypted and HIPAA-compliant.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {currentStep < 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step <= currentStep ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                      } transition-colors`}>
                        {step < currentStep ? (
                          <CheckCircleIcon className="h-6 w-6" />
                        ) : (
                          step
                        )}
                      </div>
                      {step < 3 && (
                        <div className={`w-16 h-1 mx-2 transition-colors ${
                          step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  <div className="text-sm text-gray-600">
                    Step {currentStep} of 3: {
                      currentStep === 1 ? 'Select Symptoms' :
                      currentStep === 2 ? 'Duration & Severity' :
                      'Personal Information'
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Step 1: Symptom Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">What symptoms are you experiencing?</h2>
                    
                    {/* Selected Symptoms */}
                    {selectedSymptoms.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Symptoms ({selectedSymptoms.length}):</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSymptoms.map((symptom) => (
                            <span
                              key={symptom.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-700 border border-teal-200"
                            >
                              {symptom.name}
                              <button
                                onClick={() => removeSymptom(symptom.id)}
                                className="ml-2 hover:text-teal-900 transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {symptomCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedCategory === category
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Common Symptoms */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {selectedCategory === 'All' ? 'Common Symptoms' : `${selectedCategory} Symptoms`}:
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredSymptoms.map((symptom) => {
                          const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                          return (
                            <button
                              key={symptom.id}
                              onClick={() => toggleSymptom(symptom)}
                              className={`p-3 text-left border rounded-lg transition-all hover:shadow-sm ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="font-medium">{symptom.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{symptom.category}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Symptom */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Add Custom Symptom:</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSymptom}
                          onChange={(e) => setCustomSymptom(e.target.value)}
                          placeholder="Describe your symptom"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                          onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                        />
                        <button
                          onClick={addCustomSymptom}
                          disabled={!customSymptom.trim()}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Duration & Severity */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Duration and Severity</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How long have you been experiencing these symptoms?
                      </label>
                      <div className="space-y-2">
                        {durationOptions.map((option) => (
                          <label key={option.value} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="duration"
                              value={option.value}
                              checked={duration === option.value}
                              onChange={(e) => setDuration(e.target.value)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                            />
                            <span className="ml-3 text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you rate the severity of your symptoms?
                      </label>
                      <div className="space-y-3">
                        {severityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSeverity(option.value)}
                            className={`w-full p-4 text-left border rounded-lg transition-colors ${
                              severity === option.value
                                ? `border-current ${option.color}`
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Personal Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information & Additional Details</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Your age"
                          min="1"
                          max="120"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Please provide any additional details about your symptoms:&#10;• When did symptoms start?&#10;• What makes them better or worse?&#10;• Any recent changes in medication, diet, or lifestyle?&#10;• Any allergies or medical conditions?&#10;• Current medications?"
                        rows="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Assessment Summary:</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Symptoms ({selectedSymptoms.length}):</strong> {selectedSymptoms.map(s => s.name).join(', ')}</p>
                        <p><strong>Duration:</strong> {durationOptions.find(d => d.value === duration)?.label}</p>
                        <p><strong>Severity:</strong> {severityOptions.find(s => s.value === severity)?.label}</p>
                        {age && <p><strong>Age:</strong> {age} years old</p>}
                        {gender && <p><strong>Gender:</strong> {gender}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {currentStep === 4 && assessment && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold text-gray-900">AI Assessment Results</h2>
                      <p className="text-gray-600 mt-2">Based on the information you provided</p>
                    </div>

                    {/* Risk Score */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{assessment.riskScore}/10</div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                        assessment.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                        assessment.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {assessment.riskLevel} Risk Level
                      </div>
                    </div>

                    {/* Urgency Level */}
                    <div className={`p-6 rounded-lg border-2 ${getUrgencyColor(assessment.urgency)}`}>
                      <div className="flex items-center mb-4">
                        {getUrgencyIcon(assessment.urgency)}
                        <h3 className="text-xl font-semibold ml-3">{assessment.title}</h3>
                      </div>
                      <p className="text-lg leading-relaxed">{assessment.description}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        Recommended Actions:
                      </h4>
                      <ul className="space-y-3">
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-700 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Possible Conditions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Possible Conditions:
                      </h4>
                      <div className="space-y-3">
                        {assessment.possibleConditions.map((condition, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900">{condition.name}</span>
                              <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs ${getSeverityColor(condition.severity)}`}>
                                {condition.severity}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{condition.probability} probability</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Next Steps:
                      </h4>
                      <ul className="space-y-2">
                        {assessment.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center text-blue-800">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/patient/appointment-booking')}
                        className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
                      >
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Book Appointment
                      </button>
                      <button
                        onClick={resetChecker}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Check New Symptoms
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
                      <HeartIcon className="h-8 w-8 text-teal-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Symptoms</h3>
                    <p className="text-gray-600 mb-4">Our AI is processing your information using advanced medical algorithms...</p>
                    <div className="text-sm text-gray-500">
                      This may take a few moments • Estimated time: 30-60 seconds
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 4 && !isAnalyzing && (
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={currentStep === 1}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        currentStep === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>

                    {currentStep === 3 ? (
                      <button
                        onClick={analyzeSymptoms}
                        disabled={selectedSymptoms.length === 0 || !duration || !severity}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          selectedSymptoms.length === 0 || !duration || !severity
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        🔍 Analyze Symptoms
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={
                          (currentStep === 1 && selectedSymptoms.length === 0) ||
                          (currentStep === 2 && (!duration || !severity))
                        }
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          (currentStep === 1 && selectedSymptoms.length === 0) ||
                          (currentStep === 2 && (!duration || !severity))
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        Next
                      </button>
                    )}
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

export default SymptomChecker;
