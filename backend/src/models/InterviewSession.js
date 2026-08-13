const mongoose = require('mongoose');

const transcriptEntrySchema = new mongoose.Schema(
  {
    speaker: { type: String, enum: ['ai', 'candidate'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Fully AI-driven interview. Shivam's AI service calls
 * POST /api/ai/interview/session to save transcript/summary/score
 * incrementally or at the end. There is NO human interviewer.
 */
const interviewSessionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true, // one interview session per application
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transcript: {
      type: [transcriptEntrySchema],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
