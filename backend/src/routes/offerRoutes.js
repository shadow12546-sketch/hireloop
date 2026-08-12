const express = require('express');
const offerController = require('../controllers/offerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createOfferSchema } = require('../validators/offerValidators');
const { objectIdSchema } = require('../validators/common');
const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.EMPLOYER),
  validate({ body: createOfferSchema }),
  offerController.createOffer
);

router.get('/:id', validate({ params: z.object({ id: objectIdSchema }) }), offerController.getOfferById);

router.get(
  '/application/:applicationId',
  validate({ params: z.object({ applicationId: objectIdSchema }) }),
  offerController.getOfferByApplication
);

module.exports = router;
