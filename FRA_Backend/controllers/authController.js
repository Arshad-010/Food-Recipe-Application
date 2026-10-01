const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, preferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // If this is the first registered user or email is admin, assign admin role
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      avatar: avatar || undefined,
      preferences: preferences || undefined,
    });

    // Generate JWT auth token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
        favorites: user.favorites,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists & select password field explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Verify password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Verify if account is suspended
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator support.',
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
        favorites: user.favorites,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update basic user profile details (name, avatar, bio)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cooking preferences (cuisines, dietType, mealTypes)
 * @route   PUT /api/auth/preferences
 * @access  Private
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { cuisines, dietType, mealTypes } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    user.preferences = {
      cuisines: Array.isArray(cuisines) ? cuisines : user.preferences.cuisines,
      dietType: dietType !== undefined ? dietType : user.preferences.dietType,
      mealTypes: Array.isArray(mealTypes) ? mealTypes : user.preferences.mealTypes,
    };

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Cooking preferences updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'The current password you entered is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
};
