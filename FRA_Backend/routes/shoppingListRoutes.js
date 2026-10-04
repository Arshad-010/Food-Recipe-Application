const express = require('express');
const router = express.Router();
const {
  getShoppingList,
  addItems,
  toggleItem,
  removeItem,
  clearCompleted,
  clearAll,
  mergeDuplicates,
  addRecipeIngredients,
} = require('../controllers/shoppingListController');
const { protect } = require('../middleware/auth');

router.use(protect); // All shopping list routes require authentication

router.get('/', getShoppingList);
router.post('/add', addItems);
router.post('/item', addItems);
router.post('/add-recipe/:recipeId', addRecipeIngredients);
router.post('/merge', mergeDuplicates);
router.patch('/items/:itemId/toggle', toggleItem);
router.patch('/item/:itemId', toggleItem);
router.delete('/items/:itemId', removeItem);
router.delete('/item/:itemId', removeItem);
router.delete('/completed', clearCompleted);
router.delete('/clear', clearAll);

module.exports = router;

