const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  name: String,
  tablets: Number,
  tabletsPerStrip: Number,
  pricePerTablet: Number,
  total: Number
});

const billSchema = new mongoose.Schema({
  billNo: { type: Number, unique: true },
  patientName: String,
  patientAge: Number,
  patientPhone: String,
  patientGender: String,
  items: [billItemSchema],
  grandTotal: Number,
  generatedBy: String,
  createdAt: { type: Date, default: Date.now }
});

billSchema.pre('save', async function() {
  if (!this.billNo) {
    const last = await mongoose.model('Bill').findOne().sort({ billNo: -1 });
    this.billNo = last ? last.billNo + 1 : 1001;
  }
});

module.exports = mongoose.models.Bill || mongoose.model('Bill', billSchema);