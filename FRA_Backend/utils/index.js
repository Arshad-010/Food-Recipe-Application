const slugify = require('slugify');

/**
 * Generate URL-friendly slug from string
 */
const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Standard pagination calculator
 */
const getPagination = (page = 1, limit = 12) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * pageSize;
  return { pageNum, pageSize, skip };
};

/**
 * Scale ingredient quantities based on servings ratio
 */
const scaleIngredients = (ingredients, originalServings, targetServings) => {
  if (!Array.isArray(ingredients) || !originalServings || !targetServings) {
    return ingredients;
  }
  const ratio = targetServings / originalServings;
  return ingredients.map((item) => ({
    ...item,
    quantity: typeof item.quantity === 'number' ? Number((item.quantity * ratio).toFixed(2)) : item.quantity,
  }));
};

/**
 * Format standardized API responses
 */
const formatResponse = (success, message, data = {}) => {
  return {
    success,
    message,
    ...data,
  };
};

module.exports = {
  createSlug,
  getPagination,
  scaleIngredients,
  formatResponse,
};
