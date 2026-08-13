const JOB_STATUS = Object.freeze({
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
});

const WORK_MODE = Object.freeze({
  REMOTE: 'remote',
  ONSITE: 'onsite',
  HYBRID: 'hybrid',
});

const EMPLOYMENT_TYPE = Object.freeze({
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
});

module.exports = {
  JOB_STATUS,
  WORK_MODE,
  EMPLOYMENT_TYPE,
  ALL_JOB_STATUS: Object.values(JOB_STATUS),
  ALL_WORK_MODES: Object.values(WORK_MODE),
  ALL_EMPLOYMENT_TYPES: Object.values(EMPLOYMENT_TYPE),
};
