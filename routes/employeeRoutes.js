const express = require('express');
const router = express.Router();

const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

router.post('/add-medicine', auth, async (req, res) => {
  try {
    const { name, strips, tabletsPerStrip, expiry, price } = req.body;

    await Medicine.create({
      name,
      strips: Number(strips),
      tabletsPerStrip: Number(tabletsPerStrip),
      expiry,
      price: Number(price)
    });

    res.redirect('/medicines');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding medicine');
  }
});

router.get('/search', auth, async (req, res) => {
  const query = req.query.q;
  const meds = await Medicine.find({ name: { $regex: query, $options: 'i' } });
  res.json(meds);
});

module.exports = router;