const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
  silly: 'grey'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for error logs
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.info(message);
    }
  });
  
  next();
};

// Add structured logging methods
logger.logAuth = (action, userId, details = {}) => {
  logger.info(`AUTH: ${action}`, {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.logDatabase = (query, duration, error = null) => {
  if (error) {
    logger.error(`DB_ERROR: ${query}`, {
      query,
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } else {
    logger.debug(`DB_QUERY: ${query}`, {
      query,
      duration,
      timestamp: new Date().toISOString()
    });
  }
};

logger.logSecurity = (event, details = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.logHealthcare = (action, patientId, providerId, details = {}) => {
  logger.info(`HEALTHCARE: ${action}`, {
    action,
    patientId,
    providerId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
