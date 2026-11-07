// Bills.   Mounted at /api/bills
const express = require('express');
const db = require('../db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { httpError, parseId } = require('../utils/http');

const router = express.Router();
router.use(requireLogin);

// A bill plus its items (as a JSON list), in the shape React expects.
const BILL_SELECT = `
  SELECT
    b.id,
    b.bill_no        AS "billNo",
    b.patient_name   AS "patientName",
    b.patient_age    AS "patientAge",
    b.patient_phone  AS "patientPhone",
    b.patient_gender AS "patientGender",
    b.grand_total    AS "grandTotal",
    b.generated_by   AS "generatedBy",
    b.created_at     AS "createdAt",
    COALESCE((
      SELECT json_agg(json_build_object(
        'medicineId',      i.medicine_id,
        'name',            i.name,
        'tablets',         i.tablets,
        'tabletsPerStrip', i.tablets_per_strip,
        'pricePerTablet',  i.price_per_tablet,
        'total',           i.total
      ) ORDER BY i.id)
      FROM bill_items i
      WHERE i.bill_id = b.id
    ), '[]'::json) AS items
  FROM bills b
`;

const round2 = (n) => Math.round(n * 100) / 100;

router.get('/', async (req, res) => {
  const { rows } = await db.query(`${BILL_SELECT} ORDER BY b.created_at DESC`);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query(`${BILL_SELECT} WHERE b.id = $1`, [parseId(req.params.id)]);
  if (!rows[0]) throw httpError(404, 'Bill not found.');
  res.json(rows[0]);
});

// Create a bill and take the sold tablets out of stock.
// Everything happens in ONE transaction: if anything fails, nothing is saved.
router.post('/', async (req, res) => {
  const { patientName, patientAge, patientPhone, patientGender, items } = req.body;
  if (!patientName || !patientAge || !Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Missing required fields.');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [bill] } = await client.query(
      `INSERT INTO bills (patient_name, patient_age, patient_phone, patient_gender, generated_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, bill_no`,
      [patientName, Number(patientAge), patientPhone || '', patientGender || '', req.user.name]
    );

    let grandTotal = 0;
    for (const item of items) {
      const tablets = Number(item.tablets);
      if (!Number.isInteger(tablets) || tablets < 1) continue;

      // FOR UPDATE locks the row so two bills cannot sell the same tablets at once.
      const { rows: [med] } = await client.query(
        'SELECT id, name, strips, tablets_per_strip, price FROM medicines WHERE id = $1 FOR UPDATE',
        [Number(item.medicineId)]
      );
      if (!med) throw httpError(404, 'Medicine not found. Refresh the page.');

      const available = Math.round(med.strips * med.tablets_per_strip);
      if (tablets > available) {
        throw httpError(400, `Not enough tablets for "${med.name}". Requested: ${tablets}, Available: ${available}`);
      }

      const pricePerTablet = med.price / med.tablets_per_strip;
      const total = round2(tablets * pricePerTablet);
      grandTotal += total;

      await client.query(
        `INSERT INTO bill_items (bill_id, medicine_id, name, tablets, tablets_per_strip, price_per_tablet, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bill.id, med.id, med.name, tablets, med.tablets_per_strip, round2(pricePerTablet), total]
      );

      // Stock is kept as strips, so convert the remaining tablets back to strips.
      await client.query('UPDATE medicines SET strips = $1 WHERE id = $2', [
        (available - tablets) / med.tablets_per_strip,
        med.id
      ]);
    }

    if (grandTotal === 0) throw httpError(400, 'No valid medicines added.');

    await client.query('UPDATE bills SET grand_total = $1 WHERE id = $2', [round2(grandTotal), bill.id]);
    await client.query('COMMIT');

    res.status(201).json({ success: true, billNo: bill.bill_no, billId: bill.id });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await db.query('DELETE FROM bills WHERE id = $1', [parseId(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
