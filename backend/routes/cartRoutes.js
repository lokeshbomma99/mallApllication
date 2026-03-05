// ── cartRoutes.js ─────────────────────────────────────────
const express = require('express');
const { protect } = require('../middleware/auth');
const { Cart } = require('../models/index');

const cartRouter = express.Router();

cartRouter.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { items: [] });
});

cartRouter.post('/add', protect, async (req, res) => {
  const { productId, price, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx > -1) cart.items[idx].quantity += quantity;
  else cart.items.push({ product: productId, price, quantity });
  await cart.save();
  res.json(cart);
});

cartRouter.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.items.find(i => i.product.toString() === productId);
  if (item) item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

cartRouter.delete('/remove/:productId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});

cartRouter.delete('/clear', protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = cartRouter;
