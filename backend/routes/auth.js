const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { query, transaction } = require('../config/database');
const { sessionUtils } = require('../config/redis');
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

  const result = await transaction(async (client) => {
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Check if license number is already used (for providers)
    if (role === 'provider') {
      const existingProvider = await client.query(
        'SELECT id FROM healthcare_providers WHERE license_number = $1',
        [licenseNumber]
      );

      if (existingProvider.rows.length > 0) {
        throw new Error('Healthcare provider with this license number already exists');
      }
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, email_verification_token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at`,
      [email, passwordHash, role, emailVerificationToken]
    );

    const user = userResult.rows[0];

    // Create role-specific profile
    if (role === 'patient') {
      await client.query(
        `INSERT INTO patients (id, first_name, last_name, phone_number, date_of_birth, gender)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, firstName, lastName, phoneNumber, dateOfBirth, gender]
      );
    } else if (role === 'provider') {
      await client.query(
        `INSERT INTO healthcare_providers (id, first_name, last_name, phone_number, specialization, license_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, firstName, lastName, phoneNumber, specialization, licenseNumber]
      );
    }

    // TODO: Send email verification email
    logger.logAuth('User registered', user.id, { role, email });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerificationToken,
      createdAt: user.created_at
    };
  });

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
  const userResult = await query(
    `SELECT u.id, u.email, u.password_hash, u.role, u.is_active, u.email_verified,
            u.login_attempts, u.locked_until, u.last_login
     FROM users u 
     WHERE u.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    logger.logSecurity('Login attempt with invalid email', { email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' }
    });
  }

  const user = userResult.rows[0];

  // Check if account is locked
  if (user.locked_until && new Date() < new Date(user.locked_until)) {
    logger.logSecurity('Login attempt on locked account', { userId: user.id, email, ip: req.ip });
    return res.status(423).json({
      success: false,
      error: { message: 'Account is temporarily locked due to too many failed login attempts' }
    });
  }

  // Check if account is active
  if (!user.is_active) {
    logger.logSecurity('Login attempt on inactive account', { userId: user.id, email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: { message: 'Account is deactivated. Please contact support.' }
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isPasswordValid) {
    // Increment login attempts
    const loginAttempts = (user.login_attempts || 0) + 1;
    const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts

    await query(
      'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
      [loginAttempts, lockUntil, user.id]
    );

    logger.logSecurity('Failed login attempt', { 
      userId: user.id, 
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
  await query(
    'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store session and refresh token in Redis
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    loginTime: new Date().toISOString(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  };

  await sessionUtils.storeSession(user.id, sessionData);
  await sessionUtils.storeRefreshToken(user.id, refreshToken);

  logger.logAuth('User logged in', user.id, { email, ip: req.ip });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Remove session and refresh token from Redis
  await sessionUtils.deleteSession(userId);
  await sessionUtils.deleteRefreshToken(userId);

  logger.logAuth('User logged out', userId);

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
    
    // Check if refresh token exists in Redis
    const storedToken = await sessionUtils.getRefreshToken(decoded.id);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    // Get updated user data
    const userResult = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive' }
      });
    }

    const user = userResult.rows[0];

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token in Redis
    await sessionUtils.storeRefreshToken(user.id, newRefreshToken);

    logger.logAuth('Token refreshed', user.id);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
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

  const result = await query(
    'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email_verification_token = $1 RETURNING id, email',
    [token]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired verification token' }
    });
  }

  const user = result.rows[0];
  logger.logAuth('Email verified', user.id);

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

  const result = await query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3 RETURNING id',
    [resetToken, resetExpires, email]
  );

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });

  // Only log and send email if user exists
  if (result.rows.length > 0) {
    const userId = result.rows[0].id;
    logger.logAuth('Password reset requested', userId, { email });
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
  const userResult = await query(
    'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
    [token]
  );

  if (userResult.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired reset token' }
    });
  }

  const userId = userResult.rows[0].id;

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Update password and clear reset token
  await query(
    'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
    [passwordHash, userId]
  );

  // Clear all sessions for this user
  await sessionUtils.deleteSession(userId);
  await sessionUtils.deleteRefreshToken(userId);

  logger.logAuth('Password reset completed', userId);

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

  let userQuery = `
    SELECT u.id, u.email, u.role, u.is_active, u.email_verified, u.last_login, u.created_at
    FROM users u 
    WHERE u.id = $1
  `;

  if (userRole === 'patient') {
    userQuery = `
      SELECT u.id, u.email, u.role, u.is_active, u.email_verified, u.last_login, u.created_at,
             p.first_name, p.last_name, p.date_of_birth, p.gender, p.phone_number,
             p.address, p.city, p.country, p.preferred_language, p.profile_picture_url
      FROM users u 
      JOIN patients p ON u.id = p.id
      WHERE u.id = $1
    `;
  } else if (userRole === 'provider') {
    userQuery = `
      SELECT u.id, u.email, u.role, u.is_active, u.email_verified, u.last_login, u.created_at,
             hp.first_name, hp.last_name, hp.title, hp.specialization, hp.license_number,
             hp.phone_number, hp.years_of_experience, hp.bio, hp.verified, hp.rating,
             hp.total_consultations, hp.profile_picture_url
      FROM users u 
      JOIN healthcare_providers hp ON u.id = hp.id
      WHERE u.id = $1
    `;
  }

  const result = await query(userQuery, [userId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: { user }
  });
}));

module.exports = router;
