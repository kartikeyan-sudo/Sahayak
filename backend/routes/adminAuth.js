const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const AdminUser = require('../models/AdminUser');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Admin registration (use only in initial setup or protected endpoint)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new AdminUser({ username, email, passwordHash: hash, role: role || 'editor' });
    await user.save();
    res.json({ message: 'Admin user created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating admin user', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (process.env.NODE_ENV !== 'production') console.log('[adminAuth] login attempt for username:', username);
    const user = await AdminUser.findOne({ username });
    if (process.env.NODE_ENV !== 'production') console.log('[adminAuth] user found:', !!user);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (process.env.NODE_ENV !== 'production') console.log('[adminAuth] password match:', !!ok);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user._id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

module.exports = router;
