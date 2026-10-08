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
function jsonErrorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    return error(res, 'Request body must be valid JSON', 400);
  }
  return next(err);
}

function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled Error on ${req.method} ${req.originalUrl}:`, err && err.message ? err.message : err);

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode >= 500
    ? 'An unexpected error occurred'
    : (err.message || 'An unexpected error occurred');

  return error(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  jsonErrorHandler,
  globalErrorHandler
};
