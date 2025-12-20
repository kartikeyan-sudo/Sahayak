const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  severity: { type: String, enum: ['Low','Medium','High','Critical'], default: 'Medium' },
  region: { type: String },
  active: { type: Boolean, default: true },
  blogSlug: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Alert', AlertSchema);
