const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  toggleBookmark,
  getUserCollections,
  addReview,
  deleteReview,
  addComment,
  deleteComment,
  addCommentReply,
  deleteCommentReply,
  getRecommendations,
  getSimilarRecipes,
  searchRecipes,
} = require('../controllers/recipeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { seedDatabase } = require('../seed/seedData');

// Public & Recommendations
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/recommended', optionalAuth, getRecommendations);
router.get('/search', searchRecipes);
router.post('/seed', async (req, res, next) => {
  try {
    await seedDatabase();
    res.status(200).json({ success: true, message: 'Database recipes checked & seeded successfully' });
  } catch (err) {
    next(err);
  }
});
router.get('/', getRecipes);

// User collections
router.get('/my/collections', protect, getUserCollections);
router.get('/mine', protect, getUserCollections);

// Single recipe operations
router.get('/:id/similar', getSimilarRecipes);
router.get('/:id', getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

// Interactivity: Favorites, Bookmarks, Reviews & Comments
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/comments/:commentId/replies', protect, addCommentReply);
router.delete('/:id/comments/:commentId/replies/:replyId', protect, deleteCommentReply);

module.exports = router;

