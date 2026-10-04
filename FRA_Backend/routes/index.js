const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const recipeRoutes = require('./recipeRoutes');
const shoppingListRoutes = require('./shoppingListRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');
const categoryRoutes = require('./categoryRoutes');

// Health endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Food Recipe Application API routes operational',
    timestamp: new Date().toISOString(),
  });
});

// Sub-routers
router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/shopping-list', shoppingListRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);

module.exports = {
  router,
  authRoutes,
  recipeRoutes,
  shoppingListRoutes,
  adminRoutes,
  uploadRoutes,
  categoryRoutes,
};

