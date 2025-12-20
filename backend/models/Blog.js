const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String },
  category: { type: String },
  tags: [String],
  author: { type: String },
  status: { type: String, enum: ['draft','review','published'], default: 'draft' },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
