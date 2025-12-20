const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

// Create
router.post('/', auth(['admin','editor']), async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Error creating alert', error: err.message });
  }
});

// Read all
router.get('/', async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts);
});

// Update
router.put('/:id', auth(['admin','editor']), async (req, res) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
