const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  googleAuthSchema,
} = require('../validators/authValidators');

const router = express.Router();

// Public routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/google', validate({ body: googleAuthSchema }), authController.googleAuth);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
