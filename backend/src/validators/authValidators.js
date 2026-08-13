const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  // Only candidate or employer may self-register. No admin, ever.
  role: z.enum([ROLES.CANDIDATE, ROLES.EMPLOYER], {
    errorMap: () => ({ message: `Role must be either "${ROLES.CANDIDATE}" or "${ROLES.EMPLOYER}"` }),
  }),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
  // role only used the FIRST time a Google user registers via HireLoop
  role: z.enum([ROLES.CANDIDATE, ROLES.EMPLOYER]).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  googleAuthSchema,
};
