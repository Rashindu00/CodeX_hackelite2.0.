const express = require('express');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/providers/dashboard/:id
// @desc    Get provider dashboard data
// @access  Private (Provider/Admin)
router.get('/dashboard/:id', 
  authenticateToken, 
  authorizeRoles('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const providerId = req.params.id;

    // Get provider info
    const providerInfo = await query(`
      SELECT hp.*, u.email 
      FROM healthcare_providers hp 
      JOIN users u ON hp.id = u.id 
      WHERE hp.id = $1
    `, [providerId]);

    if (providerInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Provider not found' }
      });
    }

    // Get today's appointments
    const todayAppointments = await query(`
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.provider_id = $1 AND a.appointment_date = CURRENT_DATE
      ORDER BY a.appointment_time
    `, [providerId]);

    res.json({
      success: true,
      data: {
        provider: providerInfo.rows[0],
        todayAppointments: todayAppointments.rows
      }
    });
  })
);

// @route   GET /api/providers/:id/patients
// @desc    Get provider's patients
// @access  Private (Provider/Admin)
router.get('/:id/patients',
  authenticateToken,
  authorizeRoles('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const providerId = req.params.id;
    
    const patients = await query(`
      SELECT DISTINCT p.*, 
             COUNT(a.id) as total_appointments,
             MAX(a.appointment_date) as last_appointment
      FROM patients p
      JOIN appointments a ON p.id = a.patient_id
      WHERE a.provider_id = $1
      GROUP BY p.id
      ORDER BY last_appointment DESC
    `, [providerId]);

    res.json({
      success: true,
      data: {
        patients: patients.rows
      }
    });
  })
);

module.exports = router;
