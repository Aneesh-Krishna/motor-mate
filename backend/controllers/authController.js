const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h', // 24 hours as requested
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authMethod: user.authMethod,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();

    if (address !== undefined) {
      user.address = {
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        zipCode: address.zipCode?.trim() || '',
        country: address.country?.trim() || ''
      };
    }

    // Validate and save
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authMethod: user.authMethod,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Google SSO success handler
const googleSuccess = async (req, res) => {
  try {
    const user = req.user;

    // Generate JWT token with 24-hour expiration
    const token = generateToken(user._id);

    // Redirect to frontend with token and user data (direct to root since we're not using react-router)
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      authMethod: user.authMethod
    }))}`;

    res.redirect(redirectUrl);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=authentication_failed`);
  }
};

// Google SSO failure handler
const googleFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=google_auth_failed`);
};

module.exports = {
  getProfile,
  updateProfile,
  googleSuccess,
  googleFailure,
};