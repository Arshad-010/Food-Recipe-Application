const express = require('express');
const router = express.Router();
const {
  getShoppingList,
  addItems,
  toggleItem,
  removeItem,
  clearCompleted,
  clearAll,
} = require('../controllers/shoppingListController');
const { protect } = require('../middleware/auth');

router.use(protect); // All shopping list routes require authentication

router.get('/', getShoppingList);
router.post('/add', addItems);
router.patch('/items/:itemId/toggle', toggleItem);
router.delete('/items/:itemId', removeItem);
router.delete('/completed', clearCompleted);
router.delete('/clear', clearAll);

module.exports = router;
