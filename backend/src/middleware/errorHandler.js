const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  return error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

/**
 * Global Error Handler Middleware
 */
function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled Error on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
