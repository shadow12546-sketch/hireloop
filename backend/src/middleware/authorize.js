const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization. Usage: authorize('employer') or
 * authorize('candidate', 'employer'). Must run AFTER authenticate.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires one of the following roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}

module.exports = authorize;
