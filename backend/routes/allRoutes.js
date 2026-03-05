// wishlistRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { Wishlist, Chat, Coupon, Category, Banner, Return, Notification } = require('../models/index');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

// ── Wishlist ──────────────────────────────────────────────
const wishlistRouter = express.Router();
wishlistRouter.get('/', protect, async (req, res) => {
  const w = await Wishlist.findOne({ user: req.user._id }).populate({ path: 'products', populate: { path: 'shop', select: 'name logo' } });
  res.json(w?.products || []);
});
wishlistRouter.post('/toggle/:productId', protect, async (req, res) => {
  let w = await Wishlist.findOne({ user: req.user._id });
  if (!w) w = new Wishlist({ user: req.user._id, products: [] });
  const idx = w.products.indexOf(req.params.productId);
  if (idx > -1) w.products.splice(idx, 1);
  else w.products.push(req.params.productId);
  await w.save();
  res.json({ wishlisted: idx === -1 });
});
module.exports.wishlistRouter = wishlistRouter;

// ── Shop ──────────────────────────────────────────────────
const shopRouter = express.Router();
shopRouter.get('/', async (req, res) => {
  const { status = 'approved', category, page = 1, limit = 12 } = req.query;
  const query = { status };
  if (category) query.category = category;
  const skip = (page - 1) * limit;
  const [shops, total] = await Promise.all([Shop.find(query).skip(skip).limit(Number(limit)), Shop.countDocuments(query)]);
  res.json({ shops, total, pages: Math.ceil(total / limit) });
});
shopRouter.get('/my', protect, authorize('shopowner'), async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  res.json(shop);
});
shopRouter.post('/', protect, authorize('shopowner'), async (req, res) => {
  const existing = await Shop.findOne({ owner: req.user._id });
  if (existing) return res.status(400).json({ message: 'You already have a shop' });
  const shop = await Shop.create({ ...req.body, owner: req.user._id });
  res.status(201).json(shop);
});
shopRouter.put('/:id', protect, authorize('shopowner', 'admin'), async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(shop);
});
shopRouter.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  res.json(shop);
});
shopRouter.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: req.body.reason }, { new: true });
  res.json(shop);
});
shopRouter.get('/:id', async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
  res.json(shop);
});
module.exports.shopRouter = shopRouter;

// ── User ──────────────────────────────────────────────────
const userRouter = express.Router();
userRouter.get('/', protect, authorize('admin'), async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([User.find(query).select('-password').skip(skip).limit(Number(limit)), User.countDocuments(query)]);
  res.json({ users, total, pages: Math.ceil(total / limit) });
});
userRouter.put('/:id/ban', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: req.body.reason }, { new: true }).select('-password');
  res.json(user);
});
userRouter.put('/:id/unban', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: '' }, { new: true }).select('-password');
  res.json(user);
});
module.exports.userRouter = userRouter;

// ── Review ────────────────────────────────────────────────
const { Review } = require('../models/index');
const reviewRouter = express.Router();
reviewRouter.get('/product/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate('customer', 'name avatar').sort({ createdAt: -1 });
  res.json(reviews);
});
reviewRouter.post('/', protect, authorize('customer'), async (req, res) => {
  const existing = await Review.findOne({ product: req.body.product, customer: req.user._id });
  if (existing) return res.status(400).json({ message: 'Already reviewed' });
  const review = await Review.create({ ...req.body, customer: req.user._id });
  const reviews = await Review.find({ product: req.body.product });
  const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(req.body.product, { rating: avg.toFixed(1), totalReviews: reviews.length });
  res.status(201).json(review);
});
module.exports.reviewRouter = reviewRouter;

// ── Coupon ────────────────────────────────────────────────
const couponRouter = express.Router();
couponRouter.post('/', protect, authorize('admin', 'shopowner'), async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(coupon);
});
couponRouter.post('/validate', protect, async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });
  if (coupon.expiresAt < new Date()) return res.status(400).json({ message: 'Coupon expired' });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon limit reached' });
  if (req.body.total < coupon.minOrder) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });
  let discount = coupon.type === 'percentage' ? (req.body.total * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ valid: true, discount, coupon });
});
couponRouter.get('/', protect, authorize('admin', 'shopowner'), async (req, res) => {
  const coupons = await Coupon.find({ createdBy: req.user._id });
  res.json(coupons);
});
module.exports.couponRouter = couponRouter;

// ── Chat ──────────────────────────────────────────────────
const chatRouter = express.Router();
chatRouter.get('/:roomId', protect, async (req, res) => {
  const chat = await Chat.findOne({ roomId: req.params.roomId }).populate('messages.sender', 'name avatar');
  res.json(chat || { messages: [] });
});
chatRouter.post('/:roomId/message', protect, async (req, res) => {
  let chat = await Chat.findOne({ roomId: req.params.roomId });
  if (!chat) chat = new Chat({ roomId: req.params.roomId, customer: req.body.customerId, shop: req.body.shopId, messages: [] });
  chat.messages.push({ sender: req.user._id, content: req.body.content });
  await chat.save();
  res.json(chat);
});
module.exports.chatRouter = chatRouter;

// ── Category ──────────────────────────────────────────────
const categoryRouter = express.Router();
categoryRouter.get('/', async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json(cats);
});
categoryRouter.post('/', protect, authorize('admin'), async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
});
categoryRouter.put('/:id', protect, authorize('admin'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cat);
});
categoryRouter.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports.categoryRouter = categoryRouter;

// ── Banner ────────────────────────────────────────────────
const bannerRouter = express.Router();
bannerRouter.get('/', async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json(banners);
});
bannerRouter.post('/', protect, authorize('admin'), async (req, res) => {
  const banner = await Banner.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(banner);
});
bannerRouter.put('/:id', protect, authorize('admin'), async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(banner);
});
bannerRouter.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports.bannerRouter = bannerRouter;

// ── Return ────────────────────────────────────────────────
const returnRouter = express.Router();
returnRouter.post('/', protect, authorize('customer'), async (req, res) => {
  const ret = await Return.create({ ...req.body, customer: req.user._id });
  res.status(201).json(ret);
});
returnRouter.get('/my', protect, async (req, res) => {
  const returns = await Return.find({ customer: req.user._id }).populate('order');
  res.json(returns);
});
returnRouter.get('/shop/:shopId', protect, authorize('shopowner', 'admin'), async (req, res) => {
  const returns = await Return.find({ shop: req.params.shopId }).populate('customer', 'name email').populate('order');
  res.json(returns);
});
returnRouter.put('/:id', protect, authorize('shopowner', 'admin'), async (req, res) => {
  const ret = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ret);
});
module.exports.returnRouter = returnRouter;

// ── Notification ──────────────────────────────────────────
const notifRouter = express.Router();
notifRouter.get('/', protect, async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json(notifs);
});
notifRouter.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ message: 'All read' });
});
notifRouter.put('/:id/read', protect, async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(n);
});
module.exports.notifRouter = notifRouter;
