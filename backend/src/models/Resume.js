const mongoose = require('mongoose');

/**
 * Resume stores METADATA only. The actual file bytes live in MongoDB
 * GridFS (bucket: "resumes"). `fileId` points to the GridFS file _id.
 */
const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileId: {
      // ObjectId of the file stored in the GridFS "resumes" bucket
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // bytes
      required: true,
    },
    isActive: {
      // soft-delete flag; false once replaced/deleted
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' } }
);

resumeSchema.index({ candidate: 1, isActive: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
