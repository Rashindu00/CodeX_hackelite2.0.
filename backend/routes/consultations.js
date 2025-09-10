const express = require('express');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/consultations/:id
// @desc    Get consultation details
// @access  Private
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const consultationId = req.params.id;
    
    const consultation = await query(`
      SELECT c.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             hp.first_name as provider_first_name, hp.last_name as provider_last_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN healthcare_providers hp ON c.provider_id = hp.id
      WHERE c.id = $1
    `, [consultationId]);

    if (consultation.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Consultation not found' }
      });
    }

    res.json({
      success: true,
      data: {
        consultation: consultation.rows[0]
      }
    });
  })
);

// @route   POST /api/consultations/start
// @desc    Start a consultation session
// @access  Private
router.post('/start',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { appointment_id } = req.body;
    
    const result = await query(`
      INSERT INTO consultations (appointment_id, patient_id, provider_id, started_at)
      SELECT a.id, a.patient_id, a.provider_id, CURRENT_TIMESTAMP
      FROM appointments a
      WHERE a.id = $1
      RETURNING *
    `, [appointment_id]);

    res.status(201).json({
      success: true,
      data: {
        consultation: result.rows[0]
      }
    });
  })
);

module.exports = router;
