const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  toggleFeatureRecipe,
  adminDeleteRecipe,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require authenticated admin
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/block', toggleBlockUser);
router.delete('/users/:userId', deleteUser);

router.patch('/recipes/:recipeId/feature', toggleFeatureRecipe);
router.delete('/recipes/:recipeId', adminDeleteRecipe);

module.exports = router;
