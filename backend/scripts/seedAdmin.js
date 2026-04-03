require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDatabase, query, closePool } = require('../db');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL...');
    await initDatabase();
    console.log('✅ Connected to Neon PostgreSQL');

    // Check if admin already exists
    const existing = await query('SELECT id FROM admin_users WHERE username = $1', ['admin']);
    if (existing.rows[0]) {
      console.log('ℹ️  Admin user already exists');
      await closePool();
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin', salt);

    await query(
      `INSERT INTO admin_users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      ['admin', 'admin@sahayak.local', hash, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin');
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
