const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

/**
 * Lazily creates a nodemailer transporter. If email credentials are not
 * configured (common during local hackathon dev), we fall back to a
 * "json" transport that just logs instead of throwing - this way missing
 * email config never crashes the app or blocks core workflows.
 */
function getTransporter() {
  if (transporter) return transporter;

  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    console.warn('[mailer] Email credentials not set. Using dev no-op transport (emails will be logged only).');
    transporter = {
      sendMail: async (options) => {
        console.log('[mailer:dev] Would send email:', {
          to: options.to,
          subject: options.subject,
        });
        return { messageId: 'dev-noop' };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

  return transporter;
}

module.exports = { getTransporter };
