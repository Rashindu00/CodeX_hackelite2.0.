const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    enum: ['document', 'vitals', 'medication', 'allergy', 'lab-result', 'prescription', 'visit-summary'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'vitals', 'medication', 'allergy', 'lab', 'prescription', 'consultation'],
    default: 'general'
  },
  data: {
    // For vitals
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    
    // For medications
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active'
    },
    
    // For allergies
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    reaction: String,
    diagnosedDate: Date,
    
    // For documents/files
    filename: String,
    originalName: String,
    fileSize: Number,
    mimeType: String,
    filePath: String,
    
    // General notes
    notes: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthcareProvider'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
healthRecordSchema.index({ patient: 1, type: 1, date: -1 });
healthRecordSchema.index({ patient: 1, category: 1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);