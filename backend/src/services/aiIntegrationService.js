const ResumeAnalysis = require('../models/ResumeAnalysis');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');

/**
 * Persists a resume PARSE result (general resume analysis, not tied to
 * a specific job). Creates or updates the ResumeAnalysis doc of type
 * "parse" for this resume.
 */
async function saveResumeParseResult(payload) {
  const resume = await Resume.findById(payload.resumeId);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  const analysis = await ResumeAnalysis.findOneAndUpdate(
    { resume: resume._id, type: 'parse' },
    {
      resume: resume._id,
      candidate: resume.candidate,
      type: 'parse',
      atsScore: payload.atsScore ?? null,
      extractedSkills: payload.extractedSkills || [],
      extractedEducation: payload.extractedEducation || [],
      extractedExperience: payload.extractedExperience || [],
      keywords: payload.keywords || [],
      candidateInfo: payload.candidateInfo || {},
      rawResult: payload.rawResult ?? null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return analysis;
}

/**
 * Persists a resume MATCH result (resume vs a specific job, optionally
 * tied to an application).
 */
async function saveResumeMatchResult(payload) {
  const resume = await Resume.findById(payload.resumeId);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  let applicationId = payload.applicationId || null;
  let applicationDoc = null;
  if (applicationId) {
    applicationDoc = await Application.findById(applicationId);
    if (!applicationDoc) {
      throw ApiError.notFound('Application not found');
    }
  } else {
    applicationDoc = await Application.findOne({ candidate: resume.candidate, job: payload.jobId });
    if (applicationDoc) {
      applicationId = applicationDoc._id;
    }
  }

  const filter = { resume: resume._id, job: payload.jobId, type: 'match' };

  const analysis = await ResumeAnalysis.findOneAndUpdate(
    filter,
    {
      resume: resume._id,
      candidate: resume.candidate,
      job: payload.jobId,
      application: applicationId,
      type: 'match',
      matchScore: payload.matchScore ?? null,
      strengths: payload.strengths || [],
      weaknesses: payload.weaknesses || [],
      missingSkills: payload.missingSkills || [],
      recommendation: payload.recommendation || '',
      keywords: payload.keywords || [],
      rawResult: payload.rawResult ?? null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // If match score >= 80%, auto-assign assessment for the application
  if (analysis.matchScore !== null && analysis.matchScore >= 80 && applicationDoc) {
    const { autoAssignAssessment } = require('./applicationWorkflowService');
    const jobDoc = await Job.findById(payload.jobId);
    if (jobDoc) {
      await autoAssignAssessment(applicationDoc, jobDoc);
    }
  }

  return analysis;
}

/**
 * Persists (creates or incrementally updates) an AI interview session
 * result. Supports partial saves - e.g. AI service may call this
 * multiple times as the interview progresses (status IN_PROGRESS),
 * then a final call with status COMPLETED.
 */
async function saveInterviewSessionResult(payload) {
  const application = await Application.findById(payload.applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const update = {
    application: application._id,
    candidate: application.candidate,
    status: payload.status || 'IN_PROGRESS',
  };

  if (payload.transcript && payload.transcript.length > 0) {
    update.$push = { transcript: { $each: payload.transcript } };
  }
  if (payload.summary !== undefined) update.summary = payload.summary;
  if (payload.score !== undefined) update.score = payload.score;
  if (payload.strengths !== undefined) update.strengths = payload.strengths;
  if (payload.weaknesses !== undefined) update.weaknesses = payload.weaknesses;
  if (payload.recommendation !== undefined) update.recommendation = payload.recommendation;
  if (payload.status === 'COMPLETED') update.completedAt = new Date();

  const { $push, ...setFields } = update;
  const updateQuery = { $set: setFields };
  if ($push) updateQuery.$push = $push;

  const session = await InterviewSession.findOneAndUpdate(
    { application: application._id },
    updateQuery,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (payload.status === 'COMPLETED') {
    application.interviewSession = session._id;
    await application.save();
  }

  return session;
}

module.exports = {
  saveResumeParseResult,
  saveResumeMatchResult,
  saveInterviewSessionResult,
};
