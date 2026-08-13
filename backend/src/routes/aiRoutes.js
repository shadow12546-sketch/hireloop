const express = require('express');
const aiController = require('../controllers/aiController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  resumeParseRequestSchema,
  resumeMatchRequestSchema,
  interviewSessionResultSchema,
} = require('../validators/aiValidators');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');

const router = express.Router();

router.use(authenticate);

// The `result` field on the request body is intentionally NOT strictly
// validated at the route layer (it's an optional nested payload from
// the AI service) - the service layer validates/persists specific
// sub-fields. This keeps the contract flexible while auth stays enforced.
router.post('/resume/parse', validate({ body: resumeParseRequestSchema.extend({ result: z.any().optional() }) }), aiController.resumeParse);
router.post('/resume/match', validate({ body: resumeMatchRequestSchema.extend({ result: z.any().optional() }) }), aiController.resumeMatch);

router.post('/interview/session', validate({ body: interviewSessionResultSchema }), aiController.interviewSession);
router.get(
  '/interview/session/:applicationId',
  validate({ params: z.object({ applicationId: objectIdSchema }) }),
  aiController.getInterviewSession
);

module.exports = router;
