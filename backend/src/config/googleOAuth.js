/**
 * Google OAuth verification setup.
 *
 * ASSUMPTION: The frontend uses Google Identity Services (GIS) on the
 * client side to obtain an ID token, then sends that ID token to our
 * backend at POST /api/auth/google. The backend verifies the ID token
 * server-side using google-auth-library. This avoids implementing a
 * full OAuth redirect/callback dance in the backend, which is simpler
 * for a hackathon and works well with SPA frontends.
 *
 * If your frontend instead needs the redirect-based flow
 * (GOOGLE_CALLBACK_URL), that can be added later - the contract below
 * is isolated to authController/authService so it's easy to swap.
 */
const { OAuth2Client } = require('google-auth-library');
const env = require('./env');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload; // contains sub (googleId), email, name, email_verified, picture
}

module.exports = { verifyGoogleIdToken };
