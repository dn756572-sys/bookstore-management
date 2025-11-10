const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getAllCategories);
router.get('/stats', auth, authorize('Admin', 'QuanLy'), getCategoryStats);
router.get('/:id', getCategoryById);

// Protected routes
router.post('/', auth, authorize('Admin', 'QuanLy'), validateCategory, createCategory);
router.put('/:id', auth, authorize('Admin', 'QuanLy'), validateCategory, updateCategory);
router.delete('/:id', auth, authorize('Admin', 'QuanLy'), deleteCategory);

module.exports = router;