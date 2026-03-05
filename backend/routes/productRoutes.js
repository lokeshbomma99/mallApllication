const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

r.get('/', ctrl.getProducts);
r.get('/recently-viewed', protect, ctrl.getRecentlyViewed);
r.get('/:id', ctrl.getProduct);
r.get('/:id/recommendations', ctrl.getRecommendations);
r.post('/:id/view', protect, ctrl.trackView);
r.post('/', protect, authorize('shopowner', 'admin'), ctrl.createProduct);
r.put('/:id', protect, authorize('shopowner', 'admin'), ctrl.updateProduct);
r.delete('/:id', protect, authorize('shopowner', 'admin'), ctrl.deleteProduct);

module.exports = r;
