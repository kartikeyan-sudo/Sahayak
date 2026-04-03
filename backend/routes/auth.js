const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { query } = require('../db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role
  };
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows[0]) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const created = await query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, name, email, phone, role`,
        [name, email, phone, passwordHash]
      );

      const user = created.rows[0];
      const payload = sanitizeUser(user);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      return res.status(201).json({ token, user: payload });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to register user', error: error.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await query(
        `SELECT id, name, email, phone, role, password_hash
         FROM users
         WHERE email = $1`,
        [email]
      );

      const user = result.rows[0];
      if (!user || !user.password_hash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const payload = sanitizeUser(user);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, user: payload });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to login', error: error.message });
    }
  }
);

router.get('/me', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, role
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
});

module.exports = router;
