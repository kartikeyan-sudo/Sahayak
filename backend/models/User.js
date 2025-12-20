const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  applicationStatus: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'submitted', 'approved', 'rejected'], 
    default: 'not-started' 
  },
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    details: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
