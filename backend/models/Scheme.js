const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  governmentTag: { type: String },
  objectives: [String],
  process: [{ step: Number, description: String }],
  requiredDocuments: [String],
  eligibility: [String],
  dos: [String],
  donts: [String],
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SchemeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scheme', SchemeSchema);
