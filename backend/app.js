require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_FRONTEND_URL = process.env.ADMIN_FRONTEND_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function createApp() {
  const app = express();

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      if (localhostRegex.test(origin)) return cb(null, true);

      const configured = new Set([FRONTEND_URL, ADMIN_FRONTEND_URL, ...ALLOWED_ORIGINS]);
      if (configured.has(origin)) return cb(null, true);

      return cb(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
  }));

  app.use(express.json());
  app.use('/generated', express.static(path.join(__dirname, 'generated')));

  app.get('/', (req, res) => {
    res.json({
      message: 'Sahayak Backend API Running',
      version: '2.0.0',
      endpoints: {
        auth: '/api/auth',
        blogs: '/api/blogs',
        fir: '/api/fir',
        schemes: '/api/schemes',
        alerts: '/api/alerts',
        admin: '/api/admin/*'
      }
    });
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/blogs', require('./routes/blogs'));
  app.use('/api/schemes', require('./routes/schemes'));
  app.use('/api/fir', require('./routes/fir'));
  app.use('/api/alerts', require('./routes/alerts'));

  app.use('/api/admin/auth', require('./routes/adminAuth'));
  app.use('/api/admin/blogs', require('./routes/adminBlogs'));
  app.use('/api/admin/alerts', require('./routes/adminAlerts'));
  app.use('/api/admin/schemes', require('./routes/adminSchemes'));
  app.use('/api/admin/users', require('./routes/adminUsers'));
  app.use('/api/admin/firs', require('./routes/adminFirs'));

  app.get('/api/admin/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
