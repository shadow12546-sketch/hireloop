const ApiError = require('../utils/ApiError');

/**
 * Generic Zod validation middleware.
 * Usage: validate({ body: someZodSchema, query: otherZodSchema, params: idSchema })
 * On success, replaces req.body/query/params with the PARSED (and
 * coerced/defaulted) values from Zod.
 */
function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err.errors) {
        // ZodError shape
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(ApiError.badRequest('Validation failed', formatted));
      }
      next(err);
    }
  };
}

module.exports = validate;
