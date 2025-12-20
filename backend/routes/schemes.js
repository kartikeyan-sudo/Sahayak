const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new scheme (admin only - add auth middleware later)
router.post('/', async (req, res) => {
  const scheme = new Scheme(req.body);
  try {
    const newScheme = await scheme.save();
    res.status(201).json(newScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update scheme
router.patch('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete scheme
router.delete('/:id', async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scheme deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
