require('dotenv').config();
const { Pool } = require('pg');

const MAX_QUERY_RETRIES = Number(process.env.DB_MAX_RETRIES || 2);
let pool = null;

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.PG_DATABASE_URL ||
    ''
  );
}

function createMissingDbConfigError() {
  const error = new Error(
    'Database connection string missing. Set DATABASE_URL (or POSTGRES_URL / NEON_DATABASE_URL) in environment variables.'
  );
  error.code = 'DB_CONFIG_MISSING';
  return error;
}

function getPool() {
  if (pool) return pool;

  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    throw createMissingDbConfigError();
  }

  pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000)
  });

  pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error.message);
  });

  return pool;
}

function isTransientDbError(error) {
  if (!error) return false;
  const transientCodes = new Set(['ECONNRESET', 'ETIMEDOUT', '57P01', '53300']);
  if (transientCodes.has(error.code)) return true;
  const msg = String(error.message || '').toLowerCase();
  return msg.includes('connection terminated') || msg.includes('timeout');
}

async function query(text, params = []) {
  const dbPool = getPool();
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_QUERY_RETRIES; attempt += 1) {
    try {
      return await dbPool.query(text, params);
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === MAX_QUERY_RETRIES) {
        throw error;
      }
    }
  }
  throw lastError;
}

async function withTransaction(work) {
  const dbPool = getPool();
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // ignore rollback failures
    }
    throw error;
  } finally {
    client.release();
  }
}

async function initDatabase() {
  if (!resolveDatabaseUrl()) {
    throw createMissingDbConfigError();
  }

  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      category TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      author TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      severity TEXT NOT NULL DEFAULT 'Medium',
      region TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      blog_slug TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      link TEXT,
      government_tag TEXT,
      objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
      process JSONB NOT NULL DEFAULT '[]'::jsonb,
      required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      eligibility JSONB NOT NULL DEFAULT '[]'::jsonb,
      dos JSONB NOT NULL DEFAULT '[]'::jsonb,
      donts JSONB NOT NULL DEFAULT '[]'::jsonb,
      archived BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      is_online BOOLEAN NOT NULL DEFAULT FALSE,
      last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      application_status TEXT NOT NULL DEFAULT 'not-started',
      activity_log JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS firs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      incident_type TEXT NOT NULL,
      incident_date TIMESTAMPTZ NOT NULL,
      location TEXT NOT NULL,
      estimated_loss NUMERIC NOT NULL,
      contact_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      incident_narrative TEXT NOT NULL,
      suspect_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'Draft',
      application_number TEXT UNIQUE,
      is_draft BOOLEAN NOT NULL DEFAULT TRUE,
      pdf_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS banned_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      reason TEXT,
      banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fir_drafts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      incident_type TEXT NOT NULL,
      incident_date TIMESTAMPTZ NOT NULL,
      location TEXT NOT NULL,
      estimated_loss NUMERIC NOT NULL,
      contact_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      incident_narrative TEXT NOT NULL,
      suspect_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'Draft',
      application_number TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
    CREATE INDEX IF NOT EXISTS idx_firs_user_id ON firs(user_id);
    CREATE INDEX IF NOT EXISTS idx_firs_application_number ON firs(application_number);
  `);
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  initDatabase,
  closePool,
  withTransaction
};
