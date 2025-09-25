const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['appointment', 'consultation', 'reminder', 'system', 'payment'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  data: {
    // Additional data related to the notification
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);