const express = require('express');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Patient = require('../models/Patient');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   PUT /api/patients/profile
// @desc    Update patient profile information
// @access  Private (Patient only)
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Please provide a valid date'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', errors: formatValidationErrors(errors) }
    });
  }

  // Check if user is a patient
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Patient role required.' }
    });
  }

  const { name, phone, dateOfBirth, gender, bloodType } = req.body;

  // Update user basic info
  if (name) {
    // Parse name into firstName and lastName
    const nameParts = name.trim().split(' ');
    user.firstName = nameParts[0] || '';
    user.lastName = nameParts.slice(1).join(' ') || '';
  }
  if (phone) user.phone = phone;
  await user.save();

  // Find or create patient record
  let patient = await Patient.findOne({ user: req.user.id });
  if (!patient) {
    patient = new Patient({
      user: req.user.id,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
      gender: gender || 'other'
    });
  } else {
    // Update patient info
    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
    if (gender) patient.gender = gender;
    if (bloodType) patient.bloodType = bloodType;
  }

  await patient.save();

  logger.info('Patient profile updated', { userId: req.user.id, patientId: patient._id });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.fullName, // Use virtual fullName field
        email: user.email,
        phone: user.phone
      },
      patient: patient.toObject()
    }
  });
}));

// @route   PUT /api/patients/address
// @desc    Update patient address
// @access  Private (Patient only)
router.put('/address', [
  authenticateToken,
  body('street').optional().trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('city').optional().trim().isLength({ min: 1 }).withMessage('City is required'),
  body('state').optional().trim().isLength({ min: 1 }).withMessage('State is required'),
  body('zipCode').optional().trim().isLength({ min: 3 }).withMessage('ZIP code must be at least 3 characters'),
  body('country').optional().trim().isLength({ min: 1 }).withMessage('Country is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', errors: formatValidationErrors(errors) }
    });
  }

  // Check if user is a patient
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Patient role required.' }
    });
  }

  const { street, city, state, zipCode, country } = req.body;

  // Find or create patient record
  let patient = await Patient.findOne({ user: req.user.id });
  if (!patient) {
    patient = new Patient({
      user: req.user.id,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      address: { street, city, state, zipCode, country }
    });
  } else {
    // Update address
    patient.address = {
      street: street || patient.address?.street || '',
      city: city || patient.address?.city || '',
      state: state || patient.address?.state || '',
      zipCode: zipCode || patient.address?.zipCode || '',
      country: country || patient.address?.country || 'United States'
    };
  }

  await patient.save();

  logger.info('Patient address updated', { userId: req.user.id, patientId: patient._id });

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: {
      address: patient.address
    }
  });
}));

// @route   PUT /api/patients/emergency-contact
// @desc    Update patient emergency contact
// @access  Private (Patient only)
router.put('/emergency-contact', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Contact name must be at least 2 characters'),
  body('relationship').optional().isIn(['spouse', 'parent', 'sibling', 'child', 'friend', 'other']).withMessage('Invalid relationship'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', errors: formatValidationErrors(errors) }
    });
  }

  // Check if user is a patient
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Patient role required.' }
    });
  }

  const { name, relationship, phone, email } = req.body;

  // Find or create patient record
  let patient = await Patient.findOne({ user: req.user.id });
  if (!patient) {
    patient = new Patient({
      user: req.user.id,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      emergencyContact: { name, relationship, phone, email }
    });
  } else {
    // Update emergency contact
    patient.emergencyContact = {
      name: name || patient.emergencyContact?.name || '',
      relationship: relationship || patient.emergencyContact?.relationship || '',
      phone: phone || patient.emergencyContact?.phone || '',
      email: email || patient.emergencyContact?.email || ''
    };
  }

  await patient.save();

  logger.info('Patient emergency contact updated', { userId: req.user.id, patientId: patient._id });

  res.json({
    success: true,
    message: 'Emergency contact updated successfully',
    data: {
      emergencyContact: patient.emergencyContact
    }
  });
}));

// @route   PUT /api/patients/notifications
// @desc    Update patient notification preferences
// @access  Private (Patient only)
router.put('/notifications', [
  authenticateToken,
  body('appointmentReminders').optional().isBoolean().withMessage('appointmentReminders must be a boolean'),
  body('medicationReminders').optional().isBoolean().withMessage('medicationReminders must be a boolean'),
  body('healthTips').optional().isBoolean().withMessage('healthTips must be a boolean'),
  body('systemUpdates').optional().isBoolean().withMessage('systemUpdates must be a boolean'),
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be a boolean'),
  body('smsNotifications').optional().isBoolean().withMessage('smsNotifications must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', errors: formatValidationErrors(errors) }
    });
  }

  // Check if user is a patient
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Patient role required.' }
    });
  }

  // For now, we'll just return success since notification preferences 
  // would typically be stored in a separate collection or user preferences
  logger.info('Patient notification preferences updated', { 
    userId: req.user.id, 
    preferences: req.body 
  });

  res.json({
    success: true,
    message: 'Notification preferences saved successfully',
    data: {
      preferences: req.body
    }
  });
}));

// @route   GET /api/patients/history
// @desc    Get patient's complete history (appointments, consultations, recommendations)
// @access  Private (Patient only)
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  // Get patient record
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  const Appointment = require('../models/Appointment');
  const Consultation = require('../models/Consultation');

  // Fetch appointment history
  const appointments = await Appointment.find({ 
    patient: patient._id 
  })
  .populate('provider', 'name specialization')
  .sort({ appointmentDate: -1 });

  // Fetch consultation history (if you have a Consultation model)
  let consultations = [];
  try {
    consultations = await Consultation.find({ 
      patient: patient._id 
    })
    .populate('provider', 'name specialization')
    .sort({ startedAt: -1 });
  } catch (error) {
    console.log('Consultation model not found, skipping consultations');
  }

  // Fetch recommendations (assuming they're stored in appointments or a separate model)
  const recommendations = [];
  
  // Check for recommendations in completed appointments
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  for (const appointment of completedAppointments) {
    if (appointment.recommendations && appointment.recommendations.length > 0) {
      appointment.recommendations.forEach(rec => {
        recommendations.push({
          _id: `${appointment._id}_${rec._id || Date.now()}`,
          title: rec.title || 'General Recommendation',
          description: rec.description,
          category: rec.category || 'General',
          medications: rec.medications || [],
          followUp: rec.followUp,
          priority: rec.priority || 'medium',
          provider: appointment.provider,
          createdAt: appointment.appointmentDate,
          appointmentId: appointment._id
        });
      });
    }
  }

  // Also check for general recommendations in patient record
  if (patient.recommendations && patient.recommendations.length > 0) {
    patient.recommendations.forEach(rec => {
      recommendations.push({
        _id: rec._id || `patient_${Date.now()}`,
        title: rec.title || 'General Recommendation',
        description: rec.description,
        category: rec.category || 'General',
        medications: rec.medications || [],
        followUp: rec.followUp,
        priority: rec.priority || 'medium',
        provider: rec.provider || { name: 'Healthcare Team' },
        createdAt: rec.createdAt || patient.createdAt
      });
    });
  }

  // Sort recommendations by date (newest first)
  recommendations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    appointments: appointments,
    consultations: consultations,
    recommendations: recommendations
  });
}));

// @route   GET /api/patients/appointment/:id
// @desc    Get specific appointment details with recommendations
// @access  Private (Patient only)
router.get('/appointment/:id', authenticateToken, asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  const Appointment = require('../models/Appointment');
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patient: patient._id
  }).populate('provider', 'name specialization email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.json({
    success: true,
    appointment
  });
}));

// @route   GET /api/patients/consultation/:id
// @desc    Get specific consultation details
// @access  Private (Patient only)
router.get('/consultation/:id', authenticateToken, asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  let consultation = null;
  try {
    const Consultation = require('../models/Consultation');
    consultation = await Consultation.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate('provider', 'name specialization email');
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: 'Consultation model not available'
    });
  }

  if (!consultation) {
    return res.status(404).json({
      success: false,
      message: 'Consultation not found'
    });
  }

  res.json({
    success: true,
    consultation
  });
}));

module.exports = router;
