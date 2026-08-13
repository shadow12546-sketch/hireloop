const Job = require('../models/Job');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { JOB_STATUS } = require('../constants/jobConstants');
const { logActivity } = require('../services/activityLogService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');

/**
 * POST /api/jobs
 * Employer only. Requires the employer to already have a Company profile.
 */
const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user.id });
  if (!company) {
    throw ApiError.badRequest('Create your company profile before posting a job (PUT /api/companies/me)');
  }

  const job = await Job.create({
    ...req.body,
    company: company._id,
    createdBy: req.user.id,
  });

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.JOB_CREATED,
    targetType: 'Job',
    targetId: job._id,
    metadata: { title: job.title },
  });

  return sendSuccess(res, { statusCode: 201, message: 'Job created successfully', data: { job } });
});

/**
 * GET /api/jobs
 * Public/either role. Supports search, filters, pagination.
 * Query params: search, location, workMode, employmentType, skills
 * (comma-separated), status, page, limit.
 *
 * ASSUMPTION: candidates browsing jobs should only see OPEN jobs by
 * default (status filter defaults to OPEN unless explicitly overridden),
 * while an employer viewing their own jobs list should see all statuses
 * - that's handled by a separate "my jobs" style query via ?mine=true
 * combined with no default status filter when the requester is the owner.
 * For simplicity here: if `status` query param is omitted, we default
 * to OPEN only for public listing; pass status explicitly to see others.
 */
const listJobs = asyncHandler(async (req, res) => {
  const { search, location, workMode, employmentType, skills, status } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = JOB_STATUS.OPEN;
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  if (workMode) {
    filter.workMode = workMode;
  }
  if (employmentType) {
    filter.employmentType = employmentType;
  }
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (skillList.length > 0) {
      filter.skills = { $in: skillList };
    }
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const [jobs, totalCount] = await Promise.all([
    Job.find(filter)
      .populate('company', 'name industry location logoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'Jobs fetched',
    data: { jobs },
    meta: buildPaginationMeta({ page, limit, totalCount }),
  });
});

/**
 * GET /api/jobs/:id
 * Public/either role.
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'name industry location website logoUrl');
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  return sendSuccess(res, { message: 'Job fetched', data: { job } });
});

/**
 * PATCH /api/jobs/:id
 * Employer only, must own the job (via company ownership).
 */
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const company = await Company.findOne({ owner: req.user.id });
  if (!company || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to modify this job');
  }

  Object.assign(job, req.body);
  await job.save();

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.JOB_UPDATED,
    targetType: 'Job',
    targetId: job._id,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  return sendSuccess(res, { message: 'Job updated successfully', data: { job } });
});

/**
 * DELETE /api/jobs/:id
 * Employer only, must own the job. Hard delete (hackathon-simple).
 */
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const company = await Company.findOne({ owner: req.user.id });
  if (!company || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to delete this job');
  }

  await Job.deleteOne({ _id: job._id });

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.JOB_DELETED,
    targetType: 'Job',
    targetId: job._id,
    metadata: { title: job.title },
  });

  return sendSuccess(res, { message: 'Job deleted successfully', data: null });
});

/**
 * GET /api/jobs/mine/list
 * Employer only. Lists all jobs owned by the requesting employer
 * (any status - OPEN/CLOSED/EXPIRED), with pagination.
 */
const listMyJobs = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user.id });
  if (!company) {
    return sendSuccess(res, {
      message: 'Jobs fetched',
      data: { jobs: [] },
      meta: buildPaginationMeta({ page: 1, limit: 10, totalCount: 0 }),
    });
  }

  const { page, limit, skip } = getPagination(req.query);
  const filter = { company: company._id };
  if (req.query.status) filter.status = req.query.status;

  const [jobs, totalCount] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'Jobs fetched',
    data: { jobs },
    meta: buildPaginationMeta({ page, limit, totalCount }),
  });
});

module.exports = { createJob, listJobs, getJobById, updateJob, deleteJob, listMyJobs };
