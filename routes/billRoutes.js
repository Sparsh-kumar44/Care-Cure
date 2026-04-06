const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Medicine = require('../models/Medicine');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Get all medicines
router.get('/medicines-list', auth, async (req, res) => {
  try {
    const meds = await Medicine.find({}, 'name strips tabletsPerStrip price medId');
    res.json(meds);
  } catch (err) {
    console.error('Medicine list error:', err);
    res.status(500).json({ error: 'Failed to load medicines.' });
  }
});

// Generate bill
router.post('/generate', auth, async (req, res) => {
  try {
    const { patientName, patientAge, patientPhone, patientGender, items } = req.body;

    // ✅ Validation
    if (!patientName || !patientAge || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let grandTotal = 0;
    const billItems = [];

    for (const item of items) {
      const tablets = Number(item.tablets);

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(item.medicineId)) {
        return res.status(400).json({ error: 'Invalid medicine ID' });
      }

      if (!item.medicineId || !tablets || tablets < 1) continue;

      const med = await Medicine.findById(item.medicineId);

      if (!med) {
        return res.status(404).json({ error: 'Medicine not found. Refresh page.' });
      }

      const totalAvailable = med.strips * med.tabletsPerStrip;

      if (tablets > totalAvailable) {
        return res.status(400).json({
          error: `Not enough tablets for "${med.name}". Requested: ${tablets}, Available: ${totalAvailable}`
        });
      }

      const pricePerTablet = med.price / med.tabletsPerStrip;
      const total = parseFloat((tablets * pricePerTablet).toFixed(2));

      grandTotal += total;

      // Deduct stock
      const stripsToDeduct = Math.ceil(tablets / med.tabletsPerStrip);
      med.strips = Math.max(0, med.strips - stripsToDeduct);
      await med.save();

      billItems.push({
        medicineId: med._id,
        name: med.name,
        tablets,
        tabletsPerStrip: med.tabletsPerStrip,
        pricePerTablet: parseFloat(pricePerTablet.toFixed(2)),
        total
      });
    }

    if (billItems.length === 0) {
      return res.status(400).json({ error: 'No valid medicines added.' });
    }

    // ✅ SAFE SESSION ACCESS
    const generatedBy =
      req.session?.user?.name ||
      req.session?.user?.empId ||
      'Unknown';

    // ✅ Handle duplicate billNo
    let bill;
    try {
      bill = await Bill.create({
        patientName,
        patientAge: Number(patientAge),
        patientPhone: patientPhone || '',
        patientGender: patientGender || '',
        items: billItems,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        generatedBy
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(500).json({ error: 'Duplicate bill number. Try again.' });
      }
      throw err;
    }

    res.json({
      success: true,
      billNo: bill.billNo,
      billId: bill._id
    });

  } catch (err) {
    console.error('🔥 Bill generation error:', err);
    res.status(500).json({
      error: 'Server error: ' + err.message
    });
  }
});

// Delete bill
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bill.' });
  }
});

// Get single bill
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bill.' });
  }
});

module.exports = router;