const mongoose = require('mongoose');

const ShoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    recipeTitle: {
      type: String,
      default: 'Custom Item',
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ShoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [ShoppingItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
