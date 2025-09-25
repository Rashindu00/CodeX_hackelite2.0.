const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Patient = require('../models/Patient');
const HealthcareProvider = require('../models/HealthcareProvider');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken, sensitiveOperationLimit } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(['patient', 'provider'])
    .withMessage('Role must be either patient or provider'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formatValidationErrors(errors.array())
      }
    });
  }

  const {
    email,
    password,
    role,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    specialization, // For providers
    licenseNumber   // For providers
  } = req.body;

  // Additional validation for healthcare providers
  if (role === 'provider') {
    if (!specialization || !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: { message: 'Specialization and license number are required for healthcare providers' }
      });
    }
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: { message: 'User with this email already exists' }
    });
  }

  // Check if license number is already used (for providers)
  if (role === 'provider') {
    const existingProvider = await HealthcareProvider.findOne({ licenseNumber });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        error: { message: 'Healthcare provider with this license number already exists' }
      });
    }
  }

  // Generate email verification token
  const emailVerificationToken = uuidv4();

  // Create user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    emailVerificationToken
  });

  await user.save();

  // Create role-specific profile
  if (role === 'patient') {
    const patient = new Patient({
      user: user._id,
      dateOfBirth,
      gender
    });
    await patient.save();
  } else if (role === 'provider') {
    const provider = new HealthcareProvider({
      user: user._id,
      specialization,
      licenseNumber
    });
    await provider.save();
  }

  // TODO: Send email verification email
  logger.info('User registered', { userId: user._id, role, email });

  const result = {
    id: user._id,
    email: user.email,
    role: user.role,
    emailVerificationToken,
    createdAt: user.createdAt
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        createdAt: result.createdAt
      }
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formatValidationErrors(errors.array())
      }
    });
  }

  const { email, password } = req.body;

  // Get user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    logger.info('Login attempt with invalid email', { email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' }
    });
  }

  // Check if account is locked
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    logger.info('Login attempt on locked account', { userId: user._id, email, ip: req.ip });
    return res.status(423).json({
      success: false,
      error: { message: 'Account is temporarily locked due to too many failed login attempts' }
    });
  }

  // Check if account is active
  if (!user.isActive) {
    logger.info('Login attempt on inactive account', { userId: user._id, email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: { message: 'Account is deactivated. Please contact support.' }
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    const loginAttempts = (user.loginAttempts || 0) + 1;
    const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts

    user.loginAttempts = loginAttempts;
    user.lockedUntil = lockUntil;
    await user.save();

    logger.info('Failed login attempt', { 
      userId: user._id, 
      email, 
      attempts: loginAttempts,
      ip: req.ip 
    });

    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' }
    });
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockedUntil = null;
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const accessToken = jwt.sign(
    { 
      userId: user._id, 
      userType: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Get additional user information based on user type
  let additionalInfo = {};
  if (user.role === 'patient') {
    const patientInfo = await Patient.findOne({ user: user._id });
    additionalInfo = patientInfo || {};
  } else if (user.role === 'provider') {
    const providerInfo = await HealthcareProvider.findOne({ user: user._id });
    additionalInfo = providerInfo || {};
  }

  logger.info('Successful login', { 
    userId: user._id, 
    email, 
    userType: user.role,
    ip: req.ip 
  });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        userType: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        ...additionalInfo
      }
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Clear refresh token in database
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  logger.info('User logged out', { userId });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: { message: 'Refresh token is required' }
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    


    // Get updated user data
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive' }
      });
    }

    // Verify stored refresh token matches
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { 
        userId: user._id, 
        userType: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    logger.info('Token refreshed', { userId: user._id });

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    logger.logSecurity('Invalid refresh token attempt', { 
      token: refreshToken.substring(0, 10) + '...', 
      error: error.message,
      ip: req.ip 
    });

    return res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' }
    });
  }
}));

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: { message: 'Verification token is required' }
    });
  }

  const user = await User.findOneAndUpdate(
    { emailVerificationToken: token },
    { 
      emailVerified: true, 
      emailVerificationToken: null 
    },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired verification token' }
    });
  }

  logger.info('Email verified', { userId: user._id });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formatValidationErrors(errors.array())
      }
    });
  }

  const { email } = req.body;
  const resetToken = uuidv4();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const user = await User.findOneAndUpdate(
    { email },
    { 
      passwordResetToken: resetToken, 
      passwordResetExpires: resetExpires 
    },
    { new: true }
  );

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });

  // Only log and send email if user exists
  if (user) {
    logger.info('Password reset requested', { userId: user._id, email });
    // TODO: Send password reset email
  }
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formatValidationErrors(errors.array())
      }
    });
  }

  const { token, password } = req.body;

  // Check if token is valid and not expired
  const user = await User.findOne({ 
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired reset token' }
    });
  }

  // Set new password and clear reset token
  user.password = password; // Will be hashed by pre-save middleware
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshToken = null; // Clear refresh token
  await user.save();

  logger.info('Password reset completed', { userId: user._id });

  res.json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Get user base info
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  let userData = {
    id: user._id,
    email: user.email,
    userType: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  // Get additional info based on user type
  if (userRole === 'patient') {
    const patientInfo = await Patient.findOne({ user: user._id });
    if (patientInfo) {
      userData = { ...userData, ...patientInfo.toObject() };
    }
  } else if (userRole === 'provider') {
    const providerInfo = await HealthcareProvider.findOne({ user: user._id });
    if (providerInfo) {
      userData = { ...userData, ...providerInfo.toObject() };
    }
  }

  res.json({
    success: true,
    data: { user: userData }
  });
}));

module.exports = router;
