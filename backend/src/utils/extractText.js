const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract readable text from a PDF or DOC/DOCX buffer.
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
async function extractText(buffer, mimeType) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('INVALID_FILE_BUFFER');
  }

  // PDF
  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  // DOCX / DOC
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