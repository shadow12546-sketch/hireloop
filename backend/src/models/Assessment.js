const mongoose = require('mongoose');
const { QUESTION_TYPE } = require('../constants/assessmentConstants');

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(QUESTION_TYPE),
      default: QUESTION_TYPE.MCQ,
    },
    options: {
      // used for MCQ type only
      type: [String],
      default: [],
    },
    correctAnswer: {
      // used for MCQ / short_answer auto-grading; hidden from candidate responses by default
      type: String,
      default: '',
      select: false,
    },
    points: { type: Number, default: 1, min: 0 },
  },
  { _id: true }
);

/**
 * Assessment is a reusable TEMPLATE. When an application reaches the
 * ASSESSMENT stage, the backend automatically picks the best-matching
 * template (by tags/skills overlap with the job) and creates an
 * AssessmentAttempt referencing it for that specific candidate/application.
 */
const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      // used to match against job.skills / job category for auto-assignment
      type: [String],
      default: [],
      set: (arr) => (Array.isArray(arr) ? arr.map((s) => s.trim().toLowerCase()).filter(Boolean) : arr),
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 1,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      // optional: employer who authored it, null for system/seed templates
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

assessmentSchema.index({ tags: 1, isActive: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
