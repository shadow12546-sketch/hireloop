const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { issueTokenPair, rotateRefreshToken, invalidateRefreshTokens } = require('../services/tokenService');
const { verifyGoogleIdToken } = require('../config/googleOAuth');
const { logActivity } = require('../services/activityLogService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');
const { ROLES } = require('../constants/roles');

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Public. role must be "candidate" or "employer" only (enforced by validator).
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
  });

  // Create the empty profile shell so later profile updates are simple upserts
  if (role === ROLES.CANDIDATE) {
    await CandidateProfile.create({ user: user._id });
  }
  // Company profile is created later via PUT /api/companies/me (employer chooses when)

  const tokens = issueTokenPair(user);

  await logActivity({
    actorId: user._id,
    action: ACTIVITY_ACTIONS.USER_REGISTERED,
    targetType: 'User',
    targetId: user._id,
    metadata: { role },
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user: user.toSafeJSON(), ...tokens },
  });
});

/**
 * POST /api/auth/login
 * Public.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw ApiError.unauthorized('This account uses Google Sign-In. Please log in with Google.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const tokens = issueTokenPair(user);

  await logActivity({
    actorId: user._id,
    action: ACTIVITY_ACTIONS.USER_LOGGED_IN,
    targetType: 'User',
    targetId: user._id,
  });

  return sendSuccess(res, {
    message: 'Login successful',
    data: { user: user.toSafeJSON(), ...tokens },
  });
});

/**
 * POST /api/auth/google
 * Public. Body: { idToken, role? }
 * role is only used the first time this Google account registers.
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;

  let payload;
  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid Google ID token');
  }

  if (!payload || !payload.email) {
    throw ApiError.unauthorized('Google account did not return an email address');
  }

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

  if (!user) {
    if (!role) {
      throw ApiError.badRequest('role is required for first-time Google sign-up (candidate or employer)');
    }
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      role,
      isEmailVerified: Boolean(payload.email_verified),
    });

    if (role === ROLES.CANDIDATE) {
      await CandidateProfile.create({ user: user._id });
    }

    await logActivity({
      actorId: user._id,
      action: ACTIVITY_ACTIONS.USER_REGISTERED,
      targetType: 'User',
      targetId: user._id,
      metadata: { role, via: 'google' },
    });
  } else if (!user.googleId) {
    // Existing email/password account - link Google for future logins
    user.googleId = payload.sub;
    await user.save();
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const tokens = issueTokenPair(user);

  return sendSuccess(res, {
    message: 'Google authentication successful',
    data: { user: user.toSafeJSON(), ...tokens },
  });
});

/**
 * POST /api/auth/refresh
 * Public (requires valid refresh token in body).
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await rotateRefreshToken(refreshToken);
  return sendSuccess(res, { message: 'Token refreshed', data: tokens });
});

/**
 * POST /api/auth/logout
 * Requires authentication. Invalidates all outstanding refresh tokens
 * for this user (simplest safe approach for a hackathon - no per-device
 * token tracking).
 */
const logout = asyncHandler(async (req, res) => {
  await invalidateRefreshTokens(req.user.id);
  return sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Requires authentication.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sendSuccess(res, { message: 'Current user fetched', data: { user: user.toSafeJSON() } });
});

module.exports = { register, login, googleAuth, refresh, logout, getMe };
