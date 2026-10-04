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

/**
 * @desc Merge duplicate items in shopping list
 * @route POST /api/shopping-list/merge
 * @access Private
 */
const mergeDuplicates = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list || list.items.length === 0) {
      return res.status(200).json({ success: true, items: [] });
    }

    const mergedMap = new Map();

    list.items.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        const numExisting = parseFloat(existing.quantity);
        const numNew = parseFloat(item.quantity);

        if (!isNaN(numExisting) && !isNaN(numNew) && existing.unit === item.unit) {
          existing.quantity = String(Number((numExisting + numNew).toFixed(1)));
        } else if (item.quantity && !existing.quantity.includes(String(item.quantity))) {
          existing.quantity = `${existing.quantity} + ${item.quantity}`.trim();
        }

        if (item.recipeTitle && !existing.recipeTitle.includes(item.recipeTitle)) {
          existing.recipeTitle = `${existing.recipeTitle}, ${item.recipeTitle}`;
        }
      } else {
        mergedMap.set(key, {
          name: item.name.trim(),
          quantity: item.quantity || '',
          unit: item.unit || '',
          recipeTitle: item.recipeTitle || 'Groceries',
          recipeId: item.recipeId || null,
          isChecked: item.isChecked || false,
        });
      }
    });

    list.items = Array.from(mergedMap.values());
    await list.save();

    res.status(200).json({
      success: true,
      message: 'Duplicate ingredients merged successfully',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add all ingredients from a recipe
 * @route POST /api/shopping-list/add-recipe/:recipeId
 * @access Private
 */
const addRecipeIngredients = async (req, res, next) => {
  try {
    const Recipe = require('../models/Recipe');
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const scale = Number(req.body.servings) ? Number(req.body.servings) / (recipe.servings || 4) : 1;

    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
      list = new ShoppingList({ user: req.user._id, items: [] });
    }

    recipe.ingredients.forEach((ing) => {
      const qty = ing.quantity ? (ing.quantity * scale).toFixed(1).replace(/\.0$/, '') : '';
      list.items.unshift({
        name: ing.name.trim(),
        quantity: qty,
        unit: ing.unit || '',
        recipeTitle: recipe.title,
        recipeId: recipe._id,
        isChecked: false,
      });
    });

    await list.save();

    res.status(200).json({
      success: true,
      message: `Added ${recipe.ingredients.length} ingredients from "${recipe.title}"`,
      items: list.items,
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
  mergeDuplicates,
  addRecipeIngredients,
};

