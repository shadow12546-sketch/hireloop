const mongoose = require('mongoose');

/**
 * Stores AI-generated resume analysis. Two kinds of records are stored
 * in this same collection to avoid duplicate collections:
 *  - "parse" results: jobId/applicationId are null, general resume parsing
 *  - "match" results: jobId (and often applicationId) set, resume-vs-job match
 *
 * `type` distinguishes the two.
 */
const resumeAnalysisSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['parse', 'match'],
      required: true,
    },
    // --- parse-oriented fields ---
    atsScore: { type: Number, min: 0, max: 100, default: null },
    extractedSkills: { type: [String], default: [] },
    extractedEducation: { type: [mongoose.Schema.Types.Mixed], default: [] },
    extractedExperience: { type: [mongoose.Schema.Types.Mixed], default: [] },
    keywords: { type: [String], default: [] },
    candidateInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    // --- match-oriented fields ---
    matchScore: { type: Number, min: 0, max: 100, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    recommendation: { type: String, trim: true, default: '' },
    // raw AI provider payload, kept for debugging/audit, not shown by default
    rawResult: { type: mongoose.Schema.Types.Mixed, default: null, select: false },
  },
  { timestamps: true }
);

resumeAnalysisSchema.index({ resume: 1, job: 1, type: 1 });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
