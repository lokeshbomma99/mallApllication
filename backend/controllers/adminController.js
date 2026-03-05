const mongoose = require('mongoose');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Review } = require('../models/index');

// @GET /api/admin/stats — overall platform stats
const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers, totalShops, totalProducts, totalOrders,
      thisMonthUsers, lastMonthUsers,
      thisMonthOrders, lastMonthOrders,
      revenueData, pendingShops, bannedUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      Shop.countDocuments({ status: 'approved' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Shop.countDocuments({ status: 'pending' }),
      User.countDocuments({ isBanned: true }),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    const userGrowth = lastMonthUsers > 0 ? (((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1) : 0;
    const orderGrowth = lastMonthOrders > 0 ? (((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 0;

    res.json({
      totalUsers, totalShops, totalProducts, totalOrders, totalRevenue,
      pendingShops, bannedUsers,
      growth: { users: userGrowth, orders: orderGrowth },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/revenue — monthly revenue chart data
const getRevenueChart = async (req, res) => {
  try {
    const months = 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = data.map(d => ({
      month: monthNames[d._id.month - 1],
      revenue: d.revenue,
      orders: d.orders,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/category-stats — sales by category
const getCategoryStats = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productInfo.category',
          value: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
      { $project: { name: '$_id', value: 1, revenue: 1, _id: 0 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/top-shops — top shops by revenue
const getTopShops = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.shop',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: '_id',
          as: 'shopInfo',
        },
      },
      { $unwind: { path: '$shopInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$shopInfo.name', revenue: 1, orders: 1, _id: 0 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/recent-orders — last 10 orders
const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/user-growth — daily new users (last 30 days)
const getUserGrowth = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlatformStats, getRevenueChart, getCategoryStats, getTopShops, getRecentOrders, getUserGrowth };
