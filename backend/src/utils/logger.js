/**
 * Minimal logger. Kept intentionally simple for a hackathon - wraps
 * console but gives us one place to swap in a real logger (pino/winston)
 * later without touching call sites.
 */
const logger = {
  info: (...args) => console.log('[info]', ...args),
  warn: (...args) => console.warn('[warn]', ...args),
  error: (...args) => console.error('[error]', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') console.debug('[debug]', ...args);
  },
};

module.exports = logger;
