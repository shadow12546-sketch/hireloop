const { callLLMForJSON } = require("./llmClient"); // reuses the existing Groq client from resume parsing/matching

/** Safe default questions if the LLM call fails entirely — keeps the interview alive. */
const FALLBACK_QUESTIONS = [
  "Can you walk me through a project you are most proud of and the technical decisions you made?",
  "Tell me about a time you had to debug a particularly difficult issue. How did you approach it?",
  "How do you typically handle disagreements with a teammate about a technical approach?",
  "What excites you most about this role, and what would you want to learn in your first few months?",
];

function buildContextBlock(session) {
  const { jobContext, resumeContext } = session;
  return `
JOB TITLE: ${jobContext.title}
REQUIRED SKILLS: ${jobContext.requiredSkills.join(", ")}
JOB DESCRIPTION: ${jobContext.description}

CANDIDATE RESUME (parsed):
${JSON.stringify(resumeContext, null, 2)}

SKILLS ALREADY COVERED IN THIS INTERVIEW: ${session.skillsCovered.join(", ") || "none yet"}
`.trim();
}

function buildConversationTranscript(session) {
  return session.conversation
    .map((turn) => `${turn.role === "interviewer" ? "Interviewer" : "Candidate"}: ${turn.content}`)
    .join("\n");
}

/**
 * True once we've hit min questions AND are close to the soft time limit,
 * or once we've hit max questions outright.
 */
function shouldWrapUp(session) {
  const now = new Date();
  const minutesRemaining = (new Date(session.softEndTime) - now) / 60000;
  const hitMinQuestions = session.questionsAsked >= session.config.minQuestions;
  const hitMaxQuestions = session.questionsAsked >= session.config.maxQuestions;
  const timeRunningOut = minutesRemaining <= 4; // leave room for one closing Q + answer

  return hitMaxQuestions || (hitMinQuestions && timeRunningOut);
}

function pickFallbackQuestion(session, isWrapUp) {
  const askedTexts = session.conversation.filter((t) => t.role === "interviewer").map((t) => t.content);
  const fallback = FALLBACK_QUESTIONS.find((q) => !askedTexts.includes(q)) || FALLBACK_QUESTIONS[0];
  return { question: fallback, targetSkill: "general", isClosingQuestion: isWrapUp };
}

/**
 * Generates the next interview question. On the first call (empty
 * conversation) it produces an opening question; otherwise it reads the
 * full conversation history and either digs deeper into the last answer
 * or pivots to an uncovered required skill.
 *
 * NOTE: the shared llmClient.js (Groq) THROWS on failure rather than
 * returning null -- this function catches that here, at the point of use,
 * so the interview always continues on a safe fallback question instead of
 * crashing. Never let this function throw upward.
 */
async function generateNextQuestion(session) {
  const isFirstQuestion = session.conversation.length === 0;
  const isWrapUp = !isFirstQuestion && shouldWrapUp(session);

  const systemPrompt = `You are an experienced technical interviewer conducting a live spoken interview for a specific job.
Ask ONE question at a time, grounded in the actual job requirements and the candidate's real resume — never generic.
Mix technical depth questions with a couple of behavioral/situational ones across the interview.
Do not repeat a skill area already listed as covered unless you are asking a natural follow-up to the candidate's last answer.
Keep questions conversational and speakable out loud — no bullet points, no code blocks, one clear question.
Respond ONLY with a JSON object: { "question": string, "targetSkill": string, "isClosingQuestion": boolean }`;

  let userPrompt;
  if (isFirstQuestion) {
    userPrompt = `${buildContextBlock(session)}\n\nGenerate the OPENING question for this interview. Reference something specific from the candidate's resume (a project, a skill, or experience) tied to the job's requirements.`;
  } else if (isWrapUp) {
    userPrompt = `${buildContextBlock(session)}\n\nCONVERSATION SO FAR:\n${buildConversationTranscript(session)}\n\nWe are near the time/question limit. Generate a CLOSING question — wrap toward a final, reflective question (e.g. asking what excites them about the role, or a summarizing question) rather than opening a brand new deep topic. Set isClosingQuestion to true.`;
  } else {
    userPrompt = `${buildContextBlock(session)}\n\nCONVERSATION SO FAR:\n${buildConversationTranscript(session)}\n\nBased on the candidate's last answer, generate the NEXT question — either a relevant follow-up that digs deeper into what they just said, or a pivot to an uncovered required skill if the last topic feels sufficiently explored. Set isClosingQuestion to false.`;
  }

  try {
    const result = await callLLMForJSON(systemPrompt, userPrompt);
    if (!result || !result.question) {
      return pickFallbackQuestion(session, isWrapUp);
    }
    // Always trust our own wrap-up calculation over whatever the LLM claims,
    // so the closing flag is authoritative and consistent -- single source
    // of truth that /respond checks later, no mismatch possible.
    return { ...result, isClosingQuestion: isWrapUp };
  } catch (err) {
    console.warn("generateNextQuestion: LLM call failed, using fallback question:", err.message);
    return pickFallbackQuestion(session, isWrapUp);
  }
}

/**
 * Generates the final scored evaluation from the complete transcript.
 * Falls back to a neutral placeholder (never a crash) if the LLM call fails
 * — a human recruiter should still review the raw transcript in that case.
 */
async function generateFinalEvaluation(session) {
  const systemPrompt = `You are an experienced technical interviewer producing a final evaluation of a completed interview.
Base your evaluation ONLY on what the candidate actually said in the transcript — do not invent claims.
Score fairly and specifically relative to the job's required skills.
Respond ONLY with a JSON object: { "score": number (0-100), "strengths": string[], "gaps": string[], "recommendation": string, "summary": string }`;

  const userPrompt = `${buildContextBlock(session)}\n\nFULL INTERVIEW TRANSCRIPT:\n${buildConversationTranscript(session)}\n\nProduce the final evaluation now.`;

  try {
    const result = await callLLMForJSON(systemPrompt, userPrompt);
    if (!result) throw new Error("empty result");
    return result;
  } catch (err) {
    console.warn("generateFinalEvaluation: LLM call failed, returning placeholder:", err.message);
    return {
      score: null,
      strengths: [],
      gaps: [],
      recommendation: "Automated evaluation unavailable — please review the transcript manually.",
      summary: "Evaluation generation failed; raw transcript is preserved on this session for manual review.",
    };
  }
}

module.exports = { generateNextQuestion, generateFinalEvaluation, shouldWrapUp };
