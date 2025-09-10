const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
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
    const existingAppointment = await query(`
      SELECT id FROM appointments 
      WHERE provider_id = $1 AND appointment_date = $2 AND appointment_time = $3
      AND status IN ('scheduled', 'confirmed')
    `, [provider_id, appointment_date, appointment_time]);

    if (existingAppointment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'This time slot is already booked' }
      });
    }

    // Get provider's consultation fee
    const provider = await query(`
      SELECT consultation_fee FROM healthcare_providers WHERE id = $1
    `, [provider_id]);

    if (provider.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Provider not found' }
      });
    }

    const consultationFee = provider.rows[0].consultation_fee || 0;

    const result = await query(`
      INSERT INTO appointments 
      (patient_id, provider_id, appointment_date, appointment_time, chief_complaint, type, consultation_fee)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [patientId, provider_id, appointment_date, appointment_time, chief_complaint, type, consultationFee]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment: result.rows[0]
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

    let whereClause = 'WHERE a.id = $1';
    const queryParams = [appointmentId];

    // Patients can only see their own appointments
    if (userRole === 'patient') {
      whereClause += ' AND a.patient_id = $2';
      queryParams.push(userId);
    } else if (userRole === 'provider') {
      whereClause += ' AND a.provider_id = $2';
      queryParams.push(userId);
    }

    const appointment = await query(`
      SELECT a.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             hp.first_name as provider_first_name, hp.last_name as provider_last_name,
             hp.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN healthcare_providers hp ON a.provider_id = hp.id
      ${whereClause}
    `, queryParams);

    if (appointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    res.json({
      success: true,
      data: {
        appointment: appointment.rows[0]
      }
    });
  })
);

module.exports = router;
