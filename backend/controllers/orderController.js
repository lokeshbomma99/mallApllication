const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Notification } = require('../models/index');

// @POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, discount, subtotal, shippingFee, total, notes } = req.body;

    const order = await Order.create({
      customer: req.user._id,
      items, shippingAddress, couponCode, discount, subtotal, shippingFee, total, notes,
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
      loyaltyPointsEarned: Math.floor(total / 10),
    });

    // Update stock & sold counts
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Award loyalty points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { loyaltyPoints: order.loyaltyPointsEarned }
    });

    // Notify customer
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed!',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed successfully.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    if (global.io) global.io.to(req.user._id.toString()).emit('order_notification', { type: 'new_order', orderId: order._id });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('items.product', 'name images').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price').populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/status — shop owner / admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    // Notify customer
    await Notification.create({
      user: order.customer,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    if (global.io) global.io.to(order.customer.toString()).emit('order_notification', { type: 'status_update', orderId: order._id, status });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/shop/:shopId — shop owner orders
const getShopOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { 'items.shop': req.params.shopId };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('customer', 'name email').populate('items.product', 'name images').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/analytics/:shopId — shop analytics
const getShopAnalytics = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, recentOrders, topProducts] = await Promise.all([
      Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.shop': require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
        { $group: { _id: null, totalRevenue: { $sum: '$items.price' }, totalOrders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: '$items' },
        { $match: { 'items.shop': require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$items.price' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.shop': require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.price' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({ summary: totalOrders[0] || { totalRevenue: 0, totalOrders: 0 }, recentOrders, topProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus, getShopOrders, getShopAnalytics };
