const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

// Create
router.post('/', auth(['admin','editor']), async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Error creating blog', error: err.message });
  }
});

// Read all (public)
router.get('/', async (req, res) => {
  const blogs = await Blog.find().sort({ publishedAt: -1 });
  res.json(blogs);
});

// Read one
router.get('/:slug', async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(blog);
});

// Update
router.put('/:id', auth(['admin','editor']), async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
