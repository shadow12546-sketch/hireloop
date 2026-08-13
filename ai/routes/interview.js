const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessionById,
  findSessionByCandidateAndJob,
  saveSession,
} = require("../utils/sessionStore");
const { verifyCandidateShortlisted } = require("../utils/verifySelection");
const { fetchInterviewContext } = require("../utils/fetchContext");
const { generateNextQuestion, generateFinalEvaluation } = require("../utils/interviewEngine");
const { generateSpeech } = require("../utils/ttsProvider");

const DURATION_MINUTES = 30;
const MIN_QUESTIONS = 8;
const MAX_QUESTIONS = 10;

/**
 * Adds an interviewer turn to the session, generates speech, saves, returns
 * the payload. isClosingQuestion is stored ON THE TURN itself -- this is
 * the single source of truth /respond checks later, so the "should we wrap
 * up" decision is made ONCE (here, via the engine) and never recomputed
 * with different logic elsewhere.
 */
async function askQuestion(session, questionResult) {
  session.conversation.push({
    role: "interviewer",
    content: questionResult.question,
    skillTag: questionResult.targetSkill || null,
    isClosingQuestion: !!questionResult.isClosingQuestion,
    timestamp: new Date(),
  });
  if (questionResult.targetSkill && !session.skillsCovered.includes(questionResult.targetSkill)) {
    session.skillsCovered.push(questionResult.targetSkill);
  }
  session.questionsAsked += 1;
  await saveSession(session);

  const speech = await generateSpeech(questionResult.question);

  return {
    sessionId: session._id,
    questionText: questionResult.question,
    audioBase64: speech.audioBase64,
    useBrowserTTS: speech.useBrowserTTS,
    isClosingQuestion: !!questionResult.isClosingQuestion,
    progress: {
      questionsAsked: session.questionsAsked,
      minQuestions: session.config.minQuestions,
      maxQuestions: session.config.maxQuestions,
    },
  };
}

/**
 * POST /api/ai/interview/start
 * body: { applicationId }
 * Gated on shortlisting, same trigger point as the auto-assign assessment.
 * One session per candidate/job pair.
 */
router.post("/interview/start", async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ error: "applicationId is required" });
    }

    const eligibility = await verifyCandidateShortlisted(applicationId);
    if (!eligibility.eligible) {
      return res.status(403).json({
        error: "Interview can only start after the candidate is shortlisted",
        currentStatus: eligibility.currentStatus,
      });
    }
    const { candidateId, jobId } = eligibility;

    const existing = findSessionByCandidateAndJob(candidateId, jobId);
    if (existing) {
      if (existing.status === "completed") {
        return res.status(409).json({ error: "Interview already completed for this candidate/job" });
      }
      // Resume: don't re-ask, just return the most recent interviewer question.
      const lastQuestion = [...existing.conversation].reverse().find((t) => t.role === "interviewer");
      const speech = lastQuestion
        ? await generateSpeech(lastQuestion.content)
        : { audioBase64: null, useBrowserTTS: true };

      return res.status(200).json({
        sessionId: existing._id,
        resumed: true,
        questionText: lastQuestion?.content,
        audioBase64: speech.audioBase64,
        useBrowserTTS: speech.useBrowserTTS,
        progress: {
          questionsAsked: existing.questionsAsked,
          minQuestions: existing.config.minQuestions,
          maxQuestions: existing.config.maxQuestions,
        },
      });
    }

    const { jobContext, resumeContext } = await fetchInterviewContext(jobId, candidateId);

    const startTime = new Date();
    const softEndTime = new Date(startTime.getTime() + DURATION_MINUTES * 60 * 1000);

    const session = createSession({
      candidateId,
      jobId,
      applicationId,
      jobContext,
      resumeContext,
      config: {
        durationMinutes: DURATION_MINUTES,
        minQuestions: MIN_QUESTIONS,
        maxQuestions: MAX_QUESTIONS,
      },
      startTime,
      softEndTime,
    });

    const firstQuestion = await generateNextQuestion(session);
    const payload = await askQuestion(session, firstQuestion);
    payload.resumed = false;
    payload.startTime = session.startTime;
    payload.softEndTime = session.softEndTime;

    return res.status(201).json(payload);
  } catch (err) {
    console.error("interview/start error:", err);
    return res.status(500).json({ error: "Failed to start interview" });
  }
});

/**
 * POST /api/ai/interview/respond
 * body: { sessionId, transcript }
 * `transcript` is the candidate's spoken answer, already converted to text
 * by the frontend's browser SpeechRecognition -- this route never touches
 * raw audio input.
 */
router.post("/interview/respond", async (req, res) => {
  try {
    const { sessionId, transcript } = req.body;
    if (!sessionId || !transcript) {
      return res.status(400).json({ error: "sessionId and transcript are required" });
    }

    const session = getSessionById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "in-progress") {
      return res.status(409).json({ error: `Interview already ${session.status}` });
    }

    session.conversation.push({ role: "candidate", content: transcript, timestamp: new Date() });
    await saveSession(session);

    // FIX: read the closing flag directly off the last interviewer turn --
    // this was set once by the engine when the question was generated, so
    // there's no risk of this check disagreeing with that decision.
    const lastInterviewerTurn = [...session.conversation].reverse().find((t) => t.role === "interviewer");
    const wasClosingQuestion = !!lastInterviewerTurn?.isClosingQuestion;

    if (wasClosingQuestion) {
      const evaluation = await generateFinalEvaluation(session);
      session.finalEvaluation = evaluation;
      session.status = "completed";
      await saveSession(session);
      return res.status(200).json({ completed: true, evaluation });
    }

    const nextQuestion = await generateNextQuestion(session);
    const payload = await askQuestion(session, nextQuestion);
    payload.completed = false;

    return res.status(200).json(payload);
  } catch (err) {
    console.error("interview/respond error:", err);
    return res.status(500).json({ error: "Failed to process response" });
  }
});

/**
 * GET /api/ai/interview/:sessionId/summary
 * Returns the final evaluation for a completed session (recruiter-facing).
 */
router.get("/interview/:sessionId/summary", (req, res) => {
  try {
    const session = getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "completed") {
      return res.status(409).json({ error: "Interview not yet completed", status: session.status });
    }

    return res.status(200).json({
      sessionId: session._id,
      candidateId: session.candidateId,
      jobId: session.jobId,
      evaluation: session.finalEvaluation,
      transcript: session.conversation,
    });
  } catch (err) {
    console.error("interview/summary error:", err);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
});

module.exports = router;
