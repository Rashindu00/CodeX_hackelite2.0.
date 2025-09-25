const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const providerRoutes = require('./routes/providers');
const appointmentRoutes = require('./routes/appointments');
const consultationRoutes = require('./routes/consultations');
const healthRecordRoutes = require('./routes/healthRecords');
const notificationRoutes = require('./routes/notifications');
const chatbotRoutes = require('./routes/chatbot');

const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));




// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve static files (uploaded files)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Redis not needed for MongoDB setup
    logger.info('✅ Using MongoDB for session management');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 MediConnect AI server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Socket.IO for real-time features
    const io = require('socket.io')(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      logger.info(`👤 User connected: ${socket.id}`);

      // Join consultation room
      socket.on('join-consultation', (consultationId) => {
        socket.join(`consultation-${consultationId}`);
        logger.info(`👨‍⚕️ User ${socket.id} joined consultation ${consultationId}`);
      });

      // Leave consultation room
      socket.on('leave-consultation', (consultationId) => {
        socket.leave(`consultation-${consultationId}`);
        logger.info(`👋 User ${socket.id} left consultation ${consultationId}`);
      });

      // Handle WebRTC signaling
      socket.on('webrtc-offer', (data) => {
        socket.to(`consultation-${data.consultationId}`).emit('webrtc-offer', data);
      });

      socket.on('webrtc-answer', (data) => {
        socket.to(`consultation-${data.consultationId}`).emit('webrtc-answer', data);
      });

      socket.on('webrtc-ice-candidate', (data) => {
        socket.to(`consultation-${data.consultationId}`).emit('webrtc-ice-candidate', data);
      });

      // Handle chat messages
      socket.on('chat-message', (data) => {
        socket.to(`consultation-${data.consultationId}`).emit('chat-message', data);
      });

      socket.on('disconnect', () => {
        logger.info(`👤 User disconnected: ${socket.id}`);
      });
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}



module.exports = app;
