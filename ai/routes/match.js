const express = require("express");
const router = express.Router();
const { computeMatchScore } = require("../utils/matchScore");
const { callLLMForJSON } = require("../utils/llmClient");

/**
 * POST /api/ai/resume/match
 * Body: {
 *   resume: <parsed resume JSON from /resume/parse>,
 *   job: { title, requiredSkills: string[], requiredExperienceYears: number, description }
 * }
 * Returns: matchScore, breakdown, strengths, missingSkills, weakAreas, recommendation
 */
router.post("/resume/match", async (req, res) => {
  const { resume, job } = req.body;

  if (!resume || !job) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      message: "resume and job objects are required",
    });
  }

  // Step 1: deterministic scoring (fast, consistent, no AI needed)
  const scoreResult = computeMatchScore(resume, job);

  // Step 2: LLM only writes the qualitative narrative on top of the numbers
  try {
    const systemPrompt = `You are a recruitment analyst. Based on the match data provided, write a short, honest assessment.
Return ONLY valid JSON matching this schema:
{
  "weakAreas": string[],
  "recommendation": string
}
"weakAreas" should list 1-3 specific gaps (skills or experience) as short phrases.
"recommendation" should be 1-2 sentences, professional tone, stating whether to proceed to interview and why.
Do not restate the raw scores. Focus on actionable insight.`;

    const userPrompt = JSON.stringify({
      jobTitle: job.title,
      overallScore: scoreResult.overallScore,
      breakdown: scoreResult.breakdown,
      matchedSkills: scoreResult.strengths,
      missingSkills: scoreResult.missingSkills,
      candidateExperienceYears: resume.totalExperienceYears,
      requiredExperienceYears: job.requiredExperienceYears,
    });

    const narrative = await callLLMForJSON(systemPrompt, userPrompt);

    return res.status(200).json({
      matchScore: scoreResult.overallScore,
      breakdown: scoreResult.breakdown,
      strengths: scoreResult.strengths,
      missingSkills: scoreResult.missingSkills,
      weakAreas: narrative.weakAreas || [],
      recommendation: narrative.recommendation || "",
    });
  } catch (err) {
    console.error("Match narrative error:", err.message);

    // Fallback: numeric score still works even if the LLM narrative fails
    return res.status(200).json({
      matchScore: scoreResult.overallScore,
      breakdown: scoreResult.breakdown,
      strengths: scoreResult.strengths,
      missingSkills: scoreResult.missingSkills,
      weakAreas: scoreResult.missingSkills,
      recommendation:
        scoreResult.overallScore >= 70
          ? "Strong fit based on skill and experience match. Recommend proceeding to interview."
          : "Moderate fit. Review missing skills before proceeding.",
      _fallback: true,
    });
  }
});

module.exports = router;
