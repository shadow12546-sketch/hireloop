const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts raw text from an uploaded resume file (PDF or DOCX).
 * @param {string} filePath - path to the uploaded file on disk
 * @param {string} mimeType - the file's MIME type
 * @returns {Promise<string>} raw extracted text
 */
async function extractText(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("UNSUPPORTED_FILE_TYPE");
}

module.exports = { extractText };
