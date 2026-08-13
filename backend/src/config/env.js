/**
 * Centralized environment variable access.
 * Loads .env from the HireLoop-2 project root and exposes a
 * validated config object so the rest of the app never touches
 * process.env directly.
 */

const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  return value;
}

const env = {
  NODE_ENV: required('NODE_ENV', 'development'),
  PORT: parseInt(required('PORT', '5000'), 10),

  // Database
  MONGODB_URI: required(
    'MONGODB_URI',
    'mongodb://127.0.0.1:27017/hireloop'
  ),

  // JWT
  JWT_ACCESS_SECRET: required(
    'JWT_ACCESS_SECRET',
    'dev_access_secret_change_me'
  ),
  JWT_REFRESH_SECRET: required(
    'JWT_REFRESH_SECRET',
    'dev_refresh_secret_change_me'
  ),
  JWT_ACCESS_EXPIRES_IN: required('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN', '7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET', ''),
  GOOGLE_CALLBACK_URL: required('GOOGLE_CALLBACK_URL', ''),

  // Frontend
  FRONTEND_URL: required(
    'FRONTEND_URL',
    'http://localhost:3000'
  ),

  // Email
  EMAIL_HOST: required('EMAIL_HOST', ''),
  EMAIL_PORT: parseInt(required('EMAIL_PORT', '587'), 10),
  EMAIL_USER: required('EMAIL_USER', ''),
  EMAIL_PASSWORD: required('EMAIL_PASSWORD', ''),
  EMAIL_FROM: required(
    'EMAIL_FROM',
    'HireLoop <no-reply@hireloop.dev>'
  ),

  // Resume upload
  MAX_RESUME_SIZE_MB: parseInt(
    required('MAX_RESUME_SIZE_MB', '5'),
    10
  ),

  // AI service
  AI_SERVICE_API_KEY: required('AI_SERVICE_API_KEY', ''),

  // Groq / LLM
  GROQ_API_KEY: required('GROQ_API_KEY', ''),
};

module.exports = env;


