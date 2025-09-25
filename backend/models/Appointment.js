const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true // Format: "14:30"
  },
  duration: {
    type: Number,
    default: 30 // Duration in minutes
  },
  type: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone'],
    default: 'telemedicine'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: {
    patient: String, // Notes from patient
    provider: String // Notes from provider
  },
  diagnosis: String,
  treatment: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  cancelReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  consultation: {
    roomId: String, // For video calls
    startTime: Date,
    endTime: Date,
    recordingUrl: String
  },
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    scheduledFor: Date
  }]
}, {
  timestamps: true
});

// Index for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ provider: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
  if (!this.appointmentDate || !this.appointmentTime) return null;
  
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return date;
});

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function() {
  const startTime = this.fullDateTime;
  if (!startTime) return null;
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + this.duration);
  
  return endTime;
});

// Check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = this.fullDateTime;
  
  if (!appointmentDateTime) return false;
  
  // Can cancel if appointment is more than 2 hours away
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
  return hoursUntilAppointment > 2 && ['scheduled', 'confirmed'].includes(this.status);
};

// Check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentDateTime = this.fullDateTime;
  
  if (!appointmentDateTime) return false;
  
  // Can reschedule if appointment is more than 4 hours away
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
  return hoursUntilAppointment > 4 && ['scheduled', 'confirmed'].includes(this.status);
};

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);