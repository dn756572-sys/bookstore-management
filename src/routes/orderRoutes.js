const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getCustomerOrders,
  getOrderStats
} = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('Admin', 'QuanLy'), getOrderStats);
router.get('/my-orders', auth, getCustomerOrders);
router.get('/:id', auth, getOrderById);

// Protected routes
router.get('/', auth, authorize('Admin', 'QuanLy', 'NhanVien'), getAllOrders);
router.post('/', auth, validateOrder, createOrder);
router.patch('/:id/status', auth, authorize('Admin', 'QuanLy', 'NhanVien'), updateOrderStatus);

module.exports = router;