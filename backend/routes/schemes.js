const express = require('express');
const router = express.Router();
const { query } = require('../db');

const mapScheme = (row) => ({
  id: row._id,
  _id: row._id,
  code: row.code,
  name: row.name,
  description: row.description,
  link: row.link,
  governmentTag: row.governmentTag,
  objectives: row.objectives || [],
  process: row.process || [],
  requiredDocuments: row.requiredDocuments || [],
  eligibility: row.eligibility || [],
  dos: row.dos || [],
  donts: row.donts || [],
  archived: row.archived
});

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", code, name, description, link,
              government_tag AS "governmentTag", objectives, process,
              required_documents AS "requiredDocuments", eligibility,
              dos, donts, archived
       FROM schemes
       WHERE archived = FALSE
       ORDER BY name ASC`
    );
    res.json(result.rows.map(mapScheme));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", code, name, description, link,
              government_tag AS "governmentTag", objectives, process,
              required_documents AS "requiredDocuments", eligibility,
              dos, donts, archived
       FROM schemes
       WHERE id = $1`,
      [req.params.id]
    );
    const scheme = result.rows[0];
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(mapScheme(scheme));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new scheme (admin only - add auth middleware later)
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      description = null,
      link = null,
      governmentTag = null,
      objectives = [],
      process = [],
      requiredDocuments = [],
      eligibility = [],
      dos = [],
      donts = []
    } = req.body;

    const result = await query(
      `INSERT INTO schemes (
        code, name, description, link, government_tag,
        objectives, process, required_documents, eligibility, dos, donts
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb)
      RETURNING id AS "_id", code, name, description, link,
                government_tag AS "governmentTag", objectives, process,
                required_documents AS "requiredDocuments", eligibility, dos, donts, archived`,
      [
        code,
        name,
        description,
        link,
        governmentTag,
        JSON.stringify(objectives),
        JSON.stringify(process),
        JSON.stringify(requiredDocuments),
        JSON.stringify(eligibility),
        JSON.stringify(dos),
        JSON.stringify(donts)
      ]
    );
    res.status(201).json(mapScheme(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update scheme
router.patch('/:id', async (req, res) => {
  try {
    const fields = ['code', 'name', 'description', 'link', 'governmentTag', 'objectives', 'process', 'requiredDocuments', 'eligibility', 'dos', 'donts', 'archived'];
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
                 required_documents AS "requiredDocuments", eligibility,
                 dos, donts, archived`,
      values
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Scheme not found' });
    res.json(mapScheme(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete scheme
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM schemes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Scheme deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
