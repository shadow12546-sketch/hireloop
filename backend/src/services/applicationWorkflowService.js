const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const ApiError = require('../utils/ApiError');
const { APPLICATION_STATUS, isValidTransition } = require('../constants/applicationConstants');
const { ASSESSMENT_ATTEMPT_STATUS } = require('../constants/assessmentConstants');
const { NOTIFICATION_TYPE } = require('../constants/notificationConstants');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');
const { logActivity } = require('./activityLogService');
const { createNotification } = require('./notificationService');
const emailService = require('./emailService');

/**
 * Automatically picks the best-matching Assessment template for a job.
 * Matching strategy (kept simple and AI-independent on purpose - AI is
 * NOT required for basic assessment assignment):
 *   1. Score every active template by counting overlapping tags vs job.skills
 *   2. Pick the highest-scoring template
 *   3. If no template has any overlap, fall back to the most recently
 *      created active template (better than assigning nothing)
 * Returns null if there are no active assessment templates at all.
 */
async function findBestMatchingAssessment(job) {
  const templates = await Assessment.find({ isActive: true });
  if (templates.length === 0) return null;

  const jobSkills = new Set((job.skills || []).map((s) => s.toLowerCase()));

  let best = null;
  let bestScore = -1;

  for (const template of templates) {
    const overlap = template.tags.filter((tag) => jobSkills.has(tag)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      best = template;
    }
  }

  if (bestScore <= 0) {
    // No tag overlap with any template - fall back to most recent template
    const fallback = templates.sort((a, b) => b.createdAt - a.createdAt)[0];
    return fallback;
  }

  return best;
}

/**
 * Creates an AssessmentAttempt for the given application, auto-selecting
 * the best-matching Assessment template. Safe to call multiple times -
 * will not create a duplicate attempt (unique index on application).
 */
async function autoAssignAssessment(application, job) {
  const existing = await AssessmentAttempt.findOne({ application: application._id });
  if (existing) return existing;

  const template = await findBestMatchingAssessment(job);
  if (!template) {
    console.error('[workflow] No active assessment templates found in the system. Cannot auto-assign assessment.');
    throw ApiError.badRequest('No active assessment templates found in the system. Cannot auto-assign assessment.');
  }

  const attempt = await AssessmentAttempt.create({
    assessment: template._id,
    application: application._id,
    candidate: application.candidate,
    status: ASSESSMENT_ATTEMPT_STATUS.ASSIGNED,
    maxScore: template.questions.reduce((sum, q) => sum + (q.points || 0), 0),
  });

  console.log('[DEBUG] selected assessment template:', template._id);
  console.log('[DEBUG] created AssessmentAttempt:', attempt._id);

  application.assignedAssessmentAttempt = attempt._id;
  await application.save();
  console.log('[DEBUG] assignedAssessmentAttempt saved to application:', application.assignedAssessmentAttempt);

  await logActivity({
    actorId: null,
    action: ACTIVITY_ACTIONS.ASSESSMENT_ASSIGNED,
    targetType: 'Application',
    targetId: application._id,
    metadata: { assessmentId: template._id.toString() },
  });

  return attempt;
}

/**
 * Fires the appropriate email + in-app notification for a status change.
 * Never throws - side effects must not break the core status update.
 */
async function fireStatusSideEffects({ application, job, candidateUser, toStatus }) {
  try {
    switch (toStatus) {
      case APPLICATION_STATUS.SHORTLISTED:
        await emailService.sendShortlistedEmail(candidateUser.email, candidateUser.name, job.title);
        await createNotification({
          userId: candidateUser._id,
          type: NOTIFICATION_TYPE.APPLICATION_STATUS_CHANGED,
          message: `You've been shortlisted for "${job.title}"`,
          relatedApplication: application._id,
        });
        break;
      case APPLICATION_STATUS.ASSESSMENT:
        await emailService.sendAssessmentAssignedEmail(candidateUser.email, candidateUser.name, job.title);
        await createNotification({
          userId: candidateUser._id,
          type: NOTIFICATION_TYPE.ASSESSMENT_ASSIGNED,
          message: `An assessment has been assigned for your application to "${job.title}"`,
          relatedApplication: application._id,
        });
        break;
      case APPLICATION_STATUS.AI_INTERVIEW:
        await emailService.sendAiInterviewStageEmail(candidateUser.email, candidateUser.name, job.title);
        await createNotification({
          userId: candidateUser._id,
          type: NOTIFICATION_TYPE.AI_INTERVIEW_READY,
          message: `You've advanced to the AI interview stage for "${job.title}"`,
          relatedApplication: application._id,
        });
        break;
      case APPLICATION_STATUS.OFFER: {
        const company = await Company.findById(job.company);
        await emailService.sendOfferEmail(
          candidateUser.email,
          candidateUser.name,
          job.title,
          company ? company.name : 'the company'
        );
        await createNotification({
          userId: candidateUser._id,
          type: NOTIFICATION_TYPE.OFFER_RECEIVED,
          message: `Congratulations! You received an offer for "${job.title}"`,
          relatedApplication: application._id,
        });
        break;
      }
      case APPLICATION_STATUS.REJECTED:
        await emailService.sendRejectionEmail(candidateUser.email, candidateUser.name, job.title);
        await createNotification({
          userId: candidateUser._id,
          type: NOTIFICATION_TYPE.APPLICATION_REJECTED,
          message: `Your application for "${job.title}" was not selected to move forward`,
          relatedApplication: application._id,
        });
        break;
      default:
        // APPLIED, SCREENING, EMPLOYER_FINAL_DECISION - no email needed
        break;
    }
  } catch (err) {
    // fireStatusSideEffects itself should never throw - individual
    // service calls (email/notification) already swallow their own errors,
    // this catch is a final safety net.
    // eslint-disable-next-line no-console
    console.error('[workflow] Side effect error (non-fatal):', err.message);
  }
}

/**
 * Transitions an application to a new status, validating the transition
 * is legal, persisting status history, triggering auto-assessment
 * assignment when entering ASSESSMENT, and firing notifications/emails.
 *
 * @param {String} applicationId
 * @param {String} toStatus - target APPLICATION_STATUS value
 * @param {Object} options - { actorId, note }
 */
async function transitionApplicationStatus(applicationId, toStatus, { actorId = null, note = '' } = {}) {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (!isValidTransition(application.status, toStatus)) {
    throw ApiError.badRequest(
      `Cannot transition application from "${application.status}" to "${toStatus}"`
    );
  }

  const job = await Job.findById(application.job);
  if (!job) {
    throw ApiError.notFound('Associated job not found');
  }

  const candidateUser = await User.findById(application.candidate);
  if (!candidateUser) {
    throw ApiError.notFound('Associated candidate not found');
  }

  const fromStatus = application.status;
  application.status = toStatus;
  application.statusHistory.push({
    status: toStatus,
    changedAt: new Date(),
    changedBy: actorId,
    note,
  });

  if (toStatus === APPLICATION_STATUS.OFFER || toStatus === APPLICATION_STATUS.REJECTED) {
    if (fromStatus === APPLICATION_STATUS.EMPLOYER_FINAL_DECISION || toStatus === APPLICATION_STATUS.REJECTED) {
      application.finalDecisionBy = actorId;
      application.finalDecisionAt = new Date();
    }
  }

  await application.save();

  await logActivity({
    actorId,
    action: ACTIVITY_ACTIONS.APPLICATION_STATUS_CHANGED,
    targetType: 'Application',
    targetId: application._id,
    metadata: { fromStatus, toStatus, note },
  });

  // Automatic assessment assignment when entering ASSESSMENT stage
  if (toStatus === APPLICATION_STATUS.ASSESSMENT) {
    await autoAssignAssessment(application, job);
  }

  await fireStatusSideEffects({ application, job, candidateUser, toStatus });

  return application;
}

module.exports = {
  transitionApplicationStatus,
  autoAssignAssessment,
  findBestMatchingAssessment,
};
