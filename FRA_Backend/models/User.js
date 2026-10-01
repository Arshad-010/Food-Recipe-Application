const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    preferences: {
      cuisines: {
        type: [String],
        default: [],
      },
      dietType: {
        type: String,
        enum: ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Gluten-Free', 'Halal', 'Kosher'],
        default: 'None',
      },
      mealTypes: {
        type: [String],
        default: [],
      },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to hash password before saving
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare entered password with hashed password in database
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate signed JWT Token for user
 */
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET || 'supersecret_foodrecipe_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
