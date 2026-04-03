const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
require('dotenv').config();

const { query } = require('../db');
const validate = require('../middleware/validate');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Admin registration (use only in initial setup or protected endpoint)
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('username is required'),
  body('email').isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await query(
      `INSERT INTO admin_users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [username, email, hash, role || 'editor']
    );
    res.json({ message: 'Admin user created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating admin user', error: err.message });
  }
});

// Login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('username is required'),
  body('password').isString().notEmpty().withMessage('password is required')
], validate, async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query(
      `SELECT id, username, role, password_hash
       FROM admin_users
       WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

module.exports = router;
