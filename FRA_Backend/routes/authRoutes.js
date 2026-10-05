const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfile,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPasswordOtp,
} = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public authentication routes with dedicated rate limiter
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/google', authLimiter, googleLogin);

// Forgot Password & Email OTP flow
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/resend-reset-otp', authLimiter, validateForgotPassword, forgotPassword);
router.post('/verify-otp', authLimiter, validateVerifyOtp, verifyOtp);
router.post('/verify-reset-otp', authLimiter, validateVerifyOtp, verifyOtp);
router.post('/reset-password', authLimiter, validateResetPasswordOtp, resetPassword);
router.post('/reset-password/:token', authLimiter, resetPassword); // Legacy token link route

// Protected user profile routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfile, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/password', protect, changePassword);

module.exports = router;
