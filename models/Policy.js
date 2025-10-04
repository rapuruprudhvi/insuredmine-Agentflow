const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  policy_start_date: {
    type: Date,
    required: true
  },
  policy_end_date: {
    type: Date,
    required: true
  },
  policy_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LOB',
    required: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);