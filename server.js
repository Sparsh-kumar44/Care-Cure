require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');

const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Bill = require('./models/Bill');

const app = express();

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const billRoutes = require('./routes/billRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/bill', billRoutes);

// Login
app.get('/', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

// Dashboard
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const totalMeds = await Medicine.countDocuments();
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const expiredMeds = await Medicine.countDocuments({ expiry: { $lt: new Date() } });
  const medicines = await Medicine.find().sort({ _id: -1 }).limit(5);
  res.render('dashboard', {
    user: req.session.user,
    totalMeds,
    expiredMeds,
    totalEmployees,
    medicines
  });
});

// Medicines
app.get('/medicines', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const medicines = await Medicine.find();
  res.render('medicines', { medicines, user: req.session.user });
});

// Employees
app.get('/employees', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const employees = await User.find({ role: 'employee' });
  res.render('employees', {
    employees,
    user: req.session.user,
    error: req.query.error || null
  });
});

// Billing Page
app.get('/billing', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('billing', { user: req.session.user });
});

// Bill History Page
app.get('/bills', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const bills = await Bill.find().sort({ createdAt: -1 });
  res.render('bills', { bills, user: req.session.user });
});

// Print Bill Page
app.get('/print-bill/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const bill = await Bill.findById(req.params.id);
  res.render('print-bill', { bill });
});

// Edit Medicine Page
app.get('/edit-med/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const med = await Medicine.findById(req.params.id);
  res.render('edit-med', { med });
});

// Update Medicine
app.post('/edit-med/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { name, strips, tabletsPerStrip, expiry, price } = req.body;
  await Medicine.findByIdAndUpdate(req.params.id, {
    name,
    strips: Number(strips),
    tabletsPerStrip: Number(tabletsPerStrip),
    expiry,
    price: Number(price)
  });
  res.redirect('/medicines');
});

// Delete Medicine
app.delete('/delete-med/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  await Medicine.findByIdAndDelete(req.params.id);
  res.redirect('/medicines');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));