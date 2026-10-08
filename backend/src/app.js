const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initSchema } = require('./database/schema');
const { db, close } = require('./database/db');
const routes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ==========================================
// Middleware Configuration
// ==========================================

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching allowedOrigins
    if (!origin || config.allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    logger.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(null, true); // Permissive for hackathon development while logging
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'PayFlow API',
    description: 'AI-Powered Payment Recovery Automation System',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      invoices: '/api/invoices',
      upload: '/api/invoices/upload',
      analyze: '/api/invoices/:id/analyze',
      recover: '/api/invoices/:id/recover',
      timeline: '/api/invoices/:id/timeline',
      dashboard: '/api/dashboard'
    }
  });
});

// ==========================================
// Mount API Routes
// ==========================================
app.use('/api', routes);

// ==========================================
// Error Handling
// ==========================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==========================================
// Server Initialization & Lifecycle
// ==========================================
let server;

async function startServer() {
  try {
    // 1. Initialize SQLite Schema
    await initSchema();

    // 2. Start HTTP Listener
    server = app.listen(config.port, () => {
      logger.info(`====================================================`);
      logger.info(`  PayFlow Backend Server running on port ${config.port}`);
      logger.info(`  Environment: ${config.nodeEnv}`);
      logger.info(`  Database: ${config.databasePath}`);
      logger.info(`  Gemini Model: ${config.geminiModel}`);
      logger.info(`  Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`====================================================`);
    });

    return server;
  } catch (error) {
    logger.error('[App] Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
async function gracefulShutdown(signal) {
  logger.info(`[App] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('[App] HTTP server closed.');
      try {
        await close();
        logger.info('[Database] SQLite database connection closed.');
      } catch (err) {
        logger.error('[Database] Error closing SQLite database:', err);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// If run directly (e.g. node src/app.js)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
