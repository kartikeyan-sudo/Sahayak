const express = require('express');
const router = express.Router();
const FIRDraft = require('../models/FIRDraft');

// Get all FIR drafts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const drafts = await FIRDraft.find({ userId: req.params.userId });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single FIR draft
router.get('/:id', async (req, res) => {
  try {
    const draft = await FIRDraft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: 'FIR draft not found' });
    }
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new FIR draft
router.post('/', async (req, res) => {
  const draft = new FIRDraft(req.body);
  try {
    const newDraft = await draft.save();
    res.status(201).json(newDraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update FIR draft
router.patch('/:id', async (req, res) => {
  try {
    const draft = await FIRDraft.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(draft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete FIR draft
router.delete('/:id', async (req, res) => {
  try {
    await FIRDraft.findByIdAndDelete(req.params.id);
    res.json({ message: 'FIR draft deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit FIR draft (change status)
router.post('/:id/submit', async (req, res) => {
  try {
    const draft = await FIRDraft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: 'FIR draft not found' });
    }
    
    draft.status = 'Incident Logged';
    draft.applicationNumber = 'APP' + Date.now();
    await draft.save();
    
    res.json(draft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
