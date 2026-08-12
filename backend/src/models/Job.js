const mongoose = require('mongoose');
const {
  JOB_STATUS,
  ALL_JOB_STATUS,
  ALL_WORK_MODES,
  ALL_EMPLOYMENT_TYPES,
} = require('../constants/jobConstants');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 8000,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    workMode: {
      type: String,
      enum: ALL_WORK_MODES,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ALL_EMPLOYMENT_TYPES,
      required: true,
    },
    salaryMin: {
      type: Number,
      min: 0,
      default: null,
    },
    salaryMax: {
      type: Number,
      min: 0,
      default: null,
    },
    experience: {
      // e.g. "0-2 years", kept as free text for hackathon simplicity
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      set: (arr) => (Array.isArray(arr) ? arr.map((s) => s.trim().toLowerCase()).filter(Boolean) : arr),
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ALL_JOB_STATUS,
      default: JOB_STATUS.OPEN,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ workMode: 1, employmentType: 1 });

/**
 * A job is open for new applications only if status is OPEN and the
 * deadline has not passed yet.
 */
jobSchema.methods.isAcceptingApplications = function isAcceptingApplications() {
  return this.status === JOB_STATUS.OPEN && this.deadline.getTime() > Date.now();
};

module.exports = mongoose.model('Job', jobSchema);
