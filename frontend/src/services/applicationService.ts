import { apiClient } from "@/lib/apiClient"

export const applicationService = {
  /**
   * GET /api/applications/mine — candidate's own applications
   */
  getApplications: async () => {
    return apiClient.get<any>("/applications/mine")
  },

  /**
   * GET /api/applications/job/:jobId — employer listing applications for a specific job
   */
  getApplicationsForJob: async (jobId: string) => {
    return apiClient.get<any>(`/applications/job/${jobId}`)
  },

  /**
   * Helper for Employer pages to load applications across all their jobs.
   */
  getEmployerApplications: async () => {
    try {
      const jobsRes: any = await apiClient.get<any>("/jobs/mine/list")
      const jobs = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data?.jobs || jobsRes?.jobs || jobsRes?.data || []
      
      const allApps: any[] = []
      for (const job of jobs) {
        const jobId = job._id || job.id
        if (!jobId) continue
        try {
          const appRes: any = await apiClient.get<any>(`/applications/job/${jobId}`)
          const appsList = Array.isArray(appRes) ? appRes : appRes?.data?.applications || appRes?.applications || appRes?.data || []
          if (Array.isArray(appsList)) {
            appsList.forEach((app: any) => {
              allApps.push({
                ...app,
                jobTitle: job.title || app.jobTitle || 'Job Role',
                candidateName: typeof app.candidate === 'object' ? app.candidate?.name : app.candidateName || 'Applicant',
                candidateEmail: typeof app.candidate === 'object' ? app.candidate?.email : app.candidateEmail || '',
                candidateId: typeof app.candidate === 'object' ? app.candidate?._id || app.candidate?.id : app.candidate || app.candidateId,
                appliedDate: app.appliedAt || app.createdAt || new Date().toISOString(),
              })
            })
          }
        } catch {
          // ignore error for individual job
        }
      }
      return allApps
    } catch {
      return []
    }
  },

  getApplicationById: async (id: string) => {
    return apiClient.get<any>(`/applications/${id}`)
  },

  /**
   * PATCH /api/applications/:id/advance — advance to next stage
   * Body: { toStatus: string, note?: string }
   *
   * POST /api/applications/:id/decision — final decision (OFFER or REJECTED)
   * Body: { decision: "OFFER" | "REJECTED", note?: string }
   */
  updateApplicationStatus: async (id: string, status: string, note?: string) => {
    if (status === "OFFER" || status === "REJECTED") {
      return apiClient.post<{ success: boolean }>(
        `/applications/${id}/decision`,
        { decision: status, note: note || "" }
      )
    }
    return apiClient.patch<{ success: boolean }>(
      `/applications/${id}/advance`,
      { toStatus: status, note: note || "" }
    )
  },

  /**
   * POST /api/applications — apply for a job
   * Body: { jobId: string, resumeId?: string }
   * Requires candidate role.
   */
  applyForJob: async (jobId: string, resumeId?: string) => {
    const body: Record<string, string> = { jobId }
    if (resumeId) body.resumeId = resumeId
    return apiClient.post<{ success: boolean; data: { application: any } }>(
      "/applications",
      body
    )
  }
}
