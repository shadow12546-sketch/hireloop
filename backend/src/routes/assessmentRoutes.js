const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createAssessmentTemplateSchema,
  attemptIdParamSchema,
  submitAssessmentSchema,
} = require('../validators/assessmentValidators');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/templates',
  authorize(ROLES.EMPLOYER),
  validate({ body: createAssessmentTemplateSchema }),
  assessmentController.createAssessmentTemplate
);

router.get('/templates', authorize(ROLES.EMPLOYER), assessmentController.listAssessmentTemplates);

router.get(
  '/attempts/:id',
  validate({ params: attemptIdParamSchema }),
  assessmentController.getAssessmentAttempt
);

router.patch(
  '/attempts/:id/start',
  authorize(ROLES.CANDIDATE),
  validate({ params: attemptIdParamSchema }),
  assessmentController.startAssessmentAttempt
);

router.post(
  '/attempts/:id/submit',
  authorize(ROLES.CANDIDATE),
  validate({ params: attemptIdParamSchema, body: submitAssessmentSchema }),
  assessmentController.submitAssessmentAttempt
);

router.get(
  '/application/:applicationId',
  validate({ params: z.object({ applicationId: objectIdSchema }) }),
  assessmentController.getAttemptByApplication
);

module.exports = router;
