require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../db");

async function main() {
  const [empId, name, password] = process.argv.slice(2);
  if (!empId || !name || !password) {
    console.log(
      'Usage: npm run create-admin -- <empId> "<Full Name>" <password>',
    );
    return;
  }

  await db.initDb();
  const hash = await bcrypt.hash(password, 10);

  // If the employee ID already exists, update it instead of failing.
  await db.query(
    `INSERT INTO users (emp_id, name, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (emp_id) DO UPDATE SET name = $2, password = $3, role = 'admin'`,
    [empId, name, hash],
  );
  console.log(`✅ Admin "${empId}" is ready. You can log in now.`);
}

main()
  .catch((err) => console.error("❌", err.message))
  .finally(() => db.pool.end());
