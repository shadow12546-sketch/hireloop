const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { APPLICATION_STATUS } = require('../constants/applicationConstants');
const { JOB_STATUS } = require('../constants/jobConstants');

/**
 * GET /api/analytics/overview
 * Employer only. High-level counts for the employer's own company.
 */
const getEmployerOverview = asyncHandler(async (req, res) => {
  let company = await Company.findOne({ owner: req.user.id });
  if (!company) {
    company = await Company.create({
      owner: req.user.id,
      name: `${req.user.name || 'Employer'}'s Company`,
      industry: 'Technology',
      description: 'Company profile created automatically.',
    });
  }

  const jobIds = await Job.find({ company: company._id }).distinct('_id');

  const [totalJobs, openJobs, totalApplications, statusBreakdownRaw] = await Promise.all([
    Job.countDocuments({ company: company._id }),
    Job.countDocuments({ company: company._id, status: JOB_STATUS.OPEN }),
    Application.countDocuments({ job: { $in: jobIds } }),
    Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusBreakdown = Object.values(APPLICATION_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  statusBreakdownRaw.forEach((row) => {
    statusBreakdown[row._id] = row.count;
  });

  return sendSuccess(res, {
    message: 'Employer analytics overview fetched',
    data: {
      totalJobs,
      openJobs,
      totalApplications,
      applicationsByStatus: statusBreakdown,
    },
  });
});

/**
 * GET /api/analytics/jobs/:jobId
 * Employer only, must own the job. Per-job funnel breakdown.
 */
const getJobAnalytics = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const company = await Company.findOne({ owner: req.user.id });
  if (!company || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to view analytics for this job');
  }

  const statusBreakdownRaw = await Application.aggregate([
    { $match: { job: job._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statusBreakdown = Object.values(APPLICATION_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  statusBreakdownRaw.forEach((row) => {
    statusBreakdown[row._id] = row.count;
  });

  const totalApplicants = await Application.countDocuments({ job: job._id });

  return sendSuccess(res, {
    message: 'Job analytics fetched',
    data: { jobId: job._id, jobTitle: job.title, totalApplicants, applicationsByStatus: statusBreakdown },
  });
});

module.exports = { getEmployerOverview, getJobAnalytics };
