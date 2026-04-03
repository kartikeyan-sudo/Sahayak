const express = require('express');
const auth = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();

function mapFir(row) {
  return {
    _id: row._id,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    incidentType: row.incidentType,
    incidentDate: row.incidentDate,
    location: row.location,
    estimatedLoss: Number(row.estimatedLoss),
    status: row.status,
    applicationNumber: row.applicationNumber,
    isDraft: row.isDraft,
    pdfUrl: row.pdfUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

router.get('/', auth(['admin', 'editor']), async (req, res) => {
  try {
    const result = await query(
      `SELECT f.id AS "_id", f.user_id AS "userId", u.name AS "userName", u.email AS "userEmail",
              f.incident_type AS "incidentType", f.incident_date AS "incidentDate", f.location,
              f.estimated_loss AS "estimatedLoss", f.status,
              f.application_number AS "applicationNumber", f.is_draft AS "isDraft", f.pdf_url AS "pdfUrl",
              f.created_at AS "createdAt", f.updated_at AS "updatedAt"
       FROM firs f
       LEFT JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC`
    );

    return res.json(result.rows.map(mapFir));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch FIR records', error: error.message });
  }
});

module.exports = router;
