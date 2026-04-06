const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  empId: String,
  name: String,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  }
});

// 🔥 FIX: prevent overwrite error
module.exports = mongoose.models.User || mongoose.model('User', userSchema);