const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { query } = require('../db');
const validate = require('../middleware/validate');

const mapBlog = (row) => ({
  _id: row._id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  author: row.author,
  status: row.status,
  publishedAt: row.publishedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

// Create
router.post('/', auth(['admin','editor']), [
  body('slug').trim().notEmpty().withMessage('slug is required'),
  body('title').trim().notEmpty().withMessage('title is required')
], validate, async (req, res) => {
  try {
    const {
      slug,
      title,
      excerpt = null,
      content = null,
      category = null,
      tags = [],
      author = null,
      status = 'draft',
      publishedAt = null
    } = req.body;

    const result = await query(
      `INSERT INTO blogs (slug, title, excerpt, content, category, tags, author, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
       RETURNING id AS "_id", slug, title, excerpt, content, category, tags,
                 author, status, published_at AS "publishedAt",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [slug, title, excerpt, content, category, JSON.stringify(tags), author, status, publishedAt]
    );
    res.json(mapBlog(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error creating blog', error: err.message });
  }
});

// Read all (public)
router.get('/', async (req, res) => {
  const result = await query(
    `SELECT id AS "_id", slug, title, excerpt, content, category, tags, author, status,
            published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM blogs
     ORDER BY published_at DESC NULLS LAST, created_at DESC`
  );
  res.json(result.rows.map(mapBlog));
});

// Read one
router.get('/:slug', async (req, res) => {
  const result = await query(
    `SELECT id AS "_id", slug, title, excerpt, content, category, tags, author, status,
            published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM blogs
     WHERE slug = $1`,
    [req.params.slug]
  );
  const blog = result.rows[0];
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(mapBlog(blog));
});

// Update
router.put('/:id', auth(['admin','editor']), [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('title cannot be empty'),
  body('slug').optional().trim().isLength({ min: 1 }).withMessage('slug cannot be empty')
], validate, async (req, res) => {
  try {
    const fields = ['slug', 'title', 'excerpt', 'content', 'category', 'tags', 'author', 'status', 'publishedAt'];
    const updates = [];
    const values = [];
    let index = 1;

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'publishedAt') {
          updates.push(`published_at = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'tags') {
          updates.push(`tags = $${index++}::jsonb`);
          values.push(JSON.stringify(Array.isArray(req.body[field]) ? req.body[field] : []));
        } else {
          updates.push(`${field} = $${index++}`);
          values.push(req.body[field]);
        }
      }
    }

    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const result = await query(
      `UPDATE blogs
       SET ${updates.join(', ')}
       WHERE id = $${index}
       RETURNING id AS "_id", slug, title, excerpt, content, category, tags,
                 author, status, published_at AS "publishedAt",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapBlog(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
