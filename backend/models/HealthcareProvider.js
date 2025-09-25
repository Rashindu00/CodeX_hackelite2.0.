const mongoose = require('mongoose');

const healthcareProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  experience: {
    years: {
      type: Number,
      min: 0
    },
    description: String
  },
  workSchedule: {
    monday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String, // Format: "09:00"
      endTime: String    // Format: "17:00"
    },
    tuesday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    wednesday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    thursday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    friday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String
    }
  },
  consultationFee: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  acceptedInsurance: [String],
  officeAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    }
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  languages: [String],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingNewPatients: {
    type: Boolean,
    default: true
  },
  telemedicineEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
healthcareProviderSchema.index({ user: 1 });
healthcareProviderSchema.index({ specialization: 1 });
healthcareProviderSchema.index({ licenseNumber: 1 });
healthcareProviderSchema.index({ isVerified: 1, isActive: 1 });
healthcareProviderSchema.index({ 'rating.average': -1 });

// Get available time slots for a specific day
healthcareProviderSchema.methods.getAvailableSlots = function(dayOfWeek, date) {
  const schedule = this.workSchedule[dayOfWeek.toLowerCase()];
  if (!schedule || !schedule.isAvailable) {
    return [];
  }
  
  // Generate time slots (this is a simplified version)
  const slots = [];
  const startHour = parseInt(schedule.startTime.split(':')[0]);
  const endHour = parseInt(schedule.endTime.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  return slots;
};

// Update rating
healthcareProviderSchema.methods.updateRating = function(newRating) {
  const totalScore = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalScore / this.rating.count;
  return this.save();
};

// Ensure virtual fields are serialized
healthcareProviderSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('HealthcareProvider', healthcareProviderSchema);