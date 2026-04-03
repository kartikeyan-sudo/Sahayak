require('dotenv').config();
const { initDatabase, query } = require('./db');
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

initDatabase()
  .then(async () => {
    try {
      const result = await query('SELECT 1 AS ok');
      console.log('✅ Neon PostgreSQL connected and schema ready');
      console.log('🔎 Verify manually with: psql "$DATABASE_URL" -c "SELECT 1;"');
      console.log(`✅ Startup check result: SELECT ${result.rows[0].ok}`);
    } catch (err) {
      console.warn('⚠️ Neon PostgreSQL connected but health check failed:', err.message || err);
    }
  })
  .catch(err => {
    const silent = process.env.SILENT_DB_START === 'true' || process.env.NODE_ENV === 'development';
    if (silent) {
      console.warn('⚠️ Neon PostgreSQL init warning (continuing without DB):', err.message || err);
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
