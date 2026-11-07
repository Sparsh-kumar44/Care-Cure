const fs = require("fs");
const path = require("path");
const { Pool, types } = require("pg");

types.setTypeParser(types.builtins.NUMERIC, parseFloat);
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value, 10));
types.setTypeParser(types.builtins.DATE, (value) => value);

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Set DATABASE_URL (or DATABASE_URL_POOLED) in your .env file.",
  );
}

const pool = new Pool({ connectionString });

const query = (text, params) => pool.query(text, params);

// Create the tables if they do not exist yet.
async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
}

module.exports = { pool, query, initDb };
