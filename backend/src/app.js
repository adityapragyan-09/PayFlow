const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initSchema } = require('./database/schema');
const { db, close } = require('./database/db');
const routes = require('./routes');
const { notFoundHandler, jsonErrorHandler, globalErrorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ==========================================
// Middleware Configuration
// ==========================================

function isLocalDevOrigin(origin) {
  try {
    const url = new URL(origin);
    const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return localHost && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch (err) {
    return false;
  }
}

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (curl, tests, server-to-server) send no Origin.
    if (!origin || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (config.nodeEnv !== 'production' && isLocalDevOrigin(origin)) {
      return callback(null, true);
    }
    logger.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
app.use(jsonErrorHandler);
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
