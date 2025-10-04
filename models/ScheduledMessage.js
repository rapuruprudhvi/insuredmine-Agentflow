const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  scheduled_day: {
    type: Date,
    required: true
  },
  scheduled_time: {
    type: String,
    required: true
  },
  recipient_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  recipient_name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);