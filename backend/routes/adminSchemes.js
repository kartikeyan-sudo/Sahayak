const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const auth = require('../middleware/auth');

// Create
router.post('/', auth(['admin','editor']), async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ message: 'Error creating scheme', error: err.message });
  }
});

// Read all
router.get('/', async (req, res) => {
  const schemes = await Scheme.find().sort({ name: 1 });
  res.json(schemes);
});

// Update
router.put('/:id', auth(['admin','editor']), async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Archive / Delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
