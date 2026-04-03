const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('../db');

const mapScheme = (row) => ({
  _id: row._id,
  code: row.code,
  name: row.name,
  description: row.description,
  link: row.link,
  url: row.link,
  governmentTag: row.governmentTag,
  objectives: row.objectives || [],
  process: row.process || [],
  requiredDocuments: row.requiredDocuments || [],
  eligibility: row.eligibility || [],
  dos: row.dos || [],
  donts: row.donts || [],
  archived: row.archived,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

// Create
router.post('/', auth(['admin','editor']), async (req, res) => {
  try {
    const {
      code,
      name,
      description = null,
      link,
      url,
      governmentTag = null,
      objectives = [],
      process = [],
      requiredDocuments = [],
      eligibility = [],
      dos = [],
      donts = [],
      archived = false
    } = req.body;

    const result = await query(
      `INSERT INTO schemes (
        code, name, description, link, government_tag,
        objectives, process, required_documents, eligibility, dos, donts, archived
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12)
      RETURNING id AS "_id", code, name, description, link,
                government_tag AS "governmentTag", objectives, process,
                required_documents AS "requiredDocuments", eligibility, dos, donts,
                archived, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        code,
        name,
        description,
        link || url || null,
        governmentTag,
        JSON.stringify(objectives),
        JSON.stringify(process),
        JSON.stringify(requiredDocuments),
        JSON.stringify(eligibility),
        JSON.stringify(dos),
        JSON.stringify(donts),
        !!archived
      ]
    );
    res.json(mapScheme(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error creating scheme', error: err.message });
  }
});

// Read all
router.get('/', async (req, res) => {
  const result = await query(
    `SELECT id AS "_id", code, name, description, link,
            government_tag AS "governmentTag", objectives, process,
            required_documents AS "requiredDocuments", eligibility, dos, donts,
            archived, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM schemes
     ORDER BY name ASC`
  );
  res.json(result.rows.map(mapScheme));
});

// Update
router.put('/:id', auth(['admin','editor']), async (req, res) => {
  try {
    const fields = [
      'code', 'name', 'description', 'link', 'url', 'governmentTag',
      'objectives', 'process', 'requiredDocuments', 'eligibility',
      'dos', 'donts', 'archived'
    ];
    const updates = [];
    const values = [];
    let index = 1;

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'governmentTag') {
          updates.push(`government_tag = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'requiredDocuments') {
          updates.push(`required_documents = $${index++}::jsonb`);
          values.push(JSON.stringify(req.body[field] || []));
        } else if (['objectives', 'process', 'eligibility', 'dos', 'donts'].includes(field)) {
          updates.push(`${field} = $${index++}::jsonb`);
          values.push(JSON.stringify(req.body[field] || []));
        } else if (field === 'url') {
          updates.push(`link = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'archived') {
          updates.push(`archived = $${index++}`);
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
      `UPDATE schemes
       SET ${updates.join(', ')}
       WHERE id = $${index}
       RETURNING id AS "_id", code, name, description, link,
                 government_tag AS "governmentTag", objectives, process,
                 required_documents AS "requiredDocuments", eligibility, dos, donts,
                 archived, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapScheme(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Update error', error: err.message });
  }
});

// Archive / Delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await query('DELETE FROM schemes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete error', error: err.message });
  }
});

module.exports = router;
