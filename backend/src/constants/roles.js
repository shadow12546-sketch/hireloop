/**
 * User roles - ONLY two roles exist in HireLoop.
 * There is NO admin role. Do not add one without updating
 * authorization middleware and validators everywhere.
 */
const ROLES = Object.freeze({
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
});

const ALL_ROLES = Object.freeze([ROLES.CANDIDATE, ROLES.EMPLOYER]);

module.exports = { ROLES, ALL_ROLES };
