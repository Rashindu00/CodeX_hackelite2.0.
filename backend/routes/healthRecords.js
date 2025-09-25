const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/health-records';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `health-record-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Test route to verify registration
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Health records routes working!' });
});

// Debug route to check file paths in database
router.get('/debug-paths', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    const records = await HealthRecord.find({ 
      patient: patient._id, 
      type: 'document',
      'data.filePath': { $exists: true }
    }).select('title data.filePath data.filename createdAt');

    console.log('Debug - Found records with file paths:');
    records.forEach(record => {
      console.log('Record ID:', record._id);
      console.log('Title:', record.title);
      console.log('File Path:', record.data.filePath);
      console.log('File Name:', record.data.filename);
      console.log('---');
    });

    res.json({
      success: true,
      message: 'Check server console for file path details',
      recordCount: records.length,
      records: records.map(r => ({
        id: r._id,
        title: r.title,
        filePath: r.data.filePath,
        filename: r.data.filename
      }))
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Debug failed', details: error.message } });
  }
});

// @route   GET /api/health-records
// @desc    Get all health records for authenticated patient
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Health records GET route hit, user ID:', req.user.id);
    console.log('User role:', req.user.role);
    
    // Check if user exists and is a patient
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    console.log('User found:', !!user, 'Role:', user?.role);
    
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ error: { message: 'Access denied. Patient role required.' } });
    }
    
    let patient = await Patient.findOne({ user: req.user.id });
    console.log('Patient found:', !!patient);
    
    // If no patient record exists, create a default one
    if (!patient) {
      console.log('Creating default patient record...');
      patient = new Patient({
        user: req.user.id,
        dateOfBirth: new Date('1990-01-01'), // Default date
        gender: 'other' // Default gender
      });
      await patient.save();
      console.log('Default patient record created');
    }
    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient profile not found' } });
    }

    const { type, limit = 20, offset = 0 } = req.query;
    
    let filter = { patient: patient._id, status: 'active' };
    if (type) {
      filter.type = type;
    }

    const healthRecords = await HealthRecord.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('addedBy', 'firstName lastName role')
      .populate('provider', 'firstName lastName specialization');

    const totalRecords = await HealthRecord.countDocuments(filter);

    res.json({
      success: true,
      data: {
        healthRecords,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: totalRecords
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching health records:', error);
    res.status(500).json({ error: { message: 'Failed to fetch health records' } });
  }
});

// @route   POST /api/health-records/upload
// @desc    Upload health record file
// @access  Private
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file provided' } });
    }

    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient profile not found' } });
    }

    const { title, description, category } = req.body;

    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('req.file.path:', req.file.path);
    console.log('req.file.filename:', req.file.filename);
    console.log('req.file.originalname:', req.file.originalname);

    const healthRecord = new HealthRecord({
      patient: patient._id,
      type: 'document',
      title: title || req.file.originalname,
      description: description || '',
      category: category || 'general',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: req.file.path
      },
      addedBy: req.user.id,
      date: new Date()
    });

    console.log('Health record data being saved:', {
      filePath: req.file.path,
      filename: req.file.filename
    });

    const savedRecord = await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health record uploaded successfully',
      data: savedRecord
    });
  } catch (error) {
    logger.error('Error uploading health record:', error);
    res.status(500).json({ error: { message: 'Failed to upload health record' } });
  }
});

// @route   POST /api/health-records/vitals
// @desc    Add vital signs
// @access  Private
router.post('/vitals', authenticateToken, async (req, res) => {
  try {
    // Check if user is a patient
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ error: { message: 'Access denied. Patient role required.' } });
    }
    
    let patient = await Patient.findOne({ user: req.user.id });
    
    // Create default patient record if it doesn't exist
    if (!patient) {
      patient = new Patient({
        user: req.user.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'other'
      });
      await patient.save();
    }

    const { bloodPressure, heartRate, temperature, weight, height, notes, date } = req.body;

    const vitalSigns = {};
    if (bloodPressure) {
      const bpParts = bloodPressure.split('/');
      if (bpParts.length === 2) {
        vitalSigns.bloodPressure = {
          systolic: parseInt(bpParts[0]),
          diastolic: parseInt(bpParts[1])
        };
      }
    }
    if (heartRate) vitalSigns.heartRate = parseInt(heartRate);
    if (temperature) vitalSigns.temperature = parseFloat(temperature);
    if (weight) vitalSigns.weight = parseFloat(weight);
    if (height) vitalSigns.height = parseFloat(height);
    if (notes) vitalSigns.notes = notes;

    const healthRecord = new HealthRecord({
      patient: patient._id,
      type: 'vitals',
      title: 'Vital Signs',
      description: notes || '',
      category: 'vitals',
      data: vitalSigns,
      addedBy: req.user.id,
      date: date ? new Date(date) : new Date()
    });

    const savedRecord = await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Vital signs added successfully',
      data: savedRecord
    });
  } catch (error) {
    logger.error('Error adding vital signs:', error);
    res.status(500).json({ error: { message: 'Failed to add vital signs' } });
  }
});

// @route   POST /api/health-records/medications
// @desc    Add medication
// @access  Private
router.post('/medications', authenticateToken, async (req, res) => {
  try {
    // Check if user is a patient
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ error: { message: 'Access denied. Patient role required.' } });
    }
    
    let patient = await Patient.findOne({ user: req.user.id });
    
    // Create default patient record if it doesn't exist
    if (!patient) {
      patient = new Patient({
        user: req.user.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'other'
      });
      await patient.save();
    }

    const { 
      medicationName, 
      dosage, 
      frequency, 
      startDate, 
      endDate, 
      prescribedBy, 
      notes,
      status = 'active'
    } = req.body;

    if (!medicationName || !dosage || !frequency) {
      return res.status(400).json({ 
        error: { message: 'Medication name, dosage, and frequency are required' } 
      });
    }

    const medicationData = {
      name: medicationName,
      dosage,
      frequency,
      startDate: startDate ? new Date(startDate) : new Date(),
      status,
      prescribedBy: prescribedBy || 'Self-reported',
      notes: notes || ''
    };

    if (endDate) {
      medicationData.endDate = new Date(endDate);
    }

    const healthRecord = new HealthRecord({
      patient: patient._id,
      type: 'medication',
      title: `Medication: ${medicationName}`,
      description: `${dosage} - ${frequency}`,
      category: 'medication',
      data: medicationData,
      addedBy: req.user.id,
      date: new Date()
    });

    const savedRecord = await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: savedRecord
    });
  } catch (error) {
    logger.error('Error adding medication:', error);
    res.status(500).json({ error: { message: 'Failed to add medication' } });
  }
});

// @route   POST /api/health-records/allergies
// @desc    Add allergy
// @access  Private
router.post('/allergies', authenticateToken, async (req, res) => {
  try {
    // Check if user is a patient
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ error: { message: 'Access denied. Patient role required.' } });
    }
    
    let patient = await Patient.findOne({ user: req.user.id });
    
    // Create default patient record if it doesn't exist
    if (!patient) {
      patient = new Patient({
        user: req.user.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'other'
      });
      await patient.save();
    }

    const { 
      allergen, 
      severity, 
      reaction, 
      diagnosedDate, 
      notes 
    } = req.body;

    if (!allergen || !severity) {
      return res.status(400).json({ 
        error: { message: 'Allergen and severity are required' } 
      });
    }

    const allergyData = {
      allergen,
      severity,
      reaction: reaction || '',
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : new Date(),
      notes: notes || ''
    };

    const healthRecord = new HealthRecord({
      patient: patient._id,
      type: 'allergy',
      title: `Allergy: ${allergen}`,
      description: `Severity: ${severity}${reaction ? ` - ${reaction}` : ''}`,
      category: 'allergy',
      data: allergyData,
      addedBy: req.user.id,
      date: new Date()
    });

    const savedRecord = await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Allergy added successfully',
      data: savedRecord
    });
  } catch (error) {
    logger.error('Error adding allergy:', error);
    res.status(500).json({ error: { message: 'Failed to add allergy' } });
  }
});

module.exports = router;
