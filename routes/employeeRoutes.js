// Employees (users with role "employee").   Mounted at /api/employees
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { requireLogin, requireAdmin } = require("../middleware/auth");
const { httpError, parseId } = require("../utils/http");

const router = express.Router();
router.use(requireLogin);

const COLUMNS = 'id, emp_id AS "empId", name, role';

router.get("/", async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM users WHERE role = 'employee' ORDER BY name`,
  );
  res.json(rows);
});

router.post("/", requireAdmin, async (req, res) => {
  const { empId, name, password } = req.body;
  if (!empId || !name || !password)
    throw httpError(400, "All fields are required.");

  const existing = await db.query("SELECT 1 FROM users WHERE emp_id = $1", [
    empId,
  ]);
  if (existing.rowCount > 0)
    throw httpError(409, "Employee ID already exists.");

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (emp_id, name, password, role)
     VALUES ($1, $2, $3, 'employee')
     RETURNING ${COLUMNS}`,
    [empId, name, hash],
  );
  res.status(201).json(rows[0]);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  // role = 'employee' makes sure an admin account can never be deleted here.
  await db.query(`DELETE FROM users WHERE id = $1 AND role = 'employee'`, [
    parseId(req.params.id),
  ]);
  res.json({ success: true });
});

module.exports = router;
