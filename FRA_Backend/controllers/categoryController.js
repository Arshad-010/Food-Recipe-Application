const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // Cuisines
  { name: 'Italian', type: 'cuisine', icon: '🍕', isDefault: true },
  { name: 'Indian', type: 'cuisine', icon: '🍛', isDefault: true },
  { name: 'Mexican', type: 'cuisine', icon: '🌮', isDefault: true },
  { name: 'Japanese', type: 'cuisine', icon: '🍜', isDefault: true },
  { name: 'Mediterranean', type: 'cuisine', icon: '🥗', isDefault: true },
  { name: 'American', type: 'cuisine', icon: '🍔', isDefault: true },
  { name: 'French', type: 'cuisine', icon: '🥐', isDefault: true },
  { name: 'Thai', type: 'cuisine', icon: '🍲', isDefault: true },
  { name: 'Chinese', type: 'cuisine', icon: '🥟', isDefault: true },
  { name: 'Spanish', type: 'cuisine', icon: '🥘', isDefault: true },
  // Meal Types
  { name: 'Breakfast', type: 'mealType', icon: '🥞', isDefault: true },
  { name: 'Lunch', type: 'mealType', icon: '🥪', isDefault: true },
  { name: 'Dinner', type: 'mealType', icon: '🍽️', isDefault: true },
  { name: 'Dessert', type: 'mealType', icon: '🍰', isDefault: true },
  { name: 'Snack', type: 'mealType', icon: '🥨', isDefault: true },
  { name: 'Beverages', type: 'mealType', icon: '🍹', isDefault: true },
  // Dietary Tags
  { name: 'Vegetarian', type: 'dietaryTag', icon: '🥦', isDefault: true },
  { name: 'Vegan', type: 'dietaryTag', icon: '🌱', isDefault: true },
  { name: 'Gluten-Free', type: 'dietaryTag', icon: '🌾', isDefault: true },
  { name: 'Keto', type: 'dietaryTag', icon: '🥑', isDefault: true },
  { name: 'Pescatarian', type: 'dietaryTag', icon: '🐟', isDefault: true },
];

/**
 * @desc Get all categories (with automatic seeding if empty)
 * @route GET /api/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) {
      filter.type = type;
    }

    let categories = await Category.find(filter).sort({ type: 1, name: 1 });

    // Seed defaults if empty
    if (categories.length === 0) {
      const count = await Category.countDocuments();
      if (count === 0) {
        await Category.insertMany(DEFAULT_CATEGORIES);
        categories = await Category.find(filter).sort({ type: 1, name: 1 });
      }
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new category
 * @route POST /api/categories
 * @access Private (Admin only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Category name and type are required',
      });
    }

    const existing = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
      type,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${name}" already exists under ${type}`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      icon: icon || '🍽️',
      description: description || '',
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete category
 * @route DELETE /api/categories/:id
 * @access Private (Admin only)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
