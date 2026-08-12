/**
 * In-memory interview session store.
 *
 * WHY IN-MEMORY: nothing else in the AI module uses a database yet (resume
 * parsing/matching/assessment are all stateless), and the team's DB choice
 * (Postgres vs MongoDB) isn't finalized. This keeps the interview bot fully
 * testable today, standalone, with zero DB setup.
 *
 * LIMITATION: sessions are lost if the server restarts. Fine for dev/demo
 * testing; NOT fine for the actual submitted product, since a mid-interview
 * server restart would lose the candidate's progress.
 *
 * HOW TO SWAP TO A REAL DB LATER (once Muskan's schema is ready):
 * Replace the 5 functions below with equivalent DB calls (e.g. Mongoose
 * findById/create/save, or Prisma/Postgres queries). Nothing in
 * interview.js or interviewEngine.js needs to change — they only call
 * these 5 functions, never touch storage directly.
 */

const sessions = new Map();
let sessionCounter = 0;

function generateSessionId() {
  sessionCounter += 1;
  return `interview_${Date.now()}_${sessionCounter}`;
}

function createSession(data) {
  const id = generateSessionId();
  const session = {
    _id: id,
    ...data,
    conversation: [],
    skillsCovered: [],
    questionsAsked: 0,
    status: "in-progress",
    finalEvaluation: null,
  };
  sessions.set(id, session);
  return session;
}

function getSessionById(id) {
  return sessions.get(id) || null;
}

function findSessionByCandidateAndJob(candidateId, jobId) {
  for (const session of sessions.values()) {
    if (session.candidateId === candidateId && session.jobId === jobId) {
      return session;
    }
  }
  return null;
}

/**
 * No-op for the in-memory store since sessions are stored by reference
 * (mutating the object already updates the Map's copy). Kept as a function
 * so callers don't need to change when this becomes a real async DB write.
 */
async function saveSession(session) {
  sessions.set(session._id, session);
  return session;
}

module.exports = {
  createSession,
  getSessionById,
  findSessionByCandidateAndJob,
  saveSession,
};
