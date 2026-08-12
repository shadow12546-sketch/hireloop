/**
 * Wraps an async Express route handler so any thrown error / rejected
 * promise is automatically forwarded to next() -> centralized error handler.
 * This keeps controllers free of repetitive try/catch blocks.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
