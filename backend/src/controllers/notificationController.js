const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * GET /api/notifications
 * Either role. Lists the requesting user's own notifications.
 */
const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });
  const filter = { user: req.user.id };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user.id, isRead: false }),
  ]);

  return sendSuccess(res, {
    message: 'Notifications fetched',
    data: { notifications, unreadCount },
    meta: buildPaginationMeta({ page, limit, totalCount }),
  });
});

/**
 * PATCH /api/notifications/:id/read
 * Either role, must own the notification.
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }
  if (notification.user.toString() !== req.user.id) {
    throw ApiError.forbidden('You do not have permission to modify this notification');
  }

  notification.isRead = true;
  await notification.save();

  return sendSuccess(res, { message: 'Notification marked as read', data: { notification } });
});

/**
 * PATCH /api/notifications/read-all
 * Either role. Marks all of the requesting user's notifications as read.
 */
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { $set: { isRead: true } });
  return sendSuccess(res, { message: 'All notifications marked as read', data: null });
});

module.exports = { listMyNotifications, markNotificationRead, markAllNotificationsRead };
