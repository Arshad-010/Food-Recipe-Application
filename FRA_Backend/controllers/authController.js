const User = require('../models/User');
const Otp = require('../models/Otp');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
  sendEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
} = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper to build consistent user auth payload
 */
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  authProvider: user.authProvider || 'local',
  preferences: user.preferences,
  favorites: user.favorites,
  bookmarks: user.bookmarks,
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, preferences } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // First account created becomes admin for administration setup
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'local',
      role,
      avatar: avatar || undefined,
      preferences: preferences || undefined,
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: formatUserResponse(user),
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists & select password field explicitly
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Google-only user notification
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please use "Continue with Google" or reset your password to set a password.',
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

    // Verify account status
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator support.',
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: formatUserResponse(user),
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
      user: formatUserResponse(user),
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

    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully',
      user: formatUserResponse(updatedUser),
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
      user: formatUserResponse(updatedUser),
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

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account was created via Google. Use "Forgot Password" to set a new password.',
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

/**
 * @desc    Google OAuth Authentication (Sign in / Sign up)
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential, email, name, avatar, googleId } = req.body;

    let googlePayload = null;

    if (credential) {
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          googlePayload = ticket.getPayload();

          if (!googlePayload) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Google authentication token payload.',
            });
          }

          if (googlePayload.email_verified === false) {
            return res.status(400).json({
              success: false,
              message: 'Your Google email address is not verified by Google.',
            });
          }
        } else {
          // If no GOOGLE_CLIENT_ID is configured in environment, decode JWT safely for dev/testing
          const parts = credential.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              Buffer.from(base64, 'base64')
                .toString('latin1')
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            googlePayload = JSON.parse(jsonPayload);
          }
        }
      } catch (verifyError) {
        if (process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({
            success: false,
            message: `Google authentication verification failed: ${verifyError.message}`,
          });
        }
      }
    }

    const userEmail = googlePayload?.email || email;
    const userName = googlePayload?.name || name || 'Google Chef';
    const userAvatar =
      googlePayload?.picture ||
      avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    const userGoogleId = googlePayload?.sub || googleId;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: Email address not received from Google.',
      });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact administrator support.',
        });
      }

      // Link googleId if missing
      if (!user.googleId && userGoogleId) {
        user.googleId = userGoogleId;
      }
      if (!user.avatar && userAvatar) {
        user.avatar = userAvatar;
      }
      await user.save();
    } else {
      // Create new user with Google profile (no password required for google authProvider)
      const isFirstAccount = (await User.countDocuments({})) === 0;

      user = await User.create({
        name: userName,
        email: normalizedEmail,
        googleId: userGoogleId,
        avatar: userAvatar,
        authProvider: 'google',
        role: isFirstAccount ? 'admin' : 'user',
        bio: '',
        preferences: {
          cuisines: [],
          dietType: 'None',
          mealTypes: [],
        },
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - Request 6-digit Email OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Enforce 60-second cooldown per email
    const existingOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (existingOtp) {
      const elapsedMs = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (elapsedMs < 60000) {
        const remainingSeconds = Math.ceil((60000 - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    // Check if user exists in database
    const user = await User.findOne({ email: normalizedEmail });

    let generatedOtp = null;

    if (user) {
      // Generate secure 6-digit OTP using crypto
      generatedOtp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = crypto.createHash('sha256').update(generatedOtp).digest('hex');

      const otpExpiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
      const expiresAt = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);

      // Update User model fields for dual reliability
      user.resetOtpHash = otpHash;
      user.resetOtpExpiresAt = expiresAt;
      user.resetOtpAttempts = 0;
      user.resetOtpVerifiedAt = undefined;
      await user.save({ validateBeforeSave: false });

      // Invalidate existing OTPs in collection and persist the new one
      await Otp.deleteMany({ email: normalizedEmail });
      await Otp.create({
        email: normalizedEmail,
        otpHash,
        expiresAt,
        attempts: 0,
      });

      // Send branded OTP email via emailService
      await sendOtpEmail(user.email, user.name, generatedOtp, otpExpiresMinutes);
    }

    // Generic success message to prevent user enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a 6-digit verification code has been sent.',
      ...(process.env.NODE_ENV !== 'production' && generatedOtp ? { devOtp: generatedOtp } : {}),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 6-digit OTP and issue short-lived password reset token
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and the 6-digit verification code.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired or is invalid. Please request a new code.',
      });
    }

    // Maximum 5 wrong attempts before code invalidation
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.',
      });
    }

    const hashedInput = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    if (hashedInput !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;

      if (remaining <= 0) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.',
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // OTP matched! Mark verified timestamp on user document
    await User.updateOne(
      { email: normalizedEmail },
      { $set: { resetOtpVerifiedAt: new Date() } }
    );

    // Generate signed short-lived (10m) password-reset token
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'supersecret_foodrecipe_jwt_key_2026_secure',
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Verification code confirmed successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using resetToken or legacy URL token
 * @route   POST /api/auth/reset-password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token: urlToken } = req.params;
    const { email, resetToken, password, newPassword, confirmPassword } = req.body;

    const chosenPassword = newPassword || password;
    const effectiveToken = resetToken || urlToken;

    if (!chosenPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password.',
      });
    }

    if (chosenPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Enforce password strength: at least 1 uppercase, 1 lowercase, 1 number
    const hasUpper = /[A-Z]/.test(chosenPassword);
    const hasLower = /[a-z]/.test(chosenPassword);
    const hasNumber = /\d/.test(chosenPassword);

    if (!hasUpper || !hasLower || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one uppercase letter, one lowercase letter, and one number.',
      });
    }

    if (confirmPassword && chosenPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    let user = null;

    if (resetToken) {
      // 1. JWT resetToken flow (OTP verification)
      let decoded;
      try {
        decoded = jwt.verify(
          resetToken,
          process.env.JWT_SECRET || 'supersecret_foodrecipe_jwt_key_2026_secure'
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Password reset authorization has expired or is invalid. Please verify your OTP again.',
        });
      }

      if (decoded.purpose !== 'password-reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset authorization token purpose.',
        });
      }

      const targetEmail = (email || decoded.email || '').toLowerCase().trim();
      if (decoded.email && decoded.email !== targetEmail) {
        return res.status(400).json({
          success: false,
          message: 'Reset token does not match the provided email address.',
        });
      }

      user = await User.findOne({ email: targetEmail }).select('+password');
    } else if (urlToken) {
      // 2. Legacy URL token flow
      const hashedToken = crypto.createHash('sha256').update(urlToken).digest('hex');
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Password reset authorization token is missing.',
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Unable to reset password. The reset authorization is invalid or account does not exist.',
      });
    }

    // Set password (pre-save middleware hashes with bcrypt)
    user.password = chosenPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Clear reset OTP fields on user document
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = undefined;
    user.resetOtpVerifiedAt = undefined;

    // Allow user to use both password and Google sign-in
    await user.save();

    // Delete all OTPs for this email from OTP collection
    await Otp.deleteMany({ email: user.email.toLowerCase() });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailErr) {
      console.warn('[Email Warning]: Could not send password changed notification:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
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
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
};
