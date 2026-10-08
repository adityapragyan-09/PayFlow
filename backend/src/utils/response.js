/**
 * Standard API Response utilities
 */

function success(res, data, statusCode = 200, message = null) {
  const payload = {
    success: true,
    data
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

function error(res, message = 'An unexpected error occurred', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: message
  };
  if (details) {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  success,
  error
};
