require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));

const clientDist = path.join(__dirname, "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err)
      res.status(404).send('Frontend not built. Run "npm run build" first.');
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res
    .status(status)
    .json({ error: status === 500 ? "Something went wrong." : err.message });
});

const PORT = 3000;

db.initDb()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ Database error:", err.message);
    process.exit(1);
  });
