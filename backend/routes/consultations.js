const express = require('express');
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
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
    
    const consultation = await Consultation.findById(consultationId)
      .populate('patient', 'firstName lastName')
      .populate('provider', 'firstName lastName')
      .populate('appointment');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: { message: 'Consultation not found' }
      });
    }

    res.json({
      success: true,
      data: {
        consultation
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
    
    // Get appointment details
    const appointment = await Appointment.findById(appointment_id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    // Create consultation
    const consultation = new Consultation({
      appointment: appointment._id,
      patient: appointment.patient,
      provider: appointment.provider,
      startedAt: new Date()
    });

    await consultation.save();

    res.status(201).json({
      success: true,
      data: {
        consultation
      }
    });
  })
);

module.exports = router;
