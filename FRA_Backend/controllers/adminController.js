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

/**
 * @desc Get all reviews and comments across recipes for moderation
 * @route GET /api/admin/moderation
 * @access Private (Admin only)
 */
const getRecentFeedback = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({}, 'title reviews comments image cuisine')
      .sort({ updatedAt: -1 })
      .lean();

    const allReviews = [];
    const allComments = [];

    recipes.forEach((r) => {
      if (Array.isArray(r.reviews)) {
        r.reviews.forEach((rev) => {
          allReviews.push({
            ...rev,
            recipeId: r._id,
            recipeTitle: r.title,
            recipeImage: r.image,
          });
        });
      }
      if (Array.isArray(r.comments)) {
        r.comments.forEach((comm) => {
          allComments.push({
            ...comm,
            recipeId: r._id,
            recipeTitle: r.title,
            recipeImage: r.image,
          });
        });
      }
    });

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      reviews: allReviews.slice(0, 50),
      comments: allComments.slice(0, 50),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin delete an inappropriate review
 * @route DELETE /api/admin/reviews/:recipeId/:reviewId
 * @access Private (Admin only)
 */
const moderateReview = async (req, res, next) => {
  try {
    const { recipeId, reviewId } = req.params;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const review = recipe.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.deleteOne();

    if (recipe.reviews.length > 0) {
      const sum = recipe.reviews.reduce((acc, r) => acc + r.rating, 0);
      recipe.averageRating = Number((sum / recipe.reviews.length).toFixed(1));
      recipe.ratingsCount = recipe.reviews.length;
    } else {
      recipe.averageRating = 0;
      recipe.ratingsCount = 0;
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Review removed by administrator',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin delete an inappropriate comment
 * @route DELETE /api/admin/comments/:recipeId/:commentId
 * @access Private (Admin only)
 */
const moderateComment = async (req, res, next) => {
  try {
    const { recipeId, commentId } = req.params;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.deleteOne();
    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Comment removed by administrator',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update recipe approval status (pending, approved, rejected)
 * @route PATCH /api/admin/recipes/:recipeId/status
 * @access Private (Admin only)
 */
const updateRecipeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.recipeId,
      { status },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.status(200).json({
      success: true,
      message: `Recipe status set to ${status}`,
      status: recipe.status,
      recipe,
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
  getRecentFeedback,
  moderateReview,
  moderateComment,
  updateRecipeStatus,
};

