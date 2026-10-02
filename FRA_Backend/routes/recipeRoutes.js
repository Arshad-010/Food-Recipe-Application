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
  addComment,
  deleteComment,
  getRecommendations,
} = require('../controllers/recipeController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public & Recommendations
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/', getRecipes);

// User collections
router.get('/my/collections', protect, getUserCollections);

// Single recipe operations
router.get('/:id', getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

// Interactivity: Favorites, Bookmarks, Reviews & Comments
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
