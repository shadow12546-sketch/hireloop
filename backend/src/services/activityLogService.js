const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Records an audit trail entry. NEVER pass secrets/passwords/tokens in
 * `metadata`. Never throws upward - logging failures should not break
 * the calling workflow.
 */
async function logActivity({ actorId = null, action, targetType = null, targetId = null, metadata = {} }) {
  try {
    return await ActivityLog.create({
      actor: actorId,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    logger.error('[activityLog] Failed to write activity log:', err.message);
    return null;
  }
}

module.exports = { logActivity };
