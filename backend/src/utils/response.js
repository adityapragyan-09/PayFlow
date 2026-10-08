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

function redactSecrets(value) {
  return String(value || '')
    .replace(/AIza[0-9A-Za-z_-]{8,}/g, '[redacted]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[redacted]');
}

function clientSafeMessage(message, statusCode) {
  const text = redactSecrets(message || 'An unexpected error occurred');
  const leaked =
    /GEMINI_API_KEY|api[_-]?key|\[redacted\]|sqlite|enoent|eacces/i.test(text) ||
    /at\s+.+\.js:\d+/.test(text);
  if (!leaked) return text;
  return statusCode >= 500
    ? 'An unexpected error occurred'
    : 'The request could not be completed.';
}

function error(res, message = 'An unexpected error occurred', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: clientSafeMessage(message, statusCode)
  };
  if (details && typeof details !== 'string') {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  success,
  error
};
