const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { ASSESSMENT_ATTEMPT_STATUS } = require('../constants/assessmentConstants');
const { logActivity } = require('../services/activityLogService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');

/**
 * POST /api/assessments/templates
 * Employer only. Creates a reusable assessment template used for
 * automatic assignment (matched against job.skills via tags).
 */
const createAssessmentTemplate = asyncHandler(async (req, res) => {
  const template = await Assessment.create({
    ...req.body,
    createdBy: req.user.id,
  });
  return sendSuccess(res, { statusCode: 201, message: 'Assessment template created', data: { template } });
});

/**
 * GET /api/assessments/templates
 * Employer only. Lists all active templates.
 */
const listAssessmentTemplates = asyncHandler(async (req, res) => {
  const templates = await Assessment.find({ isActive: true }).select('-questions.correctAnswer');
  return sendSuccess(res, { message: 'Assessment templates fetched', data: { templates } });
});

/**
 * GET /api/assessments/attempts/:id
 * Candidate (owner) or Employer (owns the related job). Candidate-facing
 * view strips correct answers; employer view (with ?includeAnswers=true)
 * can see them for review purposes.
 */
const getAssessmentAttempt = asyncHandler(async (req, res) => {
  const attempt = await AssessmentAttempt.findById(req.params.id).populate('assessment');
  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found');
  }

  const isCandidateOwner = attempt.candidate.toString() === req.user.id;
  let isEmployerOwner = false;

  if (!isCandidateOwner) {
    const application = await Application.findById(attempt.application);
    const job = application ? await Job.findById(application.job) : null;
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && job && job.company.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this assessment attempt');
  }

  const attemptObj = attempt.toObject();

  // Candidates never see correct answers, even after submission
  if (isCandidateOwner) {
    attemptObj.assessment.questions = attemptObj.assessment.questions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });
  }

  return sendSuccess(res, { message: 'Assessment attempt fetched', data: { attempt: attemptObj } });
});

/**
 * PATCH /api/assessments/attempts/:id/start
 * Candidate only, must own the attempt. Marks it IN_PROGRESS.
 */
const startAssessmentAttempt = asyncHandler(async (req, res) => {
  const attempt = await AssessmentAttempt.findById(req.params.id);
  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found');
  }
  if (attempt.candidate.toString() !== req.user.id) {
    throw ApiError.forbidden('You do not have permission to start this assessment');
  }
  if (attempt.status !== ASSESSMENT_ATTEMPT_STATUS.ASSIGNED) {
    throw ApiError.badRequest(`Assessment cannot be started from status: ${attempt.status}`);
  }

  attempt.status = ASSESSMENT_ATTEMPT_STATUS.IN_PROGRESS;
  attempt.startedAt = new Date();
  await attempt.save();

  return sendSuccess(res, { message: 'Assessment started', data: { attempt } });
});

/**
 * POST /api/assessments/attempts/:id/submit
 * Candidate only, must own the attempt.
 * Auto-grades MCQ / short_answer questions with exact-match comparison
 * against correctAnswer; coding questions are left ungraded (score
 * contribution 0) since automated grading of code is out of scope for
 * a hackathon backend - can be manually reviewed by employer later.
 */
const submitAssessmentAttempt = asyncHandler(async (req, res) => {
  const { responses } = req.body;

  const attempt = await AssessmentAttempt.findById(req.params.id).populate({
    path: 'assessment',
    select: '+questions.correctAnswer',
  });
  if (!attempt) {
    throw ApiError.notFound('Assessment attempt not found');
  }
  if (attempt.candidate.toString() !== req.user.id) {
    throw ApiError.forbidden('You do not have permission to submit this assessment');
  }
  if (![ASSESSMENT_ATTEMPT_STATUS.ASSIGNED, ASSESSMENT_ATTEMPT_STATUS.IN_PROGRESS].includes(attempt.status)) {
    throw ApiError.badRequest(`Assessment cannot be submitted from status: ${attempt.status}`);
  }

  // Need correctAnswer field explicitly since it's select:false by default
  const assessment = await Assessment.findById(attempt.assessment._id || attempt.assessment).select('+questions.correctAnswer');

  const questionMap = new Map(assessment.questions.map((q) => [q._id.toString(), q]));

  let totalScore = 0;
  const gradedResponses = responses.map((r) => {
    const question = questionMap.get(r.questionId);
    if (!question) {
      return { questionId: r.questionId, answer: r.answer, isCorrect: null, pointsAwarded: 0 };
    }

    if (question.type === 'coding') {
      return { questionId: r.questionId, answer: r.answer, isCorrect: null, pointsAwarded: 0 };
    }

    const isCorrect =
      question.correctAnswer &&
      r.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    const pointsAwarded = isCorrect ? question.points : 0;
    totalScore += pointsAwarded;

    return { questionId: r.questionId, answer: r.answer, isCorrect: Boolean(isCorrect), pointsAwarded };
  });

  attempt.responses = gradedResponses;
  attempt.score = totalScore;
  attempt.maxScore = assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  attempt.status = ASSESSMENT_ATTEMPT_STATUS.SUBMITTED;
  attempt.submittedAt = new Date();
  await attempt.save();

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.ASSESSMENT_SUBMITTED,
    targetType: 'AssessmentAttempt',
    targetId: attempt._id,
    metadata: { score: totalScore, maxScore: attempt.maxScore },
  });

  return sendSuccess(res, { message: 'Assessment submitted successfully', data: { attempt } });
});

/**
 * GET /api/assessments/application/:applicationId
 * Either role (with ownership check) - convenience lookup of the
 * attempt tied to a given application.
 */
const getAttemptByApplication = asyncHandler(async (req, res) => {
  const attempt = await AssessmentAttempt.findOne({ application: req.params.applicationId }).populate('assessment');
  if (!attempt) {
    throw ApiError.notFound('No assessment attempt found for this application');
  }

  const isCandidateOwner = attempt.candidate.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const application = await Application.findById(req.params.applicationId);
    const job = application ? await Job.findById(application.job) : null;
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && job && job.company.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this assessment attempt');
  }

  return sendSuccess(res, { message: 'Assessment attempt fetched', data: { attempt } });
});

module.exports = {
  createAssessmentTemplate,
  listAssessmentTemplates,
  getAssessmentAttempt,
  startAssessmentAttempt,
  submitAssessmentAttempt,
  getAttemptByApplication,
};
