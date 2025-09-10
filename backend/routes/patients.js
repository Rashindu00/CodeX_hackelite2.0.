const express = require('express');
const { body, validationResult, query: queryParam } = require('express-validator');

const { query } = require('../config/database');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken, authorizeRoles, authorizeOwnership } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/patients/dashboard/:id
// @desc    Get patient dashboard data
// @access  Private (Patient or Provider/Admin)
router.get('/dashboard/:id', 
  authenticateToken, 
  authorizeOwnership('id'),
  asyncHandler(async (req, res) => {
    const patientId = req.params.id;

    // Get patient basic info
    const patientInfo = await query(`
      SELECT p.*, u.email, u.email_verified 
      FROM patients p 
      JOIN users u ON p.id = u.id 
      WHERE p.id = $1
    `, [patientId]);

    if (patientInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient not found' }
      });
    }

    // Get upcoming appointments
    const upcomingAppointments = await query(`
      SELECT a.*, hp.first_name as provider_first_name, hp.last_name as provider_last_name,
             hp.specialization
      FROM appointments a
      JOIN healthcare_providers hp ON a.provider_id = hp.id
      WHERE a.patient_id = $1 
        AND a.appointment_date >= CURRENT_DATE
        AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date, a.appointment_time
      LIMIT 5
    `, [patientId]);

    // Get recent health records
    const recentHealthRecords = await query(`
      SELECT hr.*, hp.first_name as provider_first_name, hp.last_name as provider_last_name
      FROM health_records hr
      LEFT JOIN healthcare_providers hp ON hr.provider_id = hp.id
      WHERE hr.patient_id = $1
      ORDER BY hr.date_recorded DESC, hr.created_at DESC
      LIMIT 5
    `, [patientId]);

    // Get active prescriptions
    const activePrescriptions = await query(`
      SELECT pr.*, hp.first_name as provider_first_name, hp.last_name as provider_last_name
      FROM prescriptions pr
      JOIN healthcare_providers hp ON pr.provider_id = hp.id
      WHERE pr.patient_id = $1 AND pr.status = 'active'
      ORDER BY pr.prescription_date DESC
      LIMIT 5
    `, [patientId]);

    // Get unread notifications count
    const notificationCount = await query(`
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND read = FALSE
    `, [patientId]);

    logger.logHealthcare('Patient dashboard accessed', patientId, null, { ip: req.ip });

    res.json({
      success: true,
      data: {
        patient: patientInfo.rows[0],
        upcomingAppointments: upcomingAppointments.rows,
        recentHealthRecords: recentHealthRecords.rows,
        activePrescriptions: activePrescriptions.rows,
        unreadNotifications: parseInt(notificationCount.rows[0].unread_count)
      }
    });
  })
);

// @route   GET /api/patients/:id/appointments
// @desc    Get patient appointments
// @access  Private (Patient or Provider/Admin)
router.get('/:id/appointments',
  authenticateToken,
  authorizeOwnership('id'),
  asyncHandler(async (req, res) => {
    const patientId = req.params.id;
    const { status, limit = 10, offset = 0 } = req.query;

    let whereClause = 'WHERE a.patient_id = $1';
    let queryParams = [patientId];

    if (status) {
      whereClause += ' AND a.status = $2';
      queryParams.push(status);
    }

    const appointments = await query(`
      SELECT a.*, hp.first_name as provider_first_name, hp.last_name as provider_last_name,
             hp.title as provider_title, hp.specialization
      FROM appointments a
      JOIN healthcare_providers hp ON a.provider_id = hp.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        appointments: appointments.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: appointments.rows.length
        }
      }
    });
  })
);

// @route   POST /api/patients/:id/symptoms
// @desc    Submit symptom assessment
// @access  Private (Patient)
router.post('/:id/symptoms',
  authenticateToken,
  authorizeRoles('patient'),
  authorizeOwnership('id'),
  [
    body('symptoms').isArray({ min: 1 }).withMessage('At least one symptom is required'),
    body('severity_score').isInt({ min: 1, max: 10 }).withMessage('Severity score must be between 1 and 10'),
    body('duration').notEmpty().withMessage('Duration is required')
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

    const patientId = req.params.id;
    const { symptoms, severity_score, duration, triggers, notes } = req.body;

    // Simple AI assessment logic (would be more sophisticated in production)
    let recommended_action = 'monitor';
    let urgency_level = 'low';

    if (severity_score >= 8) {
      recommended_action = 'immediate_care';
      urgency_level = 'urgent';
    } else if (severity_score >= 6) {
      recommended_action = 'schedule_appointment';
      urgency_level = 'high';
    } else if (severity_score >= 4) {
      recommended_action = 'schedule_appointment';
      urgency_level = 'medium';
    }

    const ai_assessment = {
      risk_level: urgency_level,
      possible_conditions: [], // Would be populated by AI
      recommendations: [recommended_action]
    };

    const result = await query(`
      INSERT INTO symptom_assessments 
      (patient_id, symptoms, severity_score, duration, triggers, ai_assessment, 
       recommended_action, urgency_level, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      patientId, 
      JSON.stringify(symptoms), 
      severity_score, 
      duration, 
      JSON.stringify(triggers || []), 
      JSON.stringify(ai_assessment),
      recommended_action,
      urgency_level,
      notes
    ]);

    logger.logHealthcare('Symptom assessment submitted', patientId, null, { 
      severity: severity_score,
      urgency: urgency_level,
      action: recommended_action
    });

    res.status(201).json({
      success: true,
      message: 'Symptom assessment submitted successfully',
      data: {
        assessment: result.rows[0]
      }
    });
  })
);

// @route   PUT /api/patients/:id/profile
// @desc    Update patient profile
// @access  Private (Patient)
router.put('/:id/profile',
  authenticateToken,
  authorizeRoles('patient'),
  authorizeOwnership('id'),
  [
    body('first_name').optional().trim().isLength({ min: 2, max: 50 }),
    body('last_name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone_number').optional().isMobilePhone(),
    body('emergency_contact_phone').optional().isMobilePhone(),
    body('preferred_language').optional().isIn(['en', 'si', 'ta'])
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

    const patientId = req.params.id;
    const allowedFields = [
      'first_name', 'last_name', 'phone_number', 'emergency_contact_name',
      'emergency_contact_phone', 'address', 'city', 'preferred_language',
      'medical_history', 'allergies', 'current_medications'
    ];

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(req.body[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No valid fields to update' }
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(patientId);

    const result = await query(`
      UPDATE patients 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, updateValues);

    logger.logHealthcare('Patient profile updated', patientId, null);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        patient: result.rows[0]
      }
    });
  })
);

module.exports = router;
