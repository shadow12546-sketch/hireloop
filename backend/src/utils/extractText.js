const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract readable text from a PDF or DOCX buffer.
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
async function extractText(buffer, mimeType) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('INVALID_FILE_BUFFER');
  }

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  throw new Error(`UNSUPPORTED_FILE_TYPE: ${mimeType}`);
}

module.exports = { extractText };
