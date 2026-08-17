const CandidateProfile = require('../models/CandidateProfile');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

/**
 * GET /api/candidates/me
 * Candidate only.
 */
const getMyCandidateProfile = asyncHandler(async (req, res) => {
  let profile = await CandidateProfile.findOne({ user: req.user.id }).populate('activeResume');
  if (!profile) {
    // Defensive: should already exist from registration, but create if missing
    profile = await CandidateProfile.create({ user: req.user.id });
  }
  return sendSuccess(res, { message: 'Candidate profile fetched', data: { profile } });
});

/**
 * PUT /api/candidates/me
 * Candidate only.
 */
const updateMyCandidateProfile = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: req.body },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return sendSuccess(res, { message: 'Candidate profile updated', data: { profile } });
});

/**
 * GET /api/candidates/:userId
 * Employer only - view a candidate's profile (e.g. from an application).
 * ASSUMPTION: any authenticated employer may view any candidate profile
 * by userId; fine-grained "only employers who share an application"
 * restriction is not enforced here for hackathon simplicity, but IS
 * enforced on resume file access and application data itself.
 */
const getCandidateProfileById = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.params.userId }).populate('activeResume');
  if (!profile) {
    throw ApiError.notFound('Candidate profile not found');
  }
  return sendSuccess(res, { message: 'Candidate profile fetched', data: { profile } });
});

/**
 * GET /api/companies/me
 * Employer only.
 */
const getMyCompany = asyncHandler(async (req, res) => {
  let company = await Company.findOne({ owner: req.user.id });
  if (!company) {
    company = await Company.create({
      owner: req.user.id,
      name: `${req.user.name || 'Employer'}'s Company`,
      industry: 'Technology',
      description: 'Company profile created automatically.',
    });
  }
  return sendSuccess(res, { message: 'Company profile fetched', data: { company } });
});

/**
 * PUT /api/companies/me
 * Employer only. Creates the company profile if it doesn't exist yet
 * (upsert), otherwise updates it.
 */
const upsertMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOneAndUpdate(
    { owner: req.user.id },
    { $set: { ...req.body, owner: req.user.id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return sendSuccess(res, { message: 'Company profile saved', data: { company } });
});

/**
 * GET /api/companies/:id
 * Public/either role - view a company profile (e.g. from a job listing).
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }
  return sendSuccess(res, { message: 'Company fetched', data: { company } });
});

module.exports = {
  getMyCandidateProfile,
  updateMyCandidateProfile,
  getCandidateProfileById,
  getMyCompany,
  upsertMyCompany,
  getCompanyById,
};
