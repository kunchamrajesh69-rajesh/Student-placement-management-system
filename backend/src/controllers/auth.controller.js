const User = require('../models/User');
const { generateToken, getCookieOptions } = require('../config/jwt');

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password included
    const user = await User.findOne({ email }).select('+password').populate({
      path: 'studentProfile',
      populate: { path: 'department', select: 'name code' }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated. Please contact the administrator.'
        }
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Set HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    // Sanitize user object for response
    const sanitizedUser = {
      _id: user._id,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile,
      lastLogin: user.lastLogin
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Authenticated
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/v1/auth/me
 * @access  Authenticated
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'studentProfile',
      populate: { path: 'department', select: 'name code' }
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Authenticated
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Incorrect current password'
        }
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  changePassword
};
