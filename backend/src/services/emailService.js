const { getTransporter } = require('../config/mailer');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Sends an email. NEVER throws - email failures must not break the
 * calling workflow (e.g. an application status update). Errors are
 * logged and swallowed.
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    logger.info(`[email] Sent "${subject}" to ${to}`);
  } catch (err) {
    logger.error(`[email] Failed to send "${subject}" to ${to}:`, err.message);
    // Intentionally swallow - do not rethrow.
  }
}

const templates = {
  shortlisted: (candidateName, jobTitle) => ({
    subject: `You've been shortlisted for ${jobTitle}!`,
    html: `<p>Hi ${candidateName},</p><p>Good news! You've been shortlisted for the <strong>${jobTitle}</strong> position. We'll notify you about next steps soon.</p>`,
  }),
  assessmentAssigned: (candidateName, jobTitle) => ({
    subject: `Assessment assigned for ${jobTitle}`,
    html: `<p>Hi ${candidateName},</p><p>An assessment has been assigned to you as part of your application for <strong>${jobTitle}</strong>. Please log in to HireLoop to complete it.</p>`,
  }),
  aiInterviewStage: (candidateName, jobTitle) => ({
    subject: `Next step: AI Interview for ${jobTitle}`,
    html: `<p>Hi ${candidateName},</p><p>You've moved to the AI interview stage for <strong>${jobTitle}</strong>. Please log in to HireLoop to begin.</p>`,
  }),
  offer: (candidateName, jobTitle, companyName) => ({
    subject: `Offer Letter: ${jobTitle} at ${companyName}`,
    html: `<p>Hi ${candidateName},</p><p>Congratulations! You have received an offer for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. Please log in to HireLoop to view the full details.</p>`,
  }),
  rejection: (candidateName, jobTitle) => ({
    subject: `Update on your application for ${jobTitle}`,
    html: `<p>Hi ${candidateName},</p><p>Thank you for applying for the <strong>${jobTitle}</strong> position. After careful consideration, we have decided not to move forward with your application at this time. We appreciate your interest and wish you the best in your job search.</p>`,
  }),
};

async function sendShortlistedEmail(to, candidateName, jobTitle) {
  const { subject, html } = templates.shortlisted(candidateName, jobTitle);
  return sendEmail({ to, subject, html });
}

async function sendAssessmentAssignedEmail(to, candidateName, jobTitle) {
  const { subject, html } = templates.assessmentAssigned(candidateName, jobTitle);
  return sendEmail({ to, subject, html });
}

async function sendAiInterviewStageEmail(to, candidateName, jobTitle) {
  const { subject, html } = templates.aiInterviewStage(candidateName, jobTitle);
  return sendEmail({ to, subject, html });
}

async function sendOfferEmail(to, candidateName, jobTitle, companyName) {
  const { subject, html } = templates.offer(candidateName, jobTitle, companyName);
  return sendEmail({ to, subject, html });
}

async function sendRejectionEmail(to, candidateName, jobTitle) {
  const { subject, html } = templates.rejection(candidateName, jobTitle);
  return sendEmail({ to, subject, html });
}

module.exports = {
  sendEmail,
  sendShortlistedEmail,
  sendAssessmentAssignedEmail,
  sendAiInterviewStageEmail,
  sendOfferEmail,
  sendRejectionEmail,
};
