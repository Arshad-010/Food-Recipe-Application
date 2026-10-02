const ShoppingList = require('../models/ShoppingList');

/**
 * @desc Get current user's shopping list
 * @route GET /api/shopping-list
 * @access Private
 */
const getShoppingList = async (req, res, next) => {
  try {
    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      list = await ShoppingList.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({
      success: true,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add ingredients to shopping list
 * @route POST /api/shopping-list/add
 * @access Private
 */
const addItems = async (req, res, next) => {
  try {
    const { items } = req.body; // Can be single item or array of items

    if (!items) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    const itemsToAdd = Array.isArray(items) ? items : [items];

    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      list = new ShoppingList({ user: req.user._id, items: [] });
    }

    itemsToAdd.forEach((item) => {
      if (item && item.name) {
        list.items.unshift({
          name: item.name.trim(),
          quantity: item.quantity !== undefined ? String(item.quantity) : '',
          unit: item.unit ? String(item.unit) : '',
          recipeTitle: item.recipeTitle || 'Custom Item',
          recipeId: item.recipeId || null,
          isChecked: false,
        });
      }
    });

    await list.save();

    res.status(200).json({
      success: true,
      message: `Added ${itemsToAdd.length} item(s) to shopping list`,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle checked status of shopping item
 * @route PATCH /api/shopping-list/items/:itemId/toggle
 * @access Private
 */
const toggleItem = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Shopping list not found' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.isChecked = !item.isChecked;
    await list.save();

    res.status(200).json({
      success: true,
      item,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Remove single item from shopping list
 * @route DELETE /api/shopping-list/items/:itemId
 * @access Private
 */
const removeItem = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Shopping list not found' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.deleteOne();
    await list.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from shopping list',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Clear all completed (checked) items
 * @route DELETE /api/shopping-list/completed
 * @access Private
 */
const clearCompleted = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      return res.status(200).json({ success: true, items: [] });
    }

    list.items = list.items.filter((item) => !item.isChecked);
    await list.save();

    res.status(200).json({
      success: true,
      message: 'Completed items cleared',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Clear entire shopping list
 * @route DELETE /api/shopping-list/clear
 * @access Private
 */
const clearAll = async (req, res, next) => {
  try {
    let list = await ShoppingList.findOne({ user: req.user._id });
    if (list) {
      list.items = [];
      await list.save();
    }

    res.status(200).json({
      success: true,
      message: 'Shopping list cleared',
      items: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShoppingList,
  addItems,
  toggleItem,
  removeItem,
  clearCompleted,
  clearAll,
};
