const mongoose = require('mongoose');
const { ASSESSMENT_ATTEMPT_STATUS, ALL_ASSESSMENT_ATTEMPT_STATUSES } = require('../constants/assessmentConstants');

const responseSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: null }, // null until graded
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    responses: {
      type: [responseSchema],
      default: [],
    },
    score: {
      type: Number,
      default: null,
    },
    maxScore: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ALL_ASSESSMENT_ATTEMPT_STATUSES,
      default: ASSESSMENT_ATTEMPT_STATUS.ASSIGNED,
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One attempt per application (hackathon-simple: no retakes)
assessmentAttemptSchema.index({ application: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
