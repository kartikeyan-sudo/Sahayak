const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const total = users.length;
    const active = users.filter(u => u.isOnline).length;
    res.json({ users, total, active });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Update user status (block/unblock)
router.put('/:id/block', auth(['admin']), async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Update application status
router.put('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { applicationStatus } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { applicationStatus },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// Clear activity log
router.delete('/:id/activity', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { activityLog: [] },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error clearing activity', error: err.message });
  }
});

// Add activity log entry
router.post('/:id/activity', auth(['admin']), async (req, res) => {
  try {
    const { action, details } = req.body;
    const user = await User.findById(req.params.id);
    user.activityLog.push({ action, details, timestamp: new Date() });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error adding activity', error: err.message });
  }
});

module.exports = router;
