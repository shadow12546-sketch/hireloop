const aiIntegrationService = require('../services/aiIntegrationService');
const InterviewSession = require('../models/InterviewSession');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

/**
 * ============================================================
 * AI INTEGRATION CONTRACTS FOR SHIVAM (AI/LLM owner)
 * ============================================================
 * These endpoints do NOT implement any LLM logic. They are the
 * persistence + auth boundary between the backend and the external
 * AI service. See README.md "AI Integration" section for full docs.
 * ============================================================
 */

/**
 * POST /api/ai/resume/parse
 * Auth: candidate (owner of the resume) OR employer.
 * This endpoint just IDENTIFIES the resume + returns a stable file URL
 * the AI service can fetch. The AI service calls this first, downloads
 * the file from the returned URL (GET /api/resumes/:id), processes it
 * externally, then calls this SAME endpoint again with the `result`
 * field populated to persist the outcome. Two-step contract:
 *   1) Request without `result` -> returns resume file location/metadata
 *   2) Request with `result` -> persists ResumeAnalysis (type: parse)
 */
const resumeParse = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  const isOwner = resume.candidate.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'employer') {
    throw ApiError.forbidden('You do not have permission to process this resume');
  }

  if (req.body.result) {
    const analysis = await aiIntegrationService.saveResumeParseResult({
      resumeId,
      ...req.body.result,
    });
    return sendSuccess(res, { message: 'Resume parse result saved', data: { analysis } });
  }

  return sendSuccess(res, {
    message: 'Resume identified. Fetch file via GET /api/resumes/:id, then POST back here with `result`.',
    data: {
      resumeId: resume._id,
      fileDownloadUrl: `/api/resumes/${resume._id}`,
      originalFilename: resume.originalFilename,
      mimeType: resume.mimeType,
    },
  });
});

/**
 * POST /api/ai/resume/match
 * Auth: candidate (owner) OR employer (owns the job).
 * Same two-step contract as resumeParse, but scoped to resume-vs-job.
 */
const resumeMatch = asyncHandler(async (req, res) => {
  const { resumeId, jobId, applicationId } = req.body;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const isCandidateOwner = resume.candidate.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && job.company.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to match this resume against this job');
  }

  if (req.body.result) {
    const analysis = await aiIntegrationService.saveResumeMatchResult({
      resumeId,
      jobId,
      applicationId,
      ...req.body.result,
    });
    return sendSuccess(res, { message: 'Resume match result saved', data: { analysis } });
  }

  return sendSuccess(res, {
    message: 'Resume and job identified. Fetch resume file, job details, then POST back here with `result`.',
    data: {
      resumeId: resume._id,
      fileDownloadUrl: `/api/resumes/${resume._id}`,
      jobId: job._id,
      jobDetailsUrl: `/api/jobs/${job._id}`,
    },
  });
});

/**
 * POST /api/ai/interview/session
 * Auth: candidate (owner of the application) - for starting/continuing
 * an interview session from the candidate side - OR any request bearing
 * valid auth from the AI service context. For a hackathon, the AI
 * service is expected to act as the candidate's authenticated session
 * OR employer view is read-only via GET below.
 * Supports partial/incremental saves (see aiIntegrationService).
 */
const interviewSession = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.body.applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const isCandidateOwner = application.candidate.toString() === req.user.id;
  if (!isCandidateOwner) {
    throw ApiError.forbidden('You do not have permission to update this interview session');
  }

  const session = await aiIntegrationService.saveInterviewSessionResult(req.body);

  return sendSuccess(res, { message: 'Interview session saved', data: { session } });
});

/**
 * GET /api/ai/interview/session/:applicationId
 * Either role with ownership check - retrieve current interview session
 * state (candidate resuming, or employer reviewing results).
 */
const getInterviewSession = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const isCandidateOwner = application.candidate.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const job = await Job.findById(application.job);
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && job && job.company.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this interview session');
  }

  const session = await InterviewSession.findOne({ application: req.params.applicationId });
  if (!session) {
    throw ApiError.notFound('No interview session found for this application');
  }

  return sendSuccess(res, { message: 'Interview session fetched', data: { session } });
});

module.exports = { resumeParse, resumeMatch, interviewSession, getInterviewSession };
