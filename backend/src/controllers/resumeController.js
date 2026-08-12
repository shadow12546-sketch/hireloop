const resumeService = require('../services/resumeService');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const { logActivity } = require('../services/activityLogService');
const { ACTIVITY_ACTIONS } = require('../constants/activityActions');
const { ROLES } = require('../constants/roles');

/**
 * POST /api/resumes/upload
 * Candidate only. multipart/form-data, field name "resume".
 */
const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No resume file provided. Use form field name "resume".');
  }

  const resumeDoc = await resumeService.uploadResume({
    candidateId: req.user.id,
    file: req.file,
  });

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.RESUME_UPLOADED,
    targetType: 'Resume',
    targetId: resumeDoc._id,
    metadata: { filename: resumeDoc.originalFilename, size: resumeDoc.fileSize },
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Resume uploaded successfully',
    data: {
      resume: {
        id: resumeDoc._id,
        originalFilename: resumeDoc.originalFilename,
        mimeType: resumeDoc.mimeType,
        fileSize: resumeDoc.fileSize,
        uploadedAt: resumeDoc.uploadedAt,
      },
    },
  });
});

/**
 * GET /api/resumes/:id
 * Streams the actual file bytes back. Access allowed to:
 *  - the candidate who owns the resume
 *  - any authenticated employer (needed to review applicant resumes)
 * A stricter "employer must have received an application with this
 * resume" check is left as a documented assumption/simplification for
 * the hackathon - see README "Known limitations".
 */
const downloadResume = asyncHandler(async (req, res) => {
  const { resumeDoc, downloadStream } = await resumeService.getResumeStream(req.params.id);

  const isOwner = resumeDoc.candidate.toString() === req.user.id;
  const isEmployer = req.user.role === ROLES.EMPLOYER;

  if (!isOwner && !isEmployer) {
    throw ApiError.forbidden('You do not have permission to access this resume');
  }

  res.setHeader('Content-Type', resumeDoc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${resumeDoc.originalFilename}"`);

  downloadStream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ success: false, message: 'Resume file not found in storage', errors: [] });
    }
  });

  downloadStream.pipe(res);
});

/**
 * GET /api/resumes/:id/metadata
 * Returns metadata only (no file bytes). Same access rules as download.
 */
const getResumeMetadata = asyncHandler(async (req, res) => {
  const resumeDoc = await resumeService.getResumeMetadata(req.params.id);

  const isOwner = resumeDoc.candidate.toString() === req.user.id;
  const isEmployer = req.user.role === ROLES.EMPLOYER;

  if (!isOwner && !isEmployer) {
    throw ApiError.forbidden('You do not have permission to access this resume');
  }

  return sendSuccess(res, { message: 'Resume metadata fetched', data: { resume: resumeDoc } });
});

/**
 * DELETE /api/resumes/:id
 * Candidate only, must own the resume.
 */
const deleteResumeHandler = asyncHandler(async (req, res) => {
  const resumeDoc = await Resume.findById(req.params.id);
  if (!resumeDoc) {
    throw ApiError.notFound('Resume not found');
  }
  if (resumeDoc.candidate.toString() !== req.user.id) {
    throw ApiError.forbidden('You do not have permission to delete this resume');
  }

  await resumeService.deleteResume(req.params.id);

  await logActivity({
    actorId: req.user.id,
    action: ACTIVITY_ACTIONS.RESUME_DELETED,
    targetType: 'Resume',
    targetId: resumeDoc._id,
  });

  return sendSuccess(res, { message: 'Resume deleted successfully', data: null });
});

/**
 * GET /api/resumes/mine/list
 * Candidate only. Lists all resumes (active + inactive history) uploaded
 * by the requesting candidate.
 */
const listMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ candidate: req.user.id }).sort({ uploadedAt: -1 });
  return sendSuccess(res, { message: 'Resumes fetched', data: { resumes } });
});

module.exports = {
  uploadResumeHandler,
  downloadResume,
  getResumeMetadata,
  deleteResumeHandler,
  listMyResumes,
};
