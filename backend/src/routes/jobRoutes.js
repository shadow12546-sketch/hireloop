const express = require('express');
const jobController = require('../controllers/jobController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createJobSchema,
  updateJobSchema,
  jobIdParamSchema,
  jobQuerySchema,
} = require('../validators/jobValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Public/either role - browse jobs (candidates typically use this)
router.get('/', authenticate, validate({ query: jobQuerySchema }), jobController.listJobs);

// Employer - list own jobs (any status)
router.get('/mine/list', authenticate, authorize(ROLES.EMPLOYER), jobController.listMyJobs);

router.get('/:id', authenticate, validate({ params: jobIdParamSchema }), jobController.getJobById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate({ body: createJobSchema }),
  jobController.createJob
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate({ params: jobIdParamSchema, body: updateJobSchema }),
  jobController.updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate({ params: jobIdParamSchema }),
  jobController.deleteJob
);

module.exports = router;
