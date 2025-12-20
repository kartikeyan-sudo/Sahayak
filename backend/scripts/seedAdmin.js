require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await AdminUser.findOne({ username: 'admin' });
    if (existing) {
      console.log('ℹ️  Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin', salt);
    
    const admin = new AdminUser({
      username: 'admin',
      email: 'admin@sahayak.local',
      passwordHash: hash,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
