const mongoose = require('mongoose');
const { APPLICATION_STATUS, ALL_APPLICATION_STATUSES } = require('../constants/applicationConstants');

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ALL_APPLICATION_STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    status: {
      type: String,
      enum: ALL_APPLICATION_STATUSES,
      default: APPLICATION_STATUS.APPLIED,
      index: true,
    },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: [],
    },
    // Convenience references populated as the pipeline progresses -
    // avoids extra queries when displaying an application's full picture.
    assignedAssessmentAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssessmentAttempt',
      default: null,
    },
    interviewSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      default: null,
    },
    offerLetter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfferLetter',
      default: null,
    },
    finalDecisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    finalDecisionAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' } }
);

// CRITICAL: prevents duplicate applications by the same candidate to the same job
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
