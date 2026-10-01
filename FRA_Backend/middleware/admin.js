/**
 * Restrict route to admin users only
 * Must be used AFTER protect middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before verifying administrator privileges.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }

  next();
};

module.exports = { adminOnly };
