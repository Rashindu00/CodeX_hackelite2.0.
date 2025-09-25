import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    specialization: '',
    provider: '',
    date: '',
    time: '',
    appointmentType: '',
    reason: '',
    notes: ''
  });

  // Mock data for providers
  const [providers, setProviders] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const specializations = [
    { value: 'general-practice', label: 'General Practice' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' }
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Regular Consultation' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'video', label: 'Video Consultation' }
  ];

  // Mock providers data
  useEffect(() => {
    if (appointmentData.specialization) {
      const mockProviders = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          specialization: 'cardiology',
          rating: 4.9,
          experience: '15 years',
          image: '/api/placeholder/64/64'
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          specialization: 'general-practice',
          rating: 4.8,
          experience: '12 years',
          image: '/api/placeholder/64/64'
        },
        {
          id: 3,
          name: 'Dr. Emily Davis',
          specialization: 'dermatology',
          rating: 4.9,
          experience: '10 years',
          image: '/api/placeholder/64/64'
        }
      ];
      setProviders(mockProviders.filter(p => p.specialization === appointmentData.specialization));
    }
  }, [appointmentData.specialization]);

  // Generate available time slots
  useEffect(() => {
    if (appointmentData.date) {
      const slots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];
      setAvailableSlots(slots);
    }
  }, [appointmentData.date]);

  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would submit to your API
    console.log('Booking appointment:', appointmentData);
    alert('Appointment booked successfully! You will receive a confirmation email.');
    navigate('/patient');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <>
      <Helmet>
        <title>Book Appointment - MediConnect AI</title>
        <meta name="description" content="Book an appointment with healthcare providers" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/patient')}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarDaysIcon className="h-8 w-8 mr-3 text-teal-600" />
                Book Appointment
              </h1>
              <p className="mt-2 text-gray-600">
                Schedule your consultation with our healthcare providers
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step <= currentStep ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <div className="text-sm text-gray-600">
                  Step {currentStep} of 4: {
                    currentStep === 1 ? 'Select Specialization' :
                    currentStep === 2 ? 'Choose Provider' :
                    currentStep === 3 ? 'Select Date & Time' :
                    'Confirm Details'
                  }
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Step 1: Specialization & Type */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Select Specialization</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Specialization
                      </label>
                      <select
                        value={appointmentData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec.value} value={spec.value}>
                            {spec.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {appointmentTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => handleInputChange('appointmentType', type.value)}
                            className={`p-4 text-left border rounded-lg transition-colors ${
                              appointmentData.appointmentType === type.value
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Provider Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Choose Healthcare Provider</h2>
                    
                    {providers.length > 0 ? (
                      <div className="space-y-4">
                        {providers.map((provider) => (
                          <button
                            key={provider.id}
                            onClick={() => handleInputChange('provider', provider.id)}
                            className={`w-full p-4 text-left border rounded-lg transition-colors ${
                              appointmentData.provider === provider.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                                <p className="text-sm text-gray-600">{provider.experience} experience</p>
                                <div className="flex items-center mt-1">
                                  <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-sm text-gray-600">{provider.rating} rating</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Please select a specialization first
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Date & Time */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={appointmentData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {appointmentData.date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Time Slots
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => handleInputChange('time', slot)}
                              className={`p-3 text-center border rounded-lg transition-colors ${
                                appointmentData.time === slot
                                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <ClockIcon className="h-4 w-4 mx-auto mb-1" />
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit
                      </label>
                      <textarea
                        value={appointmentData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        placeholder="Please describe your symptoms or reason for the appointment"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Confirm Appointment</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Specialization:</span>
                        <span>{specializations.find(s => s.value === appointmentData.specialization)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Provider:</span>
                        <span>{providers.find(p => p.id === appointmentData.provider)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{appointmentData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>{appointmentData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span>{appointmentTypes.find(t => t.value === appointmentData.appointmentType)?.label}</span>
                      </div>
                      {appointmentData.reason && (
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="mt-1 text-gray-600">{appointmentData.reason}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={appointmentData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional information for the provider"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      currentStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {currentStep === 4 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (!appointmentData.specialization || !appointmentData.appointmentType)) ||
                        (currentStep === 2 && !appointmentData.provider) ||
                        (currentStep === 3 && (!appointmentData.date || !appointmentData.time || !appointmentData.reason))
                      }
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        (currentStep === 1 && (!appointmentData.specialization || !appointmentData.appointmentType)) ||
                        (currentStep === 2 && !appointmentData.provider) ||
                        (currentStep === 3 && (!appointmentData.date || !appointmentData.time || !appointmentData.reason))
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AppointmentBooking;
