const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Get all medicines for bill form
router.get('/medicines-list', auth, async (req, res) => {
  try {
    const meds = await Medicine.find({}, 'name strips tabletsPerStrip price medId');
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load medicines.' });
  }
});

// Generate bill + update stock (TABLET based)
router.post('/generate', auth, async (req, res) => {
  try {
    const { patientName, patientAge, patientPhone, patientGender, items } = req.body;

    if (!patientName || !patientAge || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let grandTotal = 0;
    const billItems = [];

    for (const item of items) {
      const tablets = Number(item.tablets);

      if (!item.medicineId || !tablets || tablets < 1) continue;

      const med = await Medicine.findById(item.medicineId);
      if (!med) {
        return res.status(404).json({ error: 'Medicine not found. Please refresh and try again.' });
      }

      const totalAvailableTablets = med.strips * med.tabletsPerStrip;

      if (tablets > totalAvailableTablets) {
        return res.status(400).json({
          error: `Not enough tablets for "${med.name}". Requested: ${tablets}, Available: ${totalAvailableTablets}`
        });
      }

      const pricePerTablet = med.price / med.tabletsPerStrip;
      const total = parseFloat((tablets * pricePerTablet).toFixed(2));
      grandTotal += total;

      // Deduct: how many full strips used (ceiling)
      const stripsToDeduct = Math.ceil(tablets / med.tabletsPerStrip);
      med.strips = Math.max(0, med.strips - stripsToDeduct);
      await med.save();

      billItems.push({
        medicineId: med._id,
        name: med.name,
        tablets: tablets,
        tabletsPerStrip: med.tabletsPerStrip,
        pricePerTablet: parseFloat(pricePerTablet.toFixed(2)),
        total
      });
    }

    if (billItems.length === 0) {
      return res.status(400).json({ error: 'No valid medicines added to bill.' });
    }

    // Fix: get generatedBy safely from session
    const generatedBy = req.session.user.name || req.session.user.empId || 'Unknown';

    const bill = await Bill.create({
      patientName,
      patientAge: Number(patientAge),
      patientPhone: patientPhone || '',
      patientGender: patientGender || '',
      items: billItems,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      generatedBy
    });

    res.json({ success: true, billNo: bill.billNo, billId: bill._id });

  } catch (err) {
    console.error('Bill generation error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Delete bill (admin only)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bill.' });
  }
});

// Get single bill for print
router.get('/:id', auth, async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  res.json(bill);
});

module.exports = router;