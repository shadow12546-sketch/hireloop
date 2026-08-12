const fs = require("fs");
const path = require("path");

const questionBank = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/questionBank.json"), "utf-8")
);

function normalizeSkill(skill) {
  return skill.trim().toLowerCase();
}

/**
 * Shuffles an array in place (Fisher-Yates), returns a new array.
 */
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selects 10 MCQs matching the job's required skills first, falling back
 * to general questions if there aren't enough skill-matched ones.
 * Also shuffles each question's option order so candidates can't
 * pattern-match by option position.
 *
 * @param {string[]} requiredSkills
 * @returns {Array} 10 MCQ objects, WITHOUT correctAnswer (never sent to frontend)
 */
function selectMCQs(requiredSkills = []) {
  const skillSet = new Set(requiredSkills.map(normalizeSkill));

  const matched = questionBank.mcqs.filter((q) => skillSet.has(q.skill));
  const general = questionBank.mcqs.filter((q) => q.skill === "general");
  const rest = questionBank.mcqs.filter(
    (q) => !skillSet.has(q.skill) && q.skill !== "general"
  );

  // Priority: skill-matched first, then general, then anything else, until we hit 10
  const pool = [...shuffle(matched), ...shuffle(general), ...shuffle(rest)];
  const selected = pool.slice(0, 10);

  // Shuffle option order per question, strip correctAnswer before returning
  return selected.map((q) => ({
    id: q.id,
    skill: q.skill,
    question: q.question,
    options: shuffle(q.options),
  }));
}

/**
 * Selects 2 coding/DSA questions at random (DSA is largely language-agnostic,
 * so skill-tag matching isn't as meaningful here as it is for MCQs).
 * @returns {Array} 2 coding question objects
 */
function selectCodingQuestions() {
  return shuffle(questionBank.codingQuestions).slice(0, 2);
}

/**
 * Builds the full assessment object assigned to a candidate.
 * Face monitoring intentionally excluded (time constraint) -- everything
 * else from the agreed proctoring scope is included.
 *
 * @param {string[]} requiredSkills
 * @returns {object} assessment with questions, timer, and proctoring config
 */
function buildAssessment(requiredSkills = []) {
  return {
    durationMinutes: 60,
    autoSubmitOnTimeout: true,
    proctoring: {
      fullscreenRequired: true,
      tabSwitchLocked: true,
      copyPasteDisabled: true,
      rightClickDisabled: true,
      devToolsDisabled: true,
      violationThresholdBeforeAutoSubmit: 3,
      // Each violation type increments a shared counter on the frontend:
      // tab-switch, fullscreen-exit. (Face monitoring excluded for now --
      // can be added later as a P2 stretch if time allows.)
    },
    navigation: {
      oneQuestionAtATime: true,
      allowGoBack: false,
    },
    mcqs: selectMCQs(requiredSkills),
    codingQuestions: selectCodingQuestions(),
  };
}

module.exports = { buildAssessment, selectMCQs, selectCodingQuestions };
