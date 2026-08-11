const express = require("express");
const router = express.Router();
const { extractText } = require("../utils/extractText");
const { callLLMForJSON } = require("../utils/llmClient");

/**
 * POST /api/ai/resume/parse
 * Body: { filePath, mimeType }  (adjust to however Muskan's upload endpoint passes the file)
 * Returns: structured candidate data extracted from the resume
 */
router.post("/resume/parse", async (req, res) => {
  const { filePath, mimeType } = req.body;

  if (!filePath || !mimeType) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      message: "filePath and mimeType are required",
    });
  }

  try {
    const resumeText = await extractText(filePath, mimeType);

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(422).json({
        error: "EXTRACTION_FAILED",
        message: "Could not extract readable text from this file",
      });
    }

    const systemPrompt = `You are a resume parsing engine. Extract structured data from the resume text provided.
Return ONLY valid JSON, no extra commentary, matching exactly this schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "totalExperienceYears": number,
  "skills": string[],
  "education": [{ "degree": string, "institution": string, "year": string }],
  "experience": [{ "company": string, "role": string, "duration": string, "description": string }],
  "projects": [{ "title": string, "techStack": string[], "description": string }],
  "certifications": string[],
  "languages": string[],
  "githubUrl": string,
  "linkedinUrl": string,
  "portfolioUrl": string
}
If a field cannot be found, use an empty string, empty array, or 0 as appropriate. Never invent information not present in the text.`;

    const parsed = await callLLMForJSON(systemPrompt, resumeText);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Resume parse error:", err.message);

    // Fallback: don't break the candidate's flow, let them fill manually
    return res.status(200).json({
      name: "",
      email: "",
      phone: "",
      location: "",
      totalExperienceYears: 0,
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      languages: [],
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
      _fallback: true,
      _message: "AI parsing unavailable, please fill your profile manually.",
    });
  }
});

module.exports = router;
