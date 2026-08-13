/**
 * Centralized application workflow statuses.
 *
 * Linear happy path:
 *   APPLIED -> SCREENING -> SHORTLISTED -> ASSESSMENT -> AI_INTERVIEW
 *           -> EMPLOYER_FINAL_DECISION -> OFFER
 *
 * REJECTED can happen from almost any stage (employer or system decision).
 * There is NO human interview stage - AI_INTERVIEW is fully AI-driven.
 * The AI never sets OFFER/REJECTED itself - only the employer's final
 * decision (via the employer decision endpoint) can do that from
 * EMPLOYER_FINAL_DECISION.
 */
const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  SHORTLISTED: 'SHORTLISTED',
  ASSESSMENT: 'ASSESSMENT',
  AI_INTERVIEW: 'AI_INTERVIEW',
  EMPLOYER_FINAL_DECISION: 'EMPLOYER_FINAL_DECISION',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
});

const ALL_APPLICATION_STATUSES = Object.values(APPLICATION_STATUS);

/**
 * Map of status -> array of statuses it may transition to.
 * REJECTED is reachable from every non-terminal status (employer/system
 * can reject a candidate at any stage of the pipeline).
 */
const APPLICATION_STATUS_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.APPLIED]: [
    APPLICATION_STATUS.SCREENING,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SCREENING]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.ASSESSMENT,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.ASSESSMENT]: [
    APPLICATION_STATUS.AI_INTERVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.AI_INTERVIEW]: [
    APPLICATION_STATUS.EMPLOYER_FINAL_DECISION,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.EMPLOYER_FINAL_DECISION]: [
    APPLICATION_STATUS.OFFER,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.OFFER]: [], // terminal
  [APPLICATION_STATUS.REJECTED]: [], // terminal
});

function isValidTransition(fromStatus, toStatus) {
  if (!APPLICATION_STATUS_TRANSITIONS[fromStatus]) return false;
  return APPLICATION_STATUS_TRANSITIONS[fromStatus].includes(toStatus);
}

module.exports = {
  APPLICATION_STATUS,
  ALL_APPLICATION_STATUSES,
  APPLICATION_STATUS_TRANSITIONS,
  isValidTransition,
};
