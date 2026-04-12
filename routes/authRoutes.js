const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  try {
    const { empId, password } = req.body;

    console.log("👉 LOGIN INPUT:", empId);

    const allUsers = await User.find();
    console.log("👉 USERS IN DB:", allUsers);

    const user = await User.findOne({ empId });
    console.log("👉 FOUND USER:", user);

    if (!user) return res.redirect('/?error=User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.redirect('/?error=Wrong password');

    req.session.user = user.toObject();
    res.redirect('/dashboard');

  } catch (err) {
    console.error(err);
    res.redirect('/?error=Something went wrong');
  }
});

// Verify current logged-in user's password (used by delete modals)
router.post('/verify-password', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.json({ valid: false });
    }
    const { password } = req.body;
    if (!password) return res.json({ valid: false });

    // Find by empId — reliable regardless of how session was stored
    const user = await User.findOne({ empId: req.session.user.empId });
    if (!user) return res.json({ valid: false });

    const valid = await bcrypt.compare(password, user.password);
    res.json({ valid });
  } catch (err) {
    console.error('verify-password error:', err);
    res.json({ valid: false });
  }
});

module.exports = router;