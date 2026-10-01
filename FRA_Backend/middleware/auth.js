const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: require valid JWT token and active user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_foodrecipe_jwt_key_2026_secure'
      );

      // Get user from database excluding password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact administrator support.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }
};

/**
 * Optional Auth: attaches user to req if token exists, but does not block guests
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_foodrecipe_jwt_key_2026_secure'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
};
