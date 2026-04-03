require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDatabase, query } = require('./db');
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

async function ensureDefaultAdminUser() {
  const autoSeed = String(process.env.AUTO_SEED_DEFAULT_ADMIN || 'true').toLowerCase() === 'true';
  if (!autoSeed) return;

  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  const email = process.env.DEFAULT_ADMIN_EMAIL || `${username}@sahayak.local`;

  const existing = await query('SELECT id FROM admin_users WHERE username = $1', [username]);
  if (existing.rows[0]) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO admin_users (username, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')`,
    [username, email, passwordHash]
  );

  console.warn('⚠️ Default admin user was auto-created. Change credentials after first login.');
}

initDatabase()
  .then(async () => {
    try {
      await ensureDefaultAdminUser();
      const result = await query('SELECT 1 AS ok');
      console.log('✅ Neon PostgreSQL connected and schema ready');
      console.log('🔎 Verify manually with: psql "$DATABASE_URL" -c "SELECT 1;"');
      console.log(`✅ Startup check result: SELECT ${result.rows[0].ok}`);
    } catch (err) {
      console.warn('⚠️ Neon PostgreSQL connected but health check failed. :', err.message || err);
    }
  })
  .catch(err => {
    const missingConfig = err && err.code === 'DB_CONFIG_MISSING';
    const silent = process.env.SILENT_DB_START === 'true' || process.env.NODE_ENV === 'development';
    if (silent || missingConfig) {
      console.warn('⚠️ Neon PostgreSQL init warning (continuing without DB):', err.message || err);
      if (missingConfig) {
        console.warn('⚠️ Configure DATABASE_URL in Render Environment settings to enable DB-backed APIs.');
      }
    } else {
      console.error('❌ Neon PostgreSQL init error:', err);
      process.exit(1);
    }
  });

const server = app.listen(PORT, () => {
  console.log(`🚀 Sahayak Backend running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the process using it or set a different PORT in .env`);
    process.exit(1);
  }
  if (err && err.code === 'EACCES') {
    console.error(`❌ Permission denied binding to port ${PORT}. Try using a port >1024 or run with elevated privileges.`);
    process.exit(1);
  }
  console.error('❌ Server error:', err);
  process.exit(1);
});

module.exports = app;
