require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDatabase, query, closePool } = require('../db');

async function seedSampleData() {
  try {
    await initDatabase();

    const adminExists = await query('SELECT id FROM admin_users WHERE username = $1', ['admin']);
    if (!adminExists.rows[0]) {
      const adminHash = await bcrypt.hash('admin', 10);
      await query(
        `INSERT INTO admin_users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@sahayak.local', adminHash, 'admin']
      );
    }

    const userExists = await query('SELECT id FROM users WHERE email = $1', ['user@sahayak.local']);
    let userId = userExists.rows[0] ? userExists.rows[0].id : null;

    if (!userId) {
      const userHash = await bcrypt.hash('password123', 10);
      const insertedUser = await query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Demo User', 'user@sahayak.local', '9876543210', userHash, 'user']
      );
      userId = insertedUser.rows[0].id;
    }

    await query(
      `INSERT INTO blogs (slug, title, excerpt, content, category, tags, author, status, published_at)
       VALUES
       ($1, $2, $3, $4, $5, $6::jsonb, $7, 'published', NOW()),
       ($8, $9, $10, $11, $12, $13::jsonb, $14, 'draft', NULL)
       ON CONFLICT (slug) DO NOTHING`,
      [
        'cyber-fraud-red-flags',
        'Cyber Fraud Red Flags',
        'Know the signs of common cyber scams.',
        'Watch for urgency, fake KYC links, and requests for OTP or PIN.',
        'Cyber Safety',
        JSON.stringify(['cyber', 'awareness']),
        'Sahayak Team',
        'fir-application-checklist',
        'FIR Application Checklist',
        'Checklist before filing your FIR.',
        'Collect transaction IDs, account details, and evidence screenshots.',
        'FIR',
        JSON.stringify(['fir', 'checklist']),
        'Sahayak Team'
      ]
    );

    await query(
      `INSERT INTO firs (
        user_id, incident_type, incident_date, location, estimated_loss,
        contact_details, incident_narrative, suspect_details, evidence,
        status, application_number, is_draft
      ) VALUES (
        $1, 'UPI Fraud', NOW() - INTERVAL '1 day', 'Pune, Maharashtra', 4200,
        $2::jsonb, $3, $4::jsonb, $5::jsonb,
        'Incident Logged', $6, FALSE
      )
      ON CONFLICT (application_number) DO NOTHING`,
      [
        userId,
        JSON.stringify({ name: 'Demo User', phone: '9876543210', email: 'user@sahayak.local' }),
        'I received a fake bank KYC link and entered details. Money was debited immediately.',
        JSON.stringify({ upiId: 'fraud@upi', account: 'XXXX1234' }),
        JSON.stringify([{ type: 'screenshot', note: 'transaction screenshot attached' }]),
        `APP${Date.now()}`
      ]
    );

    console.log('Sample data seeded successfully.');
    console.log('Admin: admin / admin');
    console.log('User: user@sahayak.local / password123');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed sample data:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seedSampleData();
