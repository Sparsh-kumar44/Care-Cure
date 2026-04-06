const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/auth');

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Access denied. Admins only.');
  }
  next();
}

router.post('/add-employee', auth, isAdmin, async (req, res) => {
  try {
    const { empId, name, password } = req.body;
    const existing = await User.findOne({ empId });
    if (existing) return res.redirect('/employees?error=Employee ID already exists');
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ empId, name, password: hashed, role: 'employee' });
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    res.redirect('/employees?error=Something went wrong');
  }
});

router.delete('/delete-employee/:id', auth, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/employees');
});

module.exports = router;