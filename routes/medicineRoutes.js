// Medicine stock.   Mounted at /api/medicines
const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { httpError, parseId } = require('../utils/http');

const router = express.Router();
router.use(requireLogin);

// Column list shared by every query. "AS" renames snake_case columns to the camelCase React expects.
const COLUMNS = 'id, name, strips, tablets_per_strip AS "tabletsPerStrip", expiry, price';

// Check the form data and turn the strings into numbers.
function readMedicine(body) {
  const medicine = {
    name: String(body.name || '').trim(),
    strips: Number(body.strips),
    tabletsPerStrip: Number(body.tabletsPerStrip),
    expiry: body.expiry,
    price: Number(body.price)
  };
  const valid =
    medicine.name &&
    medicine.expiry &&
    medicine.strips >= 0 &&
    Number.isInteger(medicine.tabletsPerStrip) && medicine.tabletsPerStrip >= 1 &&
    medicine.price >= 0;
  if (!valid) throw httpError(400, 'Please fill all medicine fields correctly.');
  return medicine;
}

router.get('/', async (req, res) => {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM medicines ORDER BY id`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const m = readMedicine(req.body);
  const { rows } = await db.query(
    `INSERT INTO medicines (name, strips, tablets_per_strip, expiry, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [m.name, m.strips, m.tabletsPerStrip, m.expiry, m.price]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const m = readMedicine(req.body);
  const { rows } = await db.query(
    `UPDATE medicines
     SET name = $1, strips = $2, tablets_per_strip = $3, expiry = $4, price = $5
     WHERE id = $6
     RETURNING ${COLUMNS}`,
    [m.name, m.strips, m.tabletsPerStrip, m.expiry, m.price, id]
  );
  if (!rows[0]) throw httpError(404, 'Medicine not found.');
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM medicines WHERE id = $1', [parseId(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
