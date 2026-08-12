/**
 * Sends a consistent success JSON response shape across the whole API:
 * { success: true, message, data }
 */
function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = undefined }) {
  const body = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
