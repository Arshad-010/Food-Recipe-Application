const User = require('../models/User');
const Recipe = require('../models/Recipe');

/**
 * @desc Get admin overview statistics and metrics
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const publishedRecipes = await Recipe.countDocuments({ isPublished: true });
    const featuredRecipes = await Recipe.countDocuments({ isFeatured: true });

    // Calculate total reviews & average platform rating
    const reviewAgg = await Recipe.aggregate([
      { $unwind: '$reviews' },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          overallAvgRating: { $avg: '$reviews.rating' },
        },
      },
    ]);

    const totalReviews = reviewAgg[0]?.totalReviews || 0;
    const avgRating = reviewAgg[0]?.overallAvgRating ? Number(reviewAgg[0].overallAvgRating.toFixed(1)) : 0;

    // Cuisine distribution
    const cuisineDistribution = await Recipe.aggregate([
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Recent recipes
    const recentRecipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name email avatar');

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRecipes,
        publishedRecipes,
        featuredRecipes,
        totalReviews,
        avgRating,
      },
      cuisineDistribution,
      recentRecipes,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all users for admin management
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (role && role !== 'All') {
      filter.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-password');

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update user role (e.g. promote to admin)
 * @route PATCH /api/admin/users/:userId/role
 * @access Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (req.params.userId === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself from admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle block status of user
 * @route PATCH /api/admin/users/:userId/block
 * @access Private (Admin only)
 */
const toggleBlockUser = async (req, res, next) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block your own account' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? 'User account suspended' : 'User account unblocked',
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/admin/users/:userId
 * @access Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also delete user's recipes
    await Recipe.deleteMany({ author: req.params.userId });

    res.status(200).json({
      success: true,
      message: 'User and all associated recipes removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle feature status of recipe
 * @route PATCH /api/admin/recipes/:recipeId/feature
 * @access Private (Admin only)
 */
const toggleFeatureRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    recipe.isFeatured = !recipe.isFeatured;
    await recipe.save();

    res.status(200).json({
      success: true,
      message: recipe.isFeatured ? 'Recipe marked as featured' : 'Recipe unfeatured',
      isFeatured: recipe.isFeatured,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin delete any recipe
 * @route DELETE /api/admin/recipes/:recipeId
 * @access Private (Admin only)
 */
const adminDeleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Recipe removed by administrator',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  toggleFeatureRecipe,
  adminDeleteRecipe,
};
