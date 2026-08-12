const mongoose = require('mongoose');
const { Readable } = require('stream');
const { getResumeBucket } = require('../config/gridfs');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const ApiError = require('../utils/ApiError');

/**
 * Streams a file buffer into the GridFS "resumes" bucket and creates
 * the corresponding Resume metadata document. Marks any previous
 * active resume for this candidate as inactive (soft-delete) and sets
 * the new one as the candidate's activeResume.
 */
async function uploadResume({ candidateId, file }) {
  const bucket = getResumeBucket();

  const fileId = await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { candidateId: candidateId.toString() },
    });

    Readable.from(file.buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });

  const resumeDoc = await Resume.create({
    candidate: candidateId,
    fileId,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    isActive: true,
  });

  // Deactivate previous resumes for this candidate (keep history, but only one active)
  await Resume.updateMany(
    { candidate: candidateId, _id: { $ne: resumeDoc._id } },
    { $set: { isActive: false } }
  );

  await CandidateProfile.findOneAndUpdate(
    { user: candidateId },
    { $set: { activeResume: resumeDoc._id } },
    { upsert: false }
  );

  return resumeDoc;
}

/**
 * Returns { resumeDoc, downloadStream } for streaming a resume file
 * back to an HTTP response. Throws 404 if not found.
 */
async function getResumeStream(resumeId) {
  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc) {
    throw ApiError.notFound('Resume not found');
  }

  const bucket = getResumeBucket();
  const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(resumeDoc.fileId));

  return { resumeDoc, downloadStream };
}

async function getResumeMetadata(resumeId) {
  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc) {
    throw ApiError.notFound('Resume not found');
  }
  return resumeDoc;
}

/**
 * Deletes a resume: removes the GridFS file and the metadata document.
 * If it was the candidate's activeResume, clears that reference.
 */
async function deleteResume(resumeId) {
  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc) {
    throw ApiError.notFound('Resume not found');
  }

  const bucket = getResumeBucket();
  try {
    await bucket.delete(new mongoose.Types.ObjectId(resumeDoc.fileId));
  } catch (err) {
    // File may already be missing from GridFS; proceed to remove metadata anyway.
  }

  await Resume.deleteOne({ _id: resumeDoc._id });

  await CandidateProfile.updateMany(
    { activeResume: resumeDoc._id },
    { $set: { activeResume: null } }
  );

  return resumeDoc;
}

module.exports = { uploadResume, getResumeStream, getResumeMetadata, deleteResume };
