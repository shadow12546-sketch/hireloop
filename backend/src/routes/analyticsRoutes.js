const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.EMPLOYER));

router.get('/overview', analyticsController.getEmployerOverview);
router.get(
  '/jobs/:jobId',
  validate({ params: z.object({ jobId: objectIdSchema }) }),
  analyticsController.getJobAnalytics
);

module.exports = router;
