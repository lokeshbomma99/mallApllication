const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  logo:        { type: String, default: '' },
  banner:      { type: String, default: '' },
  category:    { type: String, required: true },
  email:       { type: String, default: '' },
  phone:       { type: String, default: '' },
  address:     { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  totalSales:  { type: Number, default: 0 },
  totalRevenue:{ type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
