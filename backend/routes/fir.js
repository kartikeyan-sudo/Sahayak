const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();
const validate = require('../middleware/validate');
const { query } = require('../db');
const { generateFirPdf } = require('../services/pdfService');

const mapFir = (row) => ({
  _id: row._id,
  userId: row.userId,
  incidentType: row.incidentType,
  incidentDate: row.incidentDate,
  location: row.location,
  estimatedLoss: Number(row.estimatedLoss),
  contactDetails: row.contactDetails || {},
  incidentNarrative: row.incidentNarrative,
  suspectDetails: row.suspectDetails || {},
  evidence: row.evidence || [],
  status: row.status,
  applicationNumber: row.applicationNumber,
  isDraft: row.isDraft,
  pdfUrl: row.pdfUrl,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

function ownerOrAdmin(req, ownerId) {
  return req.user.role === 'admin' || req.user.role === 'editor' || req.user.id === ownerId;
}

// Get all FIR records for current user (admin/editor can query any user via param)
router.get('/user/:userId', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    if (!ownerOrAdmin(req, req.params.userId)) {
      return res.status(403).json({ message: 'Not allowed to access this user FIR records' });
    }

    const result = await query(
      `SELECT id AS "_id", user_id AS "userId", incident_type AS "incidentType",
              incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
              contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
              suspect_details AS "suspectDetails", evidence, status,
              application_number AS "applicationNumber", created_at AS "createdAt",
              updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"
       FROM firs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows.map(mapFir));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single FIR record
router.get('/:id', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", user_id AS "userId", incident_type AS "incidentType",
              incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
              contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
              suspect_details AS "suspectDetails", evidence, status,
              application_number AS "applicationNumber", created_at AS "createdAt",
              updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"
       FROM firs
       WHERE id = $1`,
      [req.params.id]
    );
    const fir = result.rows[0];
    if (!fir) {
      return res.status(404).json({ message: 'FIR not found' });
    }
    if (!ownerOrAdmin(req, fir.userId)) {
      return res.status(403).json({ message: 'Not allowed to access this FIR record' });
    }
    res.json(mapFir(fir));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  '/',
  auth(['user', 'admin', 'editor']),
  [
    body('incidentType').trim().notEmpty().withMessage('incidentType is required'),
    body('incidentDate').isISO8601().withMessage('incidentDate must be a valid ISO date'),
    body('location').trim().notEmpty().withMessage('location is required'),
    body('estimatedLoss').isFloat({ min: 0 }).withMessage('estimatedLoss must be a non-negative number'),
    body('incidentNarrative').trim().isLength({ min: 10 }).withMessage('incidentNarrative must be at least 10 characters')
  ],
  validate,
  async (req, res) => {
    try {
      const {
        incidentType,
        incidentDate,
        location,
        estimatedLoss,
        contactDetails = {},
        incidentNarrative,
        suspectDetails = {},
        evidence = [],
        status = 'Draft',
        isDraft = true
      } = req.body;

      const result = await query(
        `INSERT INTO firs (
          user_id, incident_type, incident_date, location, estimated_loss,
          contact_details, incident_narrative, suspect_details, evidence, status, is_draft
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9::jsonb, $10, $11)
        RETURNING id AS "_id", user_id AS "userId", incident_type AS "incidentType",
                  incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
                  contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
                  suspect_details AS "suspectDetails", evidence, status,
                  application_number AS "applicationNumber", created_at AS "createdAt",
                  updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"`,
        [
          req.user.id,
          incidentType,
          incidentDate,
          location,
          estimatedLoss,
          JSON.stringify(contactDetails),
          incidentNarrative,
          JSON.stringify(suspectDetails),
          JSON.stringify(evidence),
          status,
          !!isDraft
        ]
      );
      res.status(201).json(mapFir(result.rows[0]));
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update FIR record
router.patch('/:id', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const existing = await query('SELECT user_id AS "userId" FROM firs WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ message: 'FIR not found' });
    if (!ownerOrAdmin(req, existing.rows[0].userId)) {
      return res.status(403).json({ message: 'Not allowed to update this FIR record' });
    }

    const fields = [
      'userId', 'incidentType', 'incidentDate', 'location', 'estimatedLoss',
      'contactDetails', 'incidentNarrative', 'suspectDetails', 'evidence',
      'status', 'applicationNumber', 'isDraft', 'pdfUrl'
    ];
    const updates = [];
    const values = [];
    let index = 1;

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'userId') {
          updates.push(`user_id = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'incidentType') {
          updates.push(`incident_type = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'incidentDate') {
          updates.push(`incident_date = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'estimatedLoss') {
          updates.push(`estimated_loss = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'contactDetails') {
          updates.push(`contact_details = $${index++}::jsonb`);
          values.push(JSON.stringify(req.body[field] || {}));
        } else if (field === 'incidentNarrative') {
          updates.push(`incident_narrative = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'suspectDetails') {
          updates.push(`suspect_details = $${index++}::jsonb`);
          values.push(JSON.stringify(req.body[field] || {}));
        } else if (field === 'evidence') {
          updates.push(`evidence = $${index++}::jsonb`);
          values.push(JSON.stringify(req.body[field] || []));
        } else if (field === 'applicationNumber') {
          updates.push(`application_number = $${index++}`);
          values.push(req.body[field]);
        } else if (field === 'isDraft') {
          updates.push(`is_draft = $${index++}`);
          values.push(!!req.body[field]);
        } else if (field === 'pdfUrl') {
          updates.push(`pdf_url = $${index++}`);
          values.push(req.body[field]);
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
      `UPDATE firs
       SET ${updates.join(', ')}
       WHERE id = $${index}
       RETURNING id AS "_id", user_id AS "userId", incident_type AS "incidentType",
                 incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
                 contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
                 suspect_details AS "suspectDetails", evidence, status,
                 application_number AS "applicationNumber", created_at AS "createdAt",
                 updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"`,
      values
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'FIR not found' });
    res.json(mapFir(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete FIR record
router.delete('/:id', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const existing = await query('SELECT user_id AS "userId" FROM firs WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ message: 'FIR not found' });
    if (!ownerOrAdmin(req, existing.rows[0].userId)) {
      return res.status(403).json({ message: 'Not allowed to delete this FIR record' });
    }

    await query('DELETE FROM firs WHERE id = $1', [req.params.id]);
    res.json({ message: 'FIR deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit FIR (change status and generate application number)
router.post('/:id/submit', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const existing = await query(
      'SELECT id, user_id AS "userId" FROM firs WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'FIR not found' });
    }
    if (!ownerOrAdmin(req, existing.rows[0].userId)) {
      return res.status(403).json({ message: 'Not allowed to submit this FIR record' });
    }

    const result = await query(
      `UPDATE firs
       SET status = 'Incident Logged', application_number = $1, is_draft = FALSE, updated_at = NOW()
       WHERE id = $2
       RETURNING id AS "_id", user_id AS "userId", incident_type AS "incidentType",
                 incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
                 contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
                 suspect_details AS "suspectDetails", evidence, status,
                 application_number AS "applicationNumber", created_at AS "createdAt",
                 updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"`,
      [`APP${Date.now()}`, req.params.id]
    );

    res.json(mapFir(result.rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate FIR PDF and store URL in DB
router.post('/:id/pdf', auth(['user', 'admin', 'editor']), async (req, res) => {
  try {
    const found = await query(
      `SELECT id AS "_id", user_id AS "userId", incident_type AS "incidentType",
              incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
              contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
              suspect_details AS "suspectDetails", evidence, status,
              application_number AS "applicationNumber", created_at AS "createdAt",
              updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"
       FROM firs WHERE id = $1`,
      [req.params.id]
    );

    const fir = found.rows[0];
    if (!fir) return res.status(404).json({ message: 'FIR not found' });
    if (!ownerOrAdmin(req, fir.userId)) {
      return res.status(403).json({ message: 'Not allowed to generate PDF for this FIR record' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const pdfUrl = await generateFirPdf(mapFir(fir), baseUrl);

    const updated = await query(
      `UPDATE firs SET pdf_url = $1, updated_at = NOW() WHERE id = $2
       RETURNING id AS "_id", user_id AS "userId", incident_type AS "incidentType",
                incident_date AS "incidentDate", location, estimated_loss AS "estimatedLoss",
                contact_details AS "contactDetails", incident_narrative AS "incidentNarrative",
                suspect_details AS "suspectDetails", evidence, status,
                application_number AS "applicationNumber", created_at AS "createdAt",
                updated_at AS "updatedAt", is_draft AS "isDraft", pdf_url AS "pdfUrl"`,
      [pdfUrl, req.params.id]
    );

    return res.json(mapFir(updated.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
});

module.exports = router;
