const axios = require("axios");

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

/** Used only in dev mode when the real backend isn't reachable yet. */
const MOCK_JOB_CONTEXT = {
  title: "Full Stack Developer",
  requiredSkills: ["javascript", "react", "node.js", "sql"],
  description:
    "We are looking for a Full Stack Developer to build and maintain web applications using React on the frontend and Node.js on the backend, with SQL database experience.",
};

const MOCK_RESUME_CONTEXT = {
  name: "Test Candidate",
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  totalExperienceYears: 1,
  education: [{ degree: "B.Tech Computer Science", institution: "Test University", year: "2024" }],
  experience: [
    {
      company: "Sample Corp",
      role: "Frontend Intern",
      duration: "6 months",
      description: "Built UI components in React and integrated REST APIs.",
    },
  ],
  projects: [
    {
      title: "Task Manager App",
      techStack: ["React", "Node.js", "MongoDB"],
      description: "A full-stack task management app with authentication and real-time updates.",
    },
  ],
};

/**
 * Fetches the job posting and the candidate's already-parsed resume data
 * (from the P0 resume-parsing module) to build interview context.
 * Snapshotted once at interview start so context stays stable even if the
 * underlying records change mid-interview.
 *
 * DEV MODE FALLBACK: if BACKEND_BASE_URL isn't set, returns mock job +
 * resume context so the interview bot is testable standalone before
 * Muskan's backend/DB is wired up.
 *
 * NOTE: confirm exact route names with Muskan -- assumes
 * GET /internal/jobs/:jobId and GET /internal/candidates/:candidateId/resume
 */
async function fetchInterviewContext(jobId, candidateId) {
  if (!BACKEND_BASE_URL) {
    console.warn(
      "[DEV MODE] BACKEND_BASE_URL not set — using mock job/resume context for testing."
    );
    return { jobContext: MOCK_JOB_CONTEXT, resumeContext: MOCK_RESUME_CONTEXT };
  }

  const headers = { "x-internal-token": INTERNAL_SERVICE_TOKEN };

  const [jobRes, resumeRes] = await Promise.all([
    axios.get(`${BACKEND_BASE_URL}/internal/jobs/${jobId}`, { headers, timeout: 5000 }),
    axios.get(`${BACKEND_BASE_URL}/internal/candidates/${candidateId}/resume`, {
      headers,
      timeout: 5000,
    }),
  ]);

  const job = jobRes.data;
  const resume = resumeRes.data;

  return {
    jobContext: {
      title: job.title,
      requiredSkills: job.requiredSkills || [],
      description: job.description,
    },
    resumeContext: resume,
  };
}

module.exports = { fetchInterviewContext };
