const express = require('express');
const router = express.Router();
const { query } = require('../db');

const normalizeSeverity = (value) => {
  if (!value) return 'Medium';
  const lower = String(value).toLowerCase();
  if (lower === 'low') return 'Low';
  if (lower === 'high') return 'High';
  if (lower === 'critical') return 'Critical';
  return 'Medium';
};

const mapAlert = (row) => ({
  id: row._id,
  _id: row._id,
  title: row.title,
  description: row.description,
  category: row.category,
  severity: row.severity,
  region: row.region,
  active: row.active,
  blogSlug: row.blogSlug,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

// Get all active alerts
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", title, description, category, severity, region,
              active, blog_slug AS "blogSlug", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM alerts
       WHERE active = TRUE
       ORDER BY created_at DESC`
    );
    res.json(result.rows.map(mapAlert));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description = null,
      category = null,
      severity = 'Medium',
      region = null,
      active = true,
      blogSlug = null
    } = req.body;

    const result = await query(
      `INSERT INTO alerts (title, description, category, severity, region, active, blog_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id AS "_id", title, description, category, severity, region,
                 active, blog_slug AS "blogSlug", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [title, description, category, normalizeSeverity(severity), region, !!active, blogSlug]
    );
    res.status(201).json(mapAlert(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update alert
router.patch('/:id', async (req, res) => {
  try {
    const fields = ['title', 'description', 'category', 'severity', 'region', 'active', 'blogSlug'];
    const updates = [];
    const values = [];
    let index = 1;

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'blogSlug') {
          updates.push(`blog_slug = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'severity') {
          updates.push(`severity = $${index++}`);
          values.push(normalizeSeverity(req.body[field]));
        } else if (field === 'active') {
          updates.push(`active = $${index++}`);
          values.push(!!req.body[field]);
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
      `UPDATE alerts
       SET ${updates.join(', ')}
       WHERE id = $${index}
       RETURNING id AS "_id", title, description, category, severity, region,
                 active, blog_slug AS "blogSlug", created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Alert not found' });
    res.json(mapAlert(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM alerts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
