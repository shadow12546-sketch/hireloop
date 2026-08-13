const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Converts known error types (Mongoose, JWT, Multer, etc.) into ApiError
 * so downstream formatting stays consistent.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose bad ObjectId cast
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field "${err.path}"`);
  }

  // Mongo duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ') || 'field';
    return ApiError.conflict(`Duplicate value for: ${field}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Invalid or expired token');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err) || err;

  const statusCode = normalized.statusCode && Number.isInteger(normalized.statusCode)
    ? normalized.statusCode
    : 500;

  const isOperational = normalized.isOperational === true;

  if (!isOperational) {
    // Unexpected/programming errors - log full detail server-side only
    logger.error('Unhandled error:', err);
  } else {
    logger.warn(`[${statusCode}] ${normalized.message}`);
  }

  const responseBody = {
    success: false,
    message: isOperational ? normalized.message : 'Something went wrong. Please try again.',
    errors: normalized.errors || [],
  };

  if (process.env.NODE_ENV !== 'production' && !isOperational) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
