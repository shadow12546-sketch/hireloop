const multer = require('multer');
const env = require('../config/env');

/**
 * We use memory storage: Multer buffers the file in memory, then the
 * resume controller streams that buffer into GridFS. This is simplest
 * for a hackathon and fine for resume-sized files (a few MB).
 */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

function getExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx === -1 ? '' : filename.slice(idx).toLowerCase();
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = getExtension(file.originalname);

 if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
  const error = new Error('Invalid file type. Only PDF and DOCX resumes are accepted.');
  error.statusCode = 400;
  return cb(error);
}
if (!ALLOWED_EXTENSIONS.has(ext)) {
  const error = new Error('Invalid file extension. Only .pdf, .doc, .docx are accepted.');
  error.statusCode = 400;
  return cb(error);
}
  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_RESUME_SIZE_MB * 1024 * 1024,
  },
});

module.exports = uploadResume;
