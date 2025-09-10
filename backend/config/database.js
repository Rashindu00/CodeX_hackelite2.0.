const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mediconnect_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

// Database connection function
async function connectDatabase() {
  try {
    const client = await pool.connect();
    logger.info('Database connection established successfully');
    
    // Test the connection
    const result = await client.query('SELECT NOW()');
    logger.info(`Database connection test successful. Server time: ${result.rows[0].now}`);
    
    client.release();
    return pool;
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    throw error;
  }
}

// Query function with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Query executed in ${duration}ms: ${text}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error:', {
      query: text,
      params: params,
      error: error.message
    });
    throw error;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get a client from the pool (for complex operations)
async function getClient() {
  return await pool.connect();
}

// Close database connection (for graceful shutdown)
async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}

// Health check function
async function healthCheck() {
  try {
    const result = await query('SELECT 1 as health_check');
    return result.rowCount === 1;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

module.exports = {
  pool,
  connectDatabase,
  query,
  transaction,
  getClient,
  closeDatabase,
  healthCheck
};
