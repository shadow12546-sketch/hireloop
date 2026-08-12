const express = require("express");
const router = express.Router();
const { buildAssessment } = require("../utils/selectAssessment");
const fs = require("fs");
const path = require("path");

const questionBank = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/questionBank.json"), "utf-8")
);

/**
 * POST /api/ai/assessment/auto-assign
 * Trigger this when an application's status moves to "Shortlisted"
 * (i.e. the candidate's resume is selected).
 *
 * Body: { applicationId, job: { requiredSkills: string[] } }
 * Returns: assessment object (10 MCQs, 2 coding questions, 60-min timer,
 * proctoring config) -- ready to be stored against that application by
 * the backend and sent to the candidate's dashboard.
 */
router.post("/assessment/auto-assign", (req, res) => {
  const { applicationId, job } = req.body;

  if (!applicationId || !job || !Array.isArray(job.requiredSkills)) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      message: "applicationId and job.requiredSkills are required",
    });
  }

  const assessment = buildAssessment(job.requiredSkills);

  return res.status(200).json({
    applicationId,
    assignedAt: new Date().toISOString(),
    ...assessment,
  });
});

/**
 * POST /api/ai/assessment/submit
 * Scores the candidate's answers server-side (correct answers are never
 * sent to the frontend, so scoring must happen here).
 *
 * Body: {
 *   applicationId,
 *   mcqAnswers: [{ id, selectedAnswer }],
 *   violationCount: number   // total flagged violations during the test
 * }
 * Returns: score breakdown. Coding question evaluation is handled
 * separately (via code execution / test cases), not scored here.
 */
router.post("/assessment/submit", (req, res) => {
  const { applicationId, mcqAnswers, violationCount } = req.body;

  if (!applicationId || !Array.isArray(mcqAnswers)) {
    return res.status(400).json({
      error: "BAD_REQUEST",
      message: "applicationId and mcqAnswers are required",
    });
  }

  let correctCount = 0;
  const results = mcqAnswers.map((ans) => {
    const original = questionBank.mcqs.find((q) => q.id === ans.id);
    const isCorrect = original && original.correctAnswer === ans.selectedAnswer;
    if (isCorrect) correctCount++;
    return { id: ans.id, isCorrect };
  });

  const mcqScorePercent = mcqAnswers.length
    ? Math.round((correctCount / mcqAnswers.length) * 100)
    : 0;

  return res.status(200).json({
    applicationId,
    mcqScorePercent,
    correctCount,
    totalMcqs: mcqAnswers.length,
    results,
    flagged: (violationCount || 0) >= 3,
    violationCount: violationCount || 0,
    submittedAt: new Date().toISOString(),
  });
});

module.exports = router;
