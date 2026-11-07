// Numbers shown on the dashboard.   Mounted at /api/dashboard
const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// "Today" starts at midnight India time.
const START_OF_TODAY = `date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'`;

router.get('/', requireLogin, async (req, res) => {
  const stats = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM medicines)                                                   AS "totalMeds",
      (SELECT COUNT(*) FROM medicines WHERE expiry < CURRENT_DATE)                       AS "expiredMeds",
      (SELECT COUNT(*) FROM medicines WHERE expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + 30) AS "expiringSoon",
      (SELECT COUNT(*) FROM users WHERE role = 'employee')                               AS "totalEmployees",
      (SELECT COUNT(*) FROM bills)                                                       AS "totalBills",
      (SELECT COUNT(*) FROM bills WHERE created_at >= ${START_OF_TODAY})                 AS "todaysBillCount",
      (SELECT COALESCE(SUM(grand_total), 0) FROM bills WHERE created_at >= ${START_OF_TODAY}) AS "todaysRevenue"
  `);

  const recent = await db.query(`
    SELECT id, name, strips, tablets_per_strip AS "tabletsPerStrip", expiry, price
    FROM medicines
    ORDER BY id DESC
    LIMIT 5
  `);

  res.json({ ...stats.rows[0], recentMedicines: recent.rows });
});

module.exports = router;
