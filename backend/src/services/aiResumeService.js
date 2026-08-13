const resumeService = require('./resumeService');
const { extractText } = require('../utils/extractText');
const { callLLMForJSON } = require('../utils/llmClient');

const RESUME_PARSE_SYSTEM_PROMPT = `
You are a professional resume parsing engine.

Extract structured information ONLY from the supplied resume text.

Return ONLY valid JSON matching exactly this structure:

{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "totalExperienceYears": 0,
  "skills": [],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "techStack": [],
      "description": ""
    }
  ],
  "certifications": [],
  "languages": [],
  "githubUrl": "",
  "linkedinUrl": "",
  "portfolioUrl": ""
}

Rules:
- Never invent information.
- If information is unavailable, use an empty string, empty array, or 0.
- Keep skills as concise names.
- Preserve the actual information from the resume.
- totalExperienceYears should be a reasonable numeric estimate based only on experience explicitly mentioned.
`;

/**
 * Parse a resume stored in MongoDB GridFS.
 */
async function parseResume(resumeId) {
  const { resumeDoc, buffer } =
    await resumeService.getResumeBuffer(resumeId);

  const resumeText = await extractText(
    buffer,
    resumeDoc.mimeType
  );

  if (!resumeText || resumeText.trim().length < 20) {
    throw new Error('RESUME_TEXT_EXTRACTION_FAILED');
  }

  const result = await callLLMForJSON(
    RESUME_PARSE_SYSTEM_PROMPT,
    resumeText
  );

  return {
    resumeDoc,
    resumeText,
    result,
  };
}

module.exports = {
  parseResume,
};
