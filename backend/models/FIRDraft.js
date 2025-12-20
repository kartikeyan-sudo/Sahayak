const mongoose = require('mongoose');

const firDraftSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  incidentType: {
    type: String,
    required: true,
    enum: ['UPI Fraud', 'Banking Fraud', 'Phishing', 'Identity Theft', 'SIM Swap', 'Investment Scam', 'Other']
  },
  incidentDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  estimatedLoss: {
    type: Number,
    required: true
  },
  contactDetails: {
    name: String,
    phone: String,
    email: String,
    address: String
  },
  incidentNarrative: {
    type: String,
    required: true
  },
  suspectDetails: {
    name: String,
    phone: String,
    accountNumber: String,
    upiId: String,
    other: String
  },
  evidence: [{
    type: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['Draft', 'Incident Logged', 'Under Review', 'Verification', 'Relief Sanctioned'],
    default: 'Draft'
  },
  applicationNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FIRDraft', firDraftSchema);
