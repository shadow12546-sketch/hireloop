const express = require('express');
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateCandidateProfileSchema } = require('../validators/profileValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/me', authorize(ROLES.CANDIDATE), profileController.getMyCandidateProfile);
router.put(
  '/me',
  authorize(ROLES.CANDIDATE),
  validate({ body: updateCandidateProfileSchema }),
  profileController.updateMyCandidateProfile
);

// Employer viewing a specific candidate's profile
router.get('/:userId', authorize(ROLES.EMPLOYER), profileController.getCandidateProfileById);

module.exports = router;
