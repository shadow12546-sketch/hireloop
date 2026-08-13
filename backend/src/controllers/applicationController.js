const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { APPLICATION_STATUS } = require('../constants/applicationConstants');
const { logActivity } = require('../services/activityLogService');
const { createNotification } = require('../services/notificationService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');
const { NOTIFICATION_TYPE } = require('../constants/notificationConstants');
const { transitionApplicationStatus } = require('../services/applicationWorkflowService');

/**
 * POST /api/applications
 * Candidate only.
 * Validates: job exists, job is OPEN, deadline not passed, candidate
 * has an active resume (or explicit resumeId), and no duplicate
 * application exists (double-checked here AND enforced by unique index).
 */
const createApplication = asyncHandler(async (req, res) => {
  const { jobId, resumeId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (!job.isAcceptingApplications()) {
    throw ApiError.badRequest('This job is no longer accepting applications (closed or past deadline)');
  }

  let resolvedResumeId = resumeId;
  if (!resolvedResumeId) {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile || !profile.activeResume) {
      throw ApiError.badRequest('Upload a resume before applying, or provide resumeId explicitly');
    }
    resolvedResumeId = profile.activeResume;
  } else {
    const resume = await Resume.findById(resolvedResumeId);
    if (!resume || resume.candidate.toString() !== req.user.id) {
      throw ApiError.badRequest('Invalid resumeId');
    }
  }

  const existing = await Application.findOne({ candidate: req.user.id, job: jobId });
  if (existing) {
    throw ApiError.conflict('You have already applied to this job');
  }

  let application;
  try {
    application = await Application.create({
      candidate: req.user.id,
      job: jobId,
      resume: resolvedResumeId,
      status: APPLICATION_STATUS.APPLIED,
      statusHistory: [{ status: APPLICATION_STATUS.APPLIED, changedBy: req.user.id }],
    });
  } catch (err) {
    // Race condition safety net: unique index also prevents duplicates
    if (err.code === 11000) {
      throw ApiError.conflict('You have already applied to this job');
    }
    throw err;
  }

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.APPLICATION_CREATED,
    targetType: 'Application',
    targetId: application._id,
    metadata: { jobId },
  });

  // Notify employer of new applicant
  const company = await Company.findById(job.company);
  if (company) {
    await createNotification({
      userId: company.owner,
      type: NOTIFICATION_TYPE.NEW_APPLICANT,
      message: `New applicant for "${job.title}"`,
      relatedApplication: application._id,
    });
  }

  return sendSuccess(res, { statusCode: 201, message: 'Application submitted successfully', data: { application } });
});

/**
 * GET /api/applications/mine
 * Candidate only. Lists the requesting candidate's own applications.
 */
const listMyApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { candidate: req.user.id };
  if (status) filter.status = status;

  const [applications, totalCount] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'job', populate: { path: 'company', select: 'name industry location' } })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'Applications fetched',
    data: { applications },
    meta: buildPaginationMeta({ page, limit, totalCount }),
  });
});

/**
 * GET /api/applications/job/:jobId
 * Employer only, must own the job. Lists applicants for a specific job.
 */
const listApplicationsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const company = await Company.findOne({ owner: req.user.id });
  if (!company || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to view applicants for this job');
  }

  const { status } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { job: job._id };
  if (status) filter.status = status;

  const [applications, totalCount] = await Promise.all([
    Application.find(filter)
      .populate('candidate', 'name email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'Applicants fetched',
    data: { applications },
    meta: buildPaginationMeta({ page, limit, totalCount }),
  });
});

/**
 * GET /api/applications/:id
 * Either role - candidate must own it, employer must own the related job.
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({ path: 'job', populate: { path: 'company' } })
    .populate('candidate', 'name email')
    .populate('resume')
    .populate('assignedAssessmentAttempt')
    .populate('interviewSession')
    .populate('offerLetter');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const isCandidateOwner = application.candidate._id.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && application.job.company._id.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this application');
  }

  return sendSuccess(res, { message: 'Application fetched', data: { application } });
});

/**
 * PATCH /api/applications/:id/advance
 * Employer only, must own the related job.
 * Advances the application to the next legal status
 * (APPLIED -> SCREENING -> SHORTLISTED -> ASSESSMENT -> AI_INTERVIEW ->
 * EMPLOYER_FINAL_DECISION), or REJECTED from any non-terminal status.
 * Employer cannot directly set OFFER here - that requires the dedicated
 * final-decision endpoint (see applicationController.makeFinalDecision).
 */
const advanceApplicationStatus = asyncHandler(async (req, res) => {
  const { toStatus, note } = req.body;

  if (toStatus === APPLICATION_STATUS.OFFER) {
    throw ApiError.badRequest('Use POST /api/applications/:id/decision to issue an OFFER (final decision)');
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const job = await Job.findById(application.job);
  const company = await Company.findOne({ owner: req.user.id });
  if (!company || !job || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to update this application');
  }

  const updated = await transitionApplicationStatus(application._id, toStatus, {
    actorId: req.user.id,
    note,
  });

  return sendSuccess(res, { message: `Application moved to ${toStatus}`, data: { application: updated } });
});

/**
 * POST /api/applications/:id/decision
 * Employer only, must own the related job, application must be in
 * EMPLOYER_FINAL_DECISION stage. This is the ONLY way to set OFFER.
 */
const makeFinalDecision = asyncHandler(async (req, res) => {
  const { decision, note } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const job = await Job.findById(application.job);
  const company = await Company.findOne({ owner: req.user.id });
  if (!company || !job || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to decide on this application');
  }

  if (application.status !== APPLICATION_STATUS.EMPLOYER_FINAL_DECISION) {
    throw ApiError.badRequest(
      `Application must be in EMPLOYER_FINAL_DECISION stage to record a final decision (currently: ${application.status})`
    );
  }

  const updated = await transitionApplicationStatus(application._id, decision, {
    actorId: req.user.id,
    note,
  });

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.EMPLOYER_FINAL_DECISION,
    targetType: 'Application',
    targetId: application._id,
    metadata: { decision, note },
  });

  return sendSuccess(res, { message: `Final decision recorded: ${decision}`, data: { application: updated } });
});

module.exports = {
  createApplication,
  listMyApplications,
  listApplicationsForJob,
  getApplicationById,
  advanceApplicationStatus,
  makeFinalDecision,
};
