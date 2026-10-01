const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfile,
} = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public authentication routes with dedicated rate limiter
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected user profile routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfile, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/password', protect, changePassword);

module.exports = router;
