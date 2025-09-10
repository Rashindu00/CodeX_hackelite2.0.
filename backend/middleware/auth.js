const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sessionUtils } = require('../config/redis');
const logger = require('../utils/logger');
const { asyncHandler } = require('./errorHandler');

// Verify JWT token
const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access denied. No token provided.' }
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in database
    const userResult = await query(
      'SELECT id, email, role, is_active, email_verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token is not valid. User not found.' }
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated.' }
      });
    }

    // Check if email is verified for sensitive operations
    if (req.path.includes('sensitive') && !user.email_verified) {
      return res.status(403).json({
        success: false,
        error: { message: 'Email verification required for this action.' }
      });
    }

    // Check session in Redis (optional, for additional security)
    const session = await sessionUtils.getSession(user.id);
    if (!session) {
      logger.logSecurity('Invalid session', { userId: user.id, ip: req.ip });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified
    };

    logger.logAuth('Token verified', user.id, { ip: req.ip });
    next();
  } catch (error) {
    logger.logSecurity('Invalid token attempt', { 
      token: token.substring(0, 10) + '...', 
      error: error.message,
      ip: req.ip 
    });

    return res.status(401).json({
      success: false,
      error: { message: 'Token is not valid.' }
    });
  }
});

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. Authentication required.' }
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Insufficient permissions.' }
      });
    }

    next();
  };
};

// Resource ownership check (for patients accessing their own data)
const authorizeOwnership = (resourceParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceParam];
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admins and providers can access any resource
    if (['admin', 'provider'].includes(userRole)) {
      return next();
    }

    // Patients can only access their own resources
    if (userRole === 'patient') {
      // For patient role, check if the resource belongs to them
      if (resourceId !== userId.toString()) {
        logger.logSecurity('Unauthorized resource access attempt', {
          userId,
          resourceId,
          path: req.path,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          error: { message: 'Access denied. You can only access your own resources.' }
        });
      }
    }

    next();
  });
};

// Check if user is email verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: { 
        message: 'Email verification required.',
        code: 'EMAIL_NOT_VERIFIED'
      }
    });
  }
  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return asyncHandler(async (req, res, next) => {
    const key = `sensitive_op:${req.user.id}:${req.path}`;
    
    // This would typically use Redis for rate limiting
    // For now, we'll just log the attempt
    logger.logSecurity('Sensitive operation attempted', {
      userId: req.user.id,
      path: req.path,
      ip: req.ip
    });

    next();
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userResult = await query(
        'SELECT id, email, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.is_active
        };
      }
    } catch (error) {
      // Silent fail for optional auth
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
});

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnership,
  requireEmailVerification,
  sensitiveOperationLimit,
  optionalAuth
};
