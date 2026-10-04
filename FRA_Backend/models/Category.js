const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: ['cuisine', 'mealType', 'dietaryTag'],
      default: 'cuisine',
      index: true,
    },
    icon: {
      type: String,
      default: '🍽️',
    },
    description: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', CategorySchema);
