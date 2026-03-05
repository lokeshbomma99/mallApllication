const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name:     { type: String, required: true },
  image:    { type: String, default: '' },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:        [orderItemSchema],
  shippingAddress: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    country: { type: String, required: true },
    zip:     { type: String, required: true },
  },
  paymentMethod:  { type: String, default: 'cod' },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  },
  statusHistory: [{
    status:    { type: String },
    updatedAt: { type: Date, default: Date.now },
    note:      { type: String, default: '' },
  }],
  couponCode:   { type: String, default: '' },
  discount:     { type: Number, default: 0 },
  subtotal:     { type: Number, required: true },
  shippingFee:  { type: Number, default: 0 },
  total:        { type: Number, required: true },
  loyaltyPointsEarned: { type: Number, default: 0 },
  notes:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
