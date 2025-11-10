const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  getCustomerStats
} = require('../controllers/customerController');
const { validateRegister } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('Admin', 'QuanLy'), getCustomerStats);
router.get('/:id', auth, authorize('Admin', 'QuanLy'), getCustomerById);

// Protected routes
router.get('/', auth, authorize('Admin', 'QuanLy'), getAllCustomers);
router.post('/', auth, authorize('Admin', 'QuanLy'), validateRegister, createCustomer);
router.put('/:id', auth, authorize('Admin', 'QuanLy'), updateCustomer);
router.patch('/:id/status', auth, authorize('Admin', 'QuanLy'), updateCustomerStatus);

module.exports = router;