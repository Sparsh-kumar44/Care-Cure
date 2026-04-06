const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medId: {
    type: Number,
    unique: true
  },
  name: String,
  strips: Number,
  tabletsPerStrip: Number,
  expiry: Date,
  price: Number
});

// Virtual: total tablets
medicineSchema.virtual('totalTablets').get(function() {
  return this.strips * this.tabletsPerStrip;
});

medicineSchema.pre('save', async function() {
  if (!this.medId) {
    const last = await mongoose.model('Medicine')
      .findOne()
      .sort({ medId: -1 });
    this.medId = last ? last.medId + 1 : 1;
  }
});

module.exports = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);