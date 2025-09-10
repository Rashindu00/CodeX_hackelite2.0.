const redis = require('redis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
};

// Create Redis client
const client = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
    connectTimeout: 5000,
    lazyConnect: true,
  },
  password: redisConfig.password,
  database: 0,
});

// Track Redis availability
let isRedisAvailable = false;

// Redis event handlers with reduced logging
client.on('connect', () => {
  logger.info('Redis client connected');
  isRedisAvailable = true;
});

client.on('ready', () => {
  logger.info('Redis client ready to use');
  isRedisAvailable = true;
});

client.on('error', (err) => {
  if (isRedisAvailable) {
    logger.error('Redis client error:', err);
  }
  isRedisAvailable = false;
});

client.on('end', () => {
  logger.info('Redis client disconnected');
  isRedisAvailable = false;
});

// Connect to Redis with better error handling and timeout
async function connectRedis() {
  return new Promise((resolve) => {
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      logger.warn('⚠️ Redis connection timeout - continuing without caching');
      isRedisAvailable = false;
      resolve(null);
    }, 2000); // 2 second timeout

    client.connect()
      .then(() => {
        clearTimeout(timeout);
        logger.info('✅ Redis connection established successfully');
        isRedisAvailable = true;
        resolve(client);
      })
      .catch((error) => {
        clearTimeout(timeout);
        logger.warn('⚠️ Redis not available - running without caching (this is normal for development)');
        isRedisAvailable = false;
        resolve(null);
      });
  });
}

// Redis utility functions with fallback when Redis is unavailable
const redisUtils = {
  // Set a key with expiration
  async setEx(key, value, ttl = 3600) {
    if (!isRedisAvailable) return false;
    
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      await client.setEx(key, ttl, value);
      return true;
    } catch (error) {
      logger.error('Redis setEx error:', error);
      return false;
    }
  },

  // Get a key
  async get(key) {
    if (!isRedisAvailable) return null;
    
    try {
      const value = await client.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },

  // Delete a key
  async del(key) {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  },

  // Set hash field
  async hSet(key, field, value) {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      await client.hSet(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis hSet error:', error);
      return false;
    }
  },

  // Get hash field
  async hGet(key, field) {
    try {
      const value = await client.hGet(key, field);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      logger.error('Redis hGet error:', error);
      return null;
    }
  },

  // Get all hash fields
  async hGetAll(key) {
    try {
      const result = await client.hGetAll(key);
      const parsed = {};
      for (const [field, value] of Object.entries(result)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      return parsed;
    } catch (error) {
      logger.error('Redis hGetAll error:', error);
      return {};
    }
  },

  // Increment a counter
  async incr(key) {
    try {
      return await client.incr(key);
    } catch (error) {
      logger.error('Redis incr error:', error);
      return 0;
    }
  },

  // Set expiration for a key
  async expire(key, ttl) {
    try {
      await client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  },

  // Add to set
  async sAdd(key, member) {
    try {
      await client.sAdd(key, member);
      return true;
    } catch (error) {
      logger.error('Redis sAdd error:', error);
      return false;
    }
  },

  // Remove from set
  async sRem(key, member) {
    try {
      await client.sRem(key, member);
      return true;
    } catch (error) {
      logger.error('Redis sRem error:', error);
      return false;
    }
  },

  // Get set members
  async sMembers(key) {
    try {
      return await client.sMembers(key);
    } catch (error) {
      logger.error('Redis sMembers error:', error);
      return [];
    }
  }
};

// Session management utilities
const sessionUtils = {
  // Store user session
  async storeSession(userId, sessionData, ttl = 86400) {
    const key = `session:${userId}`;
    return await redisUtils.setEx(key, sessionData, ttl);
  },

  // Get user session
  async getSession(userId) {
    const key = `session:${userId}`;
    return await redisUtils.get(key);
  },

  // Delete user session
  async deleteSession(userId) {
    const key = `session:${userId}`;
    return await redisUtils.del(key);
  },

  // Store refresh token
  async storeRefreshToken(userId, token, ttl = 604800) {
    const key = `refresh_token:${userId}`;
    return await redisUtils.setEx(key, token, ttl);
  },

  // Get refresh token
  async getRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    return await redisUtils.get(key);
  },

  // Delete refresh token
  async deleteRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    return await redisUtils.del(key);
  }
};

// Close Redis connection
async function closeRedis() {
  try {
    await client.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Health check function
async function healthCheck() {
  try {
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}

module.exports = {
  client,
  connectRedis,
  closeRedis,
  healthCheck,
  redisUtils,
  sessionUtils
};
