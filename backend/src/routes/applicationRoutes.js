const express = require('express');
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createApplicationSchema,
  applicationIdParamSchema,
  applicationQuerySchema,
  advanceStatusSchema,
  finalDecisionSchema,
} = require('../validators/applicationValidators');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.CANDIDATE),
  validate({ body: createApplicationSchema }),
  applicationController.createApplication
);

router.get(
  '/mine',
  authorize(ROLES.CANDIDATE),
  validate({ query: applicationQuerySchema }),
  applicationController.listMyApplications
);

router.get(
  '/job/:jobId',
  authorize(ROLES.EMPLOYER),
  validate({ params: z.object({ jobId: objectIdSchema }), query: applicationQuerySchema }),
  applicationController.listApplicationsForJob
);

router.get(
  '/:id',
  validate({ params: applicationIdParamSchema }),
  applicationController.getApplicationById
);

router.patch(
  '/:id/advance',
  authorize(ROLES.EMPLOYER),
  validate({ params: applicationIdParamSchema, body: advanceStatusSchema }),
  applicationController.advanceApplicationStatus
);

router.post(
  '/:id/decision',
  authorize(ROLES.EMPLOYER),
  validate({ params: applicationIdParamSchema, body: finalDecisionSchema }),
  applicationController.makeFinalDecision
);

module.exports = router;
