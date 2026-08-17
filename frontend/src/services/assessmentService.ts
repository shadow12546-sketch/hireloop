import { apiClient } from "@/lib/apiClient"

/**
 * Backend assessment endpoints:
 *   GET  /api/assessments/attempts/:id — get attempt
 *   PATCH /api/assessments/attempts/:id/start — start attempt (candidate)
 *   POST  /api/assessments/attempts/:id/submit — submit attempt (candidate)
 *   GET  /api/assessments/application/:applicationId — get attempt by application
 *   GET  /api/assessments/templates — list templates (employer only)
 */
export const assessmentService = {
  /** GET /api/assessments/templates — list templates (employer only) */
  getAssessmentTemplates: async (): Promise<any[]> => {
    try {
      const res: any = await apiClient.get<any>("/assessments/templates")
      return Array.isArray(res) ? res : res?.data?.templates || res?.templates || res?.data || []
    } catch {
      return []
    }
  },

  /** Employer view: loads assessment attempts across employer's jobs */
  getEmployerAssessments: async (): Promise<any[]> => {
    try {
      const jobsRes: any = await apiClient.get<any>("/jobs/mine/list")
      const jobs = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data?.jobs || jobsRes?.jobs || jobsRes?.data || []

      const attempts: any[] = []
      for (const job of jobs) {
        const jobId = job._id || job.id
        if (!jobId) continue
        try {
          const appRes: any = await apiClient.get<any>(`/applications/job/${jobId}`)
          const appsList = Array.isArray(appRes) ? appRes : appRes?.data?.applications || appRes?.applications || appRes?.data || []
          if (Array.isArray(appsList)) {
            for (const app of appsList) {
              if (app.assignedAssessmentAttempt) {
                const att = typeof app.assignedAssessmentAttempt === "object" ? app.assignedAssessmentAttempt : null
                const candidateName = typeof app.candidate === "object" ? app.candidate?.name : "Applicant"
                if (att) {
                  attempts.push({
                    id: att._id || att.id,
                    candidate: candidateName,
                    role: job.title || "Job Position",
                    title: att.assessment?.title || "AI Technical Assessment",
                    date: att.submittedAt || att.createdAt || new Date().toISOString(),
                    status:
                      att.status === "SUBMITTED" || att.status === "EVALUATED"
                        ? "Completed"
                        : att.status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Assigned",
                    score: att.score !== undefined && att.maxScore ? `${att.score} / ${att.maxScore}` : "—",
                  })
                }
              }
            }
          }
        } catch {
          // ignore error per job
        }
      }
      return attempts
    } catch {
      return []
    }
  },

  /** Candidate-safe listing: loads assigned assessment attempts via candidate applications */
  getCandidateAssessments: async (): Promise<any[]> => {
    const res: any = await apiClient.get<any>("/applications/mine")
    const appsList = Array.isArray(res) ? res : res?.data?.applications || res?.applications || res?.data || []

    const attempts: any[] = []
    if (Array.isArray(appsList)) {
      for (const app of appsList) {
        let attempt = app.assignedAssessmentAttempt
        if (typeof attempt === "object" && attempt !== null) {
          attempts.push({
            ...attempt,
            id: attempt._id || attempt.id,
            jobTitle: app.job?.title || "Job Position",
            company: typeof app.job?.company === "object" ? app.job.company.name : "Company",
            duration: `${attempt.assessment?.durationMinutes || 60} Mins`,
            deadline: attempt.expiresAt || app.appliedAt || new Date().toISOString(),
            title: attempt.assessment?.title || "Skills Assessment",
          })
        } else if (app._id || app.id) {
          try {
            const attemptRes: any = await apiClient.get<any>(`/assessments/application/${app._id || app.id}`)
            const fetched = attemptRes?.data?.attempt || attemptRes?.attempt || attemptRes?.data
            if (fetched) {
              attempts.push({
                ...fetched,
                id: fetched._id || fetched.id,
                jobTitle: app.job?.title || "Job Position",
                company: typeof app.job?.company === "object" ? app.job.company.name : "Company",
                duration: `${fetched.assessment?.durationMinutes || 60} Mins`,
                deadline: fetched.expiresAt || app.appliedAt || new Date().toISOString(),
                title: fetched.assessment?.title || "Skills Assessment",
              })
            }
          } catch {
            // No assessment attempt for this application
          }
        }
      }
    }
    return attempts
  },

  /** Smart getAssessments wrapper: uses candidate endpoint for candidates, employer endpoint for employers */
  getAssessments: async (): Promise<any[]> => {
    try {
      return await assessmentService.getCandidateAssessments()
    } catch (err: any) {
      if (err?.message?.includes("candidate") || err?.message?.includes("403")) {
        return await assessmentService.getEmployerAssessments()
      }
      throw err
    }
  },

  /** GET /api/assessments/attempts/:id — get a specific assessment attempt */
  getAssessmentById: async (id: string) => {
    const res: any = await apiClient.get<any>(`/assessments/attempts/${id}`)
    return res?.data?.attempt || res?.attempt || res?.data || res
  },

  /**
   * GET /api/assessments/application/:applicationId — get attempt by application
   */
  getAssessmentByApplication: async (applicationId: string) => {
    const res: any = await apiClient.get<any>(`/assessments/application/${applicationId}`)
    return res?.data?.attempt || res?.attempt || res?.data || res
  },

  /**
   * PATCH /api/assessments/attempts/:id/start — start assessment (candidate)
   */
  startAssessment: async (id: string) => {
    const res: any = await apiClient.patch<any>(`/assessments/attempts/${id}/start`, {})
    return res?.data?.attempt || res?.attempt || res?.data || res
  },

  /**
   * POST /api/assessments/attempts/:id/submit — submit answers (candidate)
   * Expects payload: { responses: [{ questionId, answer }] }
   */
  submitAssessment: async (id: string, payload: { responses: Array<{ questionId: string; answer: string }> }) => {
    const res: any = await apiClient.post<any>(`/assessments/attempts/${id}/submit`, payload)
    return res?.data?.attempt || res?.attempt || res?.data || res
  },

  sendAssessment: async (_candidateId: string, _assessmentId: string) => {
    return { success: false, error: "Assessments are auto-assigned by the AI workflow." }
  },
}
