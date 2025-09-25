const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const HealthcareProvider = require('../models/HealthcareProvider');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Private (Patient)
router.post('/book',
  authenticateToken,
  authorizeRoles('patient'),
  [
    body('provider_id').isUUID().withMessage('Valid provider ID is required'),
    body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
    body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required'),
    body('chief_complaint').trim().isLength({ min: 10, max: 500 }).withMessage('Chief complaint must be between 10 and 500 characters')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: formatValidationErrors(errors.array())
        }
      });
    }

    const patientId = req.user.id;
    const { provider_id, appointment_date, appointment_time, chief_complaint, type = 'consultation' } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      provider: provider_id,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: { message: 'This time slot is already booked' }
      });
    }

    // Get provider's consultation fee
    const provider = await HealthcareProvider.findById(provider_id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { message: 'Provider not found' }
      });
    }

    const consultationFee = provider.consultationFee || 0;

    const appointment = new Appointment({
      patient: patientId,
      provider: provider_id,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      chiefComplaint: chief_complaint,
      type,
      consultationFee
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment
      }
    });
  })
);

// @route   GET /api/appointments/:id
// @desc    Get appointment details
// @access  Private
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { _id: appointmentId };

    // Patients can only see their own appointments
    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'provider') {
      query.provider = userId;
    }

    const appointment = await Appointment.findOne(query)
      .populate('patient', 'firstName lastName')
      .populate('provider', 'firstName lastName specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    });
  })
);

module.exports = router;
