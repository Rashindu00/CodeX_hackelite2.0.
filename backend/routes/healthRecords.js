const express = require('express');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorizeOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/health-records/:patientId
// @desc    Get patient health records
// @access  Private
router.get('/:patientId',
  authenticateToken,
  authorizeOwnership('patientId'),
  asyncHandler(async (req, res) => {
    const patientId = req.params.patientId;
    const { type, limit = 20, offset = 0 } = req.query;

    let whereClause = 'WHERE hr.patient_id = $1';
    let queryParams = [patientId];

    if (type) {
      whereClause += ' AND hr.record_type = $2';
      queryParams.push(type);
    }

    const healthRecords = await query(`
      SELECT hr.*, 
             hp.first_name as provider_first_name, 
             hp.last_name as provider_last_name,
             hp.specialization
      FROM health_records hr
      LEFT JOIN healthcare_providers hp ON hr.provider_id = hp.id
      ${whereClause}
      ORDER BY hr.date_recorded DESC, hr.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        healthRecords: healthRecords.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  })
);

module.exports = router;
