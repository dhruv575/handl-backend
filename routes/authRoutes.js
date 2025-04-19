const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation
} = require('../middleware/validators');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, profileUpdateValidation, updateProfile);

module.exports = router;