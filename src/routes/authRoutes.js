const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  getProfile, 
  changePassword 
} = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.get('/profile', auth, getProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;