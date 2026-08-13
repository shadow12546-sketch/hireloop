const axios = require("axios");

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

/**
 * Checks whether a candidate's application has reached "Shortlisted" status
 * (the gate for starting the AI interview, same trigger point as the
 * auto-assign assessment feature).
 *
 * DEV MODE FALLBACK: if BACKEND_BASE_URL isn't set (i.e. Muskan's backend
 * isn't wired up / reachable yet), this returns a mock "eligible" result
 * so the interview bot can be developed and tested standalone. This
 * fallback is skipped automatically once BACKEND_BASE_URL is set.
 *
 * NOTE: confirm the exact route with Muskan --
 * assumes GET /internal/applications/:applicationId/status
 * returning { status, candidateId, jobId }.
 */
async function verifyCandidateShortlisted(applicationId) {
  if (!BACKEND_BASE_URL) {
    console.warn(
      "[DEV MODE] BACKEND_BASE_URL not set — using mock shortlisted candidate for testing."
    );
    return {
      eligible: true,
      currentStatus: "Shortlisted",
      candidateId: `mock_candidate_${applicationId}`,
      jobId: "mock_job_1",
    };
  }

  try {
    const res = await axios.get(
      `${BACKEND_BASE_URL}/internal/applications/${applicationId}/status`,
      {
        headers: { "x-internal-token": INTERNAL_SERVICE_TOKEN },
        timeout: 5000,
      }
    );

    const { status, candidateId, jobId } = res.data;
    return {
      eligible: status === "Shortlisted",
      currentStatus: status,
      candidateId,
      jobId,
    };
  } catch (err) {
    console.error("verifyCandidateShortlisted failed:", err.message);
    throw new Error("ELIGIBILITY_CHECK_FAILED");
  }
}

module.exports = { verifyCandidateShortlisted };
