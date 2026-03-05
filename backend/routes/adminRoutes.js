const express = require('express');
const r = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getPlatformStats, getRevenueChart, getCategoryStats, getTopShops, getRecentOrders, getUserGrowth } = require('../controllers/adminController');

r.get('/stats',          protect, authorize('admin'), getPlatformStats);
r.get('/revenue',        protect, authorize('admin'), getRevenueChart);
r.get('/category-stats', protect, authorize('admin'), getCategoryStats);
r.get('/top-shops',      protect, authorize('admin'), getTopShops);
r.get('/recent-orders',  protect, authorize('admin'), getRecentOrders);
r.get('/user-growth',    protect, authorize('admin'), getUserGrowth);

module.exports = r;
