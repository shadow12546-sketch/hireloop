/**
 * Computes deterministic sub-scores by comparing parsed resume data
 * against a job's requirements. No LLM involved here — pure logic,
 * so scores are consistent and reproducible every time.
 */

function normalizeSkill(skill) {
  return skill.trim().toLowerCase();
}

/**
 * @param {string[]} candidateSkills
 * @param {string[]} requiredSkills
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
function scoreSkillMatch(candidateSkills = [], requiredSkills = []) {
  if (requiredSkills.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }

  const candidateSet = new Set(candidateSkills.map(normalizeSkill));
  const matched = [];
  const missing = [];

  for (const req of requiredSkills) {
    if (candidateSet.has(normalizeSkill(req))) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
}

/**
 * @param {number} candidateYears
 * @param {number} requiredYears
 * @returns {number} 0-100
 */
function scoreExperienceMatch(candidateYears = 0, requiredYears = 0) {
  if (requiredYears === 0) return 100;
  if (candidateYears >= requiredYears) return 100;
  // Partial credit, scaled linearly, floor at 0
  const ratio = candidateYears / requiredYears;
  return Math.max(0, Math.round(ratio * 100));
}

/**
 * Simple heuristic: does candidate have a degree at or above a common
 * bar (Bachelor's), matched loosely by keyword. This is intentionally
 * simple — full semantic matching is handled by the LLM narrative layer.
 * @param {Array<{degree: string}>} education
 * @returns {number} 0-100
 */
function scoreEducationMatch(education = []) {
  if (education.length === 0) return 40; // no data, neutral-low default
  const degreeText = education.map((e) => (e.degree || "").toLowerCase()).join(" ");
  const hasBachelorsOrAbove =
    /b\.?tech|b\.?e\b|b\.?sc|bachelor|m\.?tech|master|phd/.test(degreeText);
  return hasBachelorsOrAbove ? 100 : 60;
}

/**
 * Simple heuristic: percentage of candidate's project tech stacks that
 * overlap with the job's required skills — proxy for domain relevance.
 * @param {Array<{techStack: string[]}>} projects
 * @param {string[]} requiredSkills
 * @returns {number} 0-100
 */
function scoreProjectRelevance(projects = [], requiredSkills = []) {
  if (projects.length === 0 || requiredSkills.length === 0) return 50; // neutral default

  const requiredSet = new Set(requiredSkills.map(normalizeSkill));
  let overlapCount = 0;
  let totalTechMentions = 0;

  for (const project of projects) {
    const stack = project.techStack || [];
    totalTechMentions += stack.length;
    for (const tech of stack) {
      if (requiredSet.has(normalizeSkill(tech))) overlapCount++;
    }
  }

  if (totalTechMentions === 0) return 50;
  return Math.round((overlapCount / totalTechMentions) * 100);
}

/**
 * Combines all sub-scores into the final weighted match score,
 * per the blueprint's Section 07 weighting: skill 40%, experience 30%,
 * education 15%, project 15%.
 *
 * @param {object} resume - parsed resume JSON (from /resume/parse)
 * @param {object} job - { requiredSkills: string[], requiredExperienceYears: number }
 * @returns {object} full breakdown + overall score
 */
function computeMatchScore(resume, job) {
  const skillResult = scoreSkillMatch(resume.skills, job.requiredSkills);
  const experienceScore = scoreExperienceMatch(
    resume.totalExperienceYears,
    job.requiredExperienceYears
  );
  const educationScore = scoreEducationMatch(resume.education);
  const projectScore = scoreProjectRelevance(resume.projects, job.requiredSkills);

  const overallScore = Math.round(
    skillResult.score * 0.4 +
      experienceScore * 0.3 +
      educationScore * 0.15 +
      projectScore * 0.15
  );

  return {
    overallScore,
    breakdown: {
      skillMatch: skillResult.score,
      experienceMatch: experienceScore,
      educationMatch: educationScore,
      projectMatch: projectScore,
    },
    strengths: skillResult.matched,
    missingSkills: skillResult.missing,
  };
}

module.exports = { computeMatchScore };
