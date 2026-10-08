/**
 * Simple structured logger
 */

function redact(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/AIza[0-9A-Za-z_-]{8,}/g, '[redacted]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[redacted]');
}

function sanitize(arg) {
  if (typeof arg === 'string') return redact(arg);
  if (arg instanceof Error) return redact(arg.message);
  return arg;
}

const logger = {
  info: (msg, ...args) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${redact(msg)}`, ...args.map(sanitize));
  },
  warn: (msg, ...args) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${redact(msg)}`, ...args.map(sanitize));
  },
  error: (msg, ...args) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${redact(msg)}`, ...args.map(sanitize));
  },
  debug: (msg, ...args) => {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${redact(msg)}`, ...args.map(sanitize));
    }
  }
};

module.exports = logger;
