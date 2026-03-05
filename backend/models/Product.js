const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  salePrice:   { type: Number, default: null },
  images:      [{ type: String }],
  category:    { type: String, required: true },
  subCategory: { type: String, default: '' },
  stock:       { type: Number, default: 0 },
  sku:         { type: String, default: '' },
  tags:        [{ type: String }],
  specifications: [{ key: String, value: String }],
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  sold:        { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  flashSale: {
    active:    { type: Boolean, default: false },
    discount:  { type: Number, default: 0 },
    endsAt:    { type: Date, default: null },
  },
  loyaltyPoints: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
