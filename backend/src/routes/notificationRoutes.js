const express = require('express');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.listMyNotifications);
router.patch(
  '/:id/read',
  validate({ params: z.object({ id: objectIdSchema }) }),
  notificationController.markNotificationRead
);
router.patch('/read-all', notificationController.markAllNotificationsRead);

module.exports = router;
