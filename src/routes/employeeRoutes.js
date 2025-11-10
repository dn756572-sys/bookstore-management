const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('Admin', 'QuanLy'), getEmployeeStats);
router.get('/:id', auth, authorize('Admin', 'QuanLy'), getEmployeeById);

// Protected routes - only Admin can manage employees
router.get('/', auth, authorize('Admin', 'QuanLy'), getAllEmployees);
router.post('/', auth, authorize('Admin'), createEmployee);
router.put('/:id', auth, authorize('Admin'), updateEmployee);
router.delete('/:id', auth, authorize('Admin'), deleteEmployee);

module.exports = router;