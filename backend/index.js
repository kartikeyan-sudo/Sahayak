require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Support configurable allowed origins via env var `ALLOWED_ORIGINS` (comma-separated)
// and a fallback `FRONTEND_URL` (for typical Vite dev at :5173).
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_FRONTEND_URL = process.env.ADMIN_FRONTEND_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, server-side)
    if (!origin) return cb(null, true);

    // Allow any http://localhost[:port] or 127.0.0.1 for local dev
    const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostRegex.test(origin)) return cb(null, true);

    // Direct match against configured origins
    const configured = new Set([FRONTEND_URL, ADMIN_FRONTEND_URL, ...ALLOWED_ORIGINS]);
    if (configured.has(origin)) return cb(null, true);

    // As a last resort, allow subpaths of the FRONTEND_URL host (same host different port)
    try {
      const originUrl = new URL(origin);
      const frontendHost = new URL(FRONTEND_URL).hostname;
      if (originUrl.hostname === frontendHost) return cb(null, true);
    } catch (e) {
      // ignore parse errors
    }

    // Deny other origins (respond false to CORS check)
    return cb(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
  exposedHeaders: ['Content-Length','X-Kuma-Revision']
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sahayak Backend API Running',
    version: '1.0.0',
    endpoints: {
      schemes: '/api/schemes',
      fir: '/api/fir',
      alerts: '/api/alerts'
    }
  });
});

// API Routes
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/fir', require('./routes/fir'));
app.use('/api/alerts', require('./routes/alerts'));
// Admin / CMS routes
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin/blogs', require('./routes/adminBlogs'));
app.use('/api/admin/alerts', require('./routes/adminAlerts'));
app.use('/api/admin/schemes', require('./routes/adminSchemes'));
app.use('/api/admin/users', require('./routes/adminUsers'));

// Simple admin health endpoint for dev/debug
app.get('/api/admin/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// MongoDB connection (update URI as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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
