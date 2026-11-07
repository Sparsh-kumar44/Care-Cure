// Login, logout, "who am I" and password re-check.   Mounted at /api/auth
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { httpError } = require('../utils/http');

const router = express.Router();

// Only the safe fields are ever sent to the browser or kept in the session.
const toSessionUser = (u) => ({ id: u.id, empId: u.empId, name: u.name, role: u.role });

router.post('/login', async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) throw httpError(400, 'Enter Employee ID and password.');

  const { rows } = await db.query(
    'SELECT id, emp_id AS "empId", name, role, password FROM users WHERE emp_id = $1',
    [empId]
  );
  const user = rows[0];
  if (!user) throw httpError(401, 'User not found.');
  if (!(await bcrypt.compare(password, user.password))) throw httpError(401, 'Wrong password.');

  req.session.user = toSessionUser(user);
  res.json({ user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/me', (req, res) => {
  res.json({ user: req.session?.user || null });
});

// Used by the "enter your password to edit/delete" pop-ups.
router.post('/verify-password', requireLogin, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.json({ valid: false });

  const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
  const valid = rows[0] ? await bcrypt.compare(password, rows[0].password) : false;
  res.json({ valid });
});

module.exports = router;
