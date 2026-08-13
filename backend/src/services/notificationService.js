const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Creates an in-app notification. Never throws upward - a notification
 * failure should not break the calling workflow.
 */
async function createNotification({ userId, type, message, relatedApplication = null }) {
  try {
    return await Notification.create({
      user: userId,
      type,
      message,
      relatedApplication,
    });
  } catch (err) {
    logger.error('[notification] Failed to create notification:', err.message);
    return null;
  }
}

module.exports = { createNotification };
