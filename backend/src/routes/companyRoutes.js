const express = require('express');
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { upsertCompanySchema } = require('../validators/profileValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/me', authenticate, authorize(ROLES.EMPLOYER), profileController.getMyCompany);
router.put(
  '/me',
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate({ body: upsertCompanySchema }),
  profileController.upsertMyCompany
);

// Public-ish: any authenticated user can view a company profile
router.get('/:id', authenticate, profileController.getCompanyById);

module.exports = router;
