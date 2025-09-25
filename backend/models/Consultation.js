const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthcareProvider',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['started', 'ongoing', 'completed', 'cancelled'],
    default: 'started'
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  diagnosis: {
    type: String,
    maxlength: 1000
  },
  prescription: [{
    medication: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  duration: Number, // in minutes
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Index for efficient queries
consultationSchema.index({ appointment: 1 });
consultationSchema.index({ patient: 1 });
consultationSchema.index({ provider: 1 });
consultationSchema.index({ startedAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);