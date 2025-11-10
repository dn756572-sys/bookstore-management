const express = require('express');
const router = express.Router();
const {
  getPaymentByOrderId,
  updatePaymentStatus,
  getPaymentStats,
  createPayment
} = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('Admin', 'QuanLy'), getPaymentStats);
router.get('/order/:orderId', auth, getPaymentByOrderId);

// Protected routes
router.post('/order/:orderId', auth, createPayment);
router.patch('/order/:orderId/status', auth, authorize('Admin', 'QuanLy', 'NhanVien'), updatePaymentStatus);

module.exports = router;