const aiIntegrationService = require('../services/aiIntegrationService');
const aiResumeService = require('../services/aiResumeService');

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
 * AI INTEGRATION
 * ============================================================
 *
 * Resume parsing now happens directly inside the HireLoop backend:
 *
 * Frontend
 *   ↓
 * POST /api/ai/resume/parse
 *   ↓
 * Resume stored in MongoDB GridFS
 *   ↓
 * getResumeBuffer()
 *   ↓
 * PDF/DOCX text extraction
 *   ↓
 * Groq LLM
 *   ↓
 * Structured JSON
 *   ↓
 * ResumeAnalysis
 *   ↓
 * Frontend
 *
 * No separate AI server is required.
 * ============================================================
 */

/**
 * POST /api/ai/resume/parse
 *
 * Auth:
 * - Candidate who owns the resume
 * - Employer
 *
 * Body:
 * {
 *   "resumeId": "..."
 * }
 */
const resumeParse = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  const resume = await Resume.findById(resumeId);

  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  const isOwner =
    resume.candidate.toString() === req.user.id;

  const isEmployer = req.user.role === 'employer';

  if (!isOwner && !isEmployer) {
    throw ApiError.forbidden(
      'You do not have permission to process this resume'
    );
  }

  try {
    /**
     * AI processing:
     * 1. Read resume from GridFS
     * 2. Extract PDF/DOCX text
     * 3. Send text to Groq
     * 4. Receive structured JSON
     */
    const { result } =
      await aiResumeService.parseResume(resumeId);

    /**
     * Persist the AI result into ResumeAnalysis.
     */
    const analysis =
      await aiIntegrationService.saveResumeParseResult({
        resumeId,

        atsScore:
          typeof result.atsScore === 'number'
            ? result.atsScore
            : null,

        extractedSkills:
          Array.isArray(result.skills)
            ? result.skills
            : [],

        extractedEducation:
          Array.isArray(result.education)
            ? result.education
            : [],

        extractedExperience:
          Array.isArray(result.experience)
            ? result.experience
            : [],

        keywords:
          Array.isArray(result.skills)
            ? result.skills
            : [],

        candidateInfo: {
          name: result.name || '',
          email: result.email || '',
          phone: result.phone || '',
          location: result.location || '',

          totalExperienceYears:
            typeof result.totalExperienceYears === 'number'
              ? result.totalExperienceYears
              : 0,

          certifications:
            Array.isArray(result.certifications)
              ? result.certifications
              : [],

          languages:
            Array.isArray(result.languages)
              ? result.languages
              : [],

          githubUrl:
            result.githubUrl || '',

          linkedinUrl:
            result.linkedinUrl || '',

          portfolioUrl:
            result.portfolioUrl || '',

          projects:
            Array.isArray(result.projects)
              ? result.projects
              : [],
        },

        rawResult: result,
      });

    return sendSuccess(res, {
      message: 'Resume analyzed successfully',
      data: {
        analysis,
        parsedResume: result,
      },
    });
  } catch (error) {
    console.error(
      '[AI] Resume parsing failed:',
      error.message
    );

    throw ApiError.internal(
      'Unable to analyze resume. Please try again.'
    );
  }
});


/**
 * POST /api/ai/resume/match
 *
 * Auth:
 * - Candidate who owns the resume
 * - Employer who owns the job
 *
 * This endpoint is kept compatible with the existing
 * resume-match persistence contract.
 */
const resumeMatch = asyncHandler(async (req, res) => {
  const {
    resumeId,
    jobId,
    applicationId,
  } = req.body;

  const resume = await Resume.findById(resumeId);

  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const isCandidateOwner =
    resume.candidate.toString() === req.user.id;

  let isEmployerOwner = false;

  if (!isCandidateOwner) {
    const company = await Company.findOne({
      owner: req.user.id,
    });

    isEmployerOwner = Boolean(
      company &&
      job.company.toString() === company._id.toString()
    );
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden(
      'You do not have permission to match this resume against this job'
    );
  }

  /**
   * Keep the existing result-persistence contract.
   *
   * Actual AI matching will be integrated next.
   */
  if (req.body.result) {
    const analysis =
      await aiIntegrationService.saveResumeMatchResult({
        resumeId,
        jobId,
        applicationId,
        ...req.body.result,
      });

    return sendSuccess(res, {
      message: 'Resume match result saved',
      data: { analysis },
    });
  }

  return sendSuccess(res, {
    message:
      'Resume and job identified.',
    data: {
      resumeId: resume._id,
      fileDownloadUrl:
        `/api/resumes/${resume._id}`,
      jobId: job._id,
      jobDetailsUrl:
        `/api/jobs/${job._id}`,
    },
  });
});


/**
 * POST /api/ai/interview/session
 */
const interviewSession = asyncHandler(async (req, res) => {
  const application =
    await Application.findById(
      req.body.applicationId
    );

  if (!application) {
    throw ApiError.notFound(
      'Application not found'
    );
  }

  const isCandidateOwner =
    application.candidate.toString() ===
    req.user.id;

  if (!isCandidateOwner) {
    throw ApiError.forbidden(
      'You do not have permission to update this interview session'
    );
  }

  const session =
    await aiIntegrationService.saveInterviewSessionResult(
      req.body
    );

  return sendSuccess(res, {
    message: 'Interview session saved',
    data: { session },
  });
});


/**
 * GET /api/ai/interview/session/:applicationId
 */
const getInterviewSession = asyncHandler(async (req, res) => {
  const application =
    await Application.findById(
      req.params.applicationId
    );

  if (!application) {
    throw ApiError.notFound(
      'Application not found'
    );
  }

  const isCandidateOwner =
    application.candidate.toString() ===
    req.user.id;

  let isEmployerOwner = false;

  if (!isCandidateOwner) {
    const job =
      await Job.findById(application.job);

    const company =
      await Company.findOne({
        owner: req.user.id,
      });

    isEmployerOwner = Boolean(
      company &&
      job &&
      job.company.toString() ===
        company._id.toString()
    );
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden(
      'You do not have permission to view this interview session'
    );
  }

  const session =
    await InterviewSession.findOne({
      application: req.params.applicationId,
    });

  if (!session) {
    throw ApiError.notFound(
      'No interview session found for this application'
    );
  }

  return sendSuccess(res, {
    message: 'Interview session fetched',
    data: { session },
  });
});


module.exports = {
  resumeParse,
  resumeMatch,
  interviewSession,
  getInterviewSession,
};

