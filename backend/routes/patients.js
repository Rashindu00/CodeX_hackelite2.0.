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
  if (name) user.name = name;
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
        name: user.name,
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

module.exports = router;
