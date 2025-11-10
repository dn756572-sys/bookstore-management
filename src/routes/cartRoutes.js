const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth'); // Sửa thành 'auth'

// All cart routes require authentication (customer only)
router.use(auth); // Sử dụng auth thay vì authenticate

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.put('/update/:MaSach', updateCartItem);
router.delete('/remove/:MaSach', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;