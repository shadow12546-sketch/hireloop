const OfferLetter = require('../models/OfferLetter');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { APPLICATION_STATUS } = require('../constants/applicationConstants');
const { logActivity } = require('../services/activityLogService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');

/**
 * POST /api/offers
 * Employer only, must own the job behind the application, and the
 * application must already be in OFFER status (i.e. the employer
 * already made the final decision via /api/applications/:id/decision).
 * This endpoint creates the actual OfferLetter document with salary/
 * joining date details - the status transition itself already happened.
 */
const createOffer = asyncHandler(async (req, res) => {
  const { applicationId, salary, joiningDate, benefits, notes } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const job = await Job.findById(application.job);
  if (!job) {
    throw ApiError.notFound('Associated job not found');
  }

  const company = await Company.findOne({ owner: req.user.id });
  if (!company || job.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('You do not have permission to create an offer for this application');
  }

  if (application.status !== APPLICATION_STATUS.OFFER) {
    throw ApiError.badRequest(
      `Application must be in OFFER status before creating an offer letter (currently: ${application.status}). Use POST /api/applications/:id/decision first.`
    );
  }

  const existing = await OfferLetter.findOne({ application: applicationId });
  if (existing) {
    throw ApiError.conflict('An offer letter already exists for this application');
  }

  const offer = await OfferLetter.create({
    application: applicationId,
    candidate: application.candidate,
    company: company._id,
    job: job._id,
    createdBy: req.user.id,
    salary,
    joiningDate,
    benefits,
    notes,
  });

  application.offerLetter = offer._id;
  await application.save();

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.OFFER_CREATED,
    targetType: 'OfferLetter',
    targetId: offer._id,
    metadata: { applicationId, salary },
  });

  return sendSuccess(res, { statusCode: 201, message: 'Offer letter created', data: { offer } });
});

/**
 * GET /api/offers/:id
 * Candidate (owner) or employer (owns the company that made the offer).
 */
const getOfferById = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findById(req.params.id)
    .populate('job', 'title')
    .populate('company', 'name')
    .populate('candidate', 'name email');

  if (!offer) {
    throw ApiError.notFound('Offer letter not found');
  }

  const isCandidateOwner = offer.candidate._id.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && offer.company._id.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this offer letter');
  }

  return sendSuccess(res, { message: 'Offer letter fetched', data: { offer } });
});

/**
 * GET /api/offers/application/:applicationId
 * Convenience lookup by application ID, same ownership rules as above.
 */
const getOfferByApplication = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findOne({ application: req.params.applicationId })
    .populate('job', 'title')
    .populate('company', 'name');

  if (!offer) {
    throw ApiError.notFound('No offer letter found for this application');
  }

  const isCandidateOwner = offer.candidate.toString() === req.user.id;
  let isEmployerOwner = false;
  if (!isCandidateOwner) {
    const company = await Company.findOne({ owner: req.user.id });
    isEmployerOwner = Boolean(company && offer.company._id.toString() === company._id.toString());
  }

  if (!isCandidateOwner && !isEmployerOwner) {
    throw ApiError.forbidden('You do not have permission to view this offer letter');
  }

  return sendSuccess(res, { message: 'Offer letter fetched', data: { offer } });
});

module.exports = { createOffer, getOfferById, getOfferByApplication };
