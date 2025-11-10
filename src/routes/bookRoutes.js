const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategory
} = require('../controllers/bookController');
const { validateBook } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/category/:categoryId', getBooksByCategory);

// Protected routes - require authentication
router.post('/', auth, authorize('Admin', 'QuanLy'), validateBook, createBook);
router.put('/:id', auth, authorize('Admin', 'QuanLy'), validateBook, updateBook);
router.delete('/:id', auth, authorize('Admin', 'QuanLy'), deleteBook);

module.exports = router;