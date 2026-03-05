const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

r.post('/', protect, authorize('customer'), ctrl.createOrder);
r.get('/my', protect, ctrl.getMyOrders);
r.get('/shop/:shopId', protect, authorize('shopowner', 'admin'), ctrl.getShopOrders);
r.get('/analytics/:shopId', protect, authorize('shopowner', 'admin'), ctrl.getShopAnalytics);
r.get('/:id', protect, ctrl.getOrder);
r.put('/:id/status', protect, authorize('shopowner', 'admin'), ctrl.updateOrderStatus);

module.exports = r;
