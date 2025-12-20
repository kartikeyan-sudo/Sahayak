const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','editor','viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

AdminUserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('AdminUser', AdminUserSchema);
