const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query, withTransaction } = require('../db');

const mapUser = (row) => ({
  _id: row._id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  isBlocked: row.isBlocked,
  isOnline: row.isOnline,
  lastActive: row.lastActive,
  applicationStatus: row.applicationStatus,
  activityLog: row.activityLog || [],
  createdAt: row.createdAt
});

// Get all users (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", name, email, phone,
              is_blocked AS "isBlocked", is_online AS "isOnline",
              last_active AS "lastActive", application_status AS "applicationStatus",
              activity_log AS "activityLog", created_at AS "createdAt"
       FROM users
       ORDER BY created_at DESC`
    );
    const users = result.rows.map(mapUser);
    const total = users.length;
    const active = users.filter(u => u.isOnline).length;
    res.json({ users, total, active });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Update user status (block/unblock)
router.put('/:id/block', auth(['admin']), async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const result = await query(
      `UPDATE users
       SET is_blocked = $1, last_active = NOW()
       WHERE id = $2
       RETURNING id AS "_id", name, email, phone,
                 is_blocked AS "isBlocked", is_online AS "isOnline",
                 last_active AS "lastActive", application_status AS "applicationStatus",
                 activity_log AS "activityLog", created_at AS "createdAt"`,
      [!!isBlocked, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Permanently ban user: archive a minimal audit record, then delete the user data.
router.delete('/:id/permanent-ban', auth(['admin']), async (req, res) => {
  try {
    const { reason = null } = req.body || {};

    const existing = await query(
      `SELECT id, name, email, phone
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    const user = existing.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO banned_users (user_id, name, email, phone, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, user.name, user.email, user.phone, reason]
      );
      await client.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    });

    res.json({ message: 'User permanently banned and deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error permanently banning user', error: err.message });
  }
});

// Update application status
router.put('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { applicationStatus } = req.body;
    const result = await query(
      `UPDATE users
       SET application_status = $1, last_active = NOW()
       WHERE id = $2
       RETURNING id AS "_id", name, email, phone,
                 is_blocked AS "isBlocked", is_online AS "isOnline",
                 last_active AS "lastActive", application_status AS "applicationStatus",
                 activity_log AS "activityLog", created_at AS "createdAt"`,
      [applicationStatus, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// Clear activity log
router.delete('/:id/activity', auth(['admin']), async (req, res) => {
  try {
    const result = await query(
      `UPDATE users
       SET activity_log = '[]'::jsonb, last_active = NOW()
       WHERE id = $1
       RETURNING id AS "_id", name, email, phone,
                 is_blocked AS "isBlocked", is_online AS "isOnline",
                 last_active AS "lastActive", application_status AS "applicationStatus",
                 activity_log AS "activityLog", created_at AS "createdAt"`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error clearing activity', error: err.message });
  }
});

// Add activity log entry
router.post('/:id/activity', auth(['admin']), async (req, res) => {
  try {
    const { action, details } = req.body;
    const existing = await query(
      `SELECT activity_log AS "activityLog"
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
    const row = existing.rows[0];
    if (!row) return res.status(404).json({ message: 'User not found' });

    const nextLog = Array.isArray(row.activityLog) ? row.activityLog : [];
    nextLog.push({ action, details, timestamp: new Date().toISOString() });

    const updated = await query(
      `UPDATE users
       SET activity_log = $1::jsonb, last_active = NOW()
       WHERE id = $2
       RETURNING id AS "_id", name, email, phone,
                 is_blocked AS "isBlocked", is_online AS "isOnline",
                 last_active AS "lastActive", application_status AS "applicationStatus",
                 activity_log AS "activityLog", created_at AS "createdAt"`,
      [JSON.stringify(nextLog), req.params.id]
    );

    res.json(mapUser(updated.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error adding activity', error: err.message });
  }
});

module.exports = router;
