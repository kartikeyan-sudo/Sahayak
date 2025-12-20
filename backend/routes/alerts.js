const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Get all active alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ 
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  const alert = new Alert(req.body);
  try {
    const newAlert = await alert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update alert
router.patch('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
