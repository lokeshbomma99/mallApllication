const mongoose = require('mongoose');

// ─── Review ───────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, default: '' },
  images:   [{ type: String }],
}, { timestamps: true });
const Review = mongoose.model('Review', reviewSchema);

// ─── Cart ─────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
  price:    { type: Number },
});
const cartSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
}, { timestamps: true });
const Cart = mongoose.model('Cart', cartSchema);

// ─── Wishlist ─────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// ─── Coupon ───────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true },
  type:         { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value:        { type: Number, required: true },
  minOrder:     { type: Number, default: 0 },
  maxDiscount:  { type: Number, default: null },
  usageLimit:   { type: Number, default: null },
  usedCount:    { type: Number, default: 0 },
  expiresAt:    { type: Date, required: true },
  isActive:     { type: Boolean, default: true },
  shop:         { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const Coupon = mongoose.model('Coupon', couponSchema);

// ─── Chat ─────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
const chatSchema = new mongoose.Schema({
  roomId:    { type: String, required: true, unique: true },
  customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shop:      { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  messages:  [messageSchema],
}, { timestamps: true });
const Chat = mongoose.model('Chat', chatSchema);

// ─── Category ─────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  icon:        { type: String, default: '' },
  image:       { type: String, default: '' },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });
const Category = mongoose.model('Category', categorySchema);

// ─── Banner ───────────────────────────────────────────────
const bannerSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  subtitle:  { type: String, default: '' },
  image:     { type: String, required: true },
  link:      { type: String, default: '' },
  position:  { type: String, enum: ['hero', 'middle', 'bottom'], default: 'hero' },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const Banner = mongoose.model('Banner', bannerSchema);

// ─── Return ───────────────────────────────────────────────
const returnSchema = new mongoose.Schema({
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  reason:   { type: String, required: true },
  images:   [{ type: String }],
  status:   { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  note:     { type: String, default: '' },
  refundAmount: { type: Number, default: 0 },
}, { timestamps: true });
const Return = mongoose.model('Return', returnSchema);

// ─── Notification ─────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['order', 'chat', 'promo', 'system', 'return'], default: 'system' },
  link:    { type: String, default: '' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Review, Cart, Wishlist, Coupon, Chat, Category, Banner, Return, Notification };
