const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Issues a fresh access + refresh token pair for a user.
 * refreshTokenVersion is embedded in the refresh token so we can
 * invalidate all outstanding refresh tokens by bumping the version
 * on the user document (used at logout).
 */
function issueTokenPair(user) {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { accessToken, refreshToken };
}

/**
 * Validates a refresh token and, if still valid (matching tokenVersion),
 * issues a new token pair. Throws ApiError on any failure.
 */
async function rotateRefreshToken(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is inactive');
  }

  if (decoded.tokenVersion !== user.refreshTokenVersion) {
    // Token was issued before a logout / invalidation event
    throw ApiError.unauthorized('Refresh token has been revoked. Please log in again.');
  }

  return issueTokenPair(user);
}

/**
 * Invalidates all outstanding refresh tokens for a user (used on logout).
 */
async function invalidateRefreshTokens(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
}

module.exports = { issueTokenPair, rotateRefreshToken, invalidateRefreshTokens };
