import { apiClient } from "@/lib/apiClient"

export const jobService = {
  /** GET /api/jobs — public listing (all OPEN jobs), used by candidates */
  getJobs: async (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : ""
    return apiClient.get<any>(`/jobs${query}`)
  },

  /** GET /api/jobs/mine/list — employer's own jobs (all statuses) */
  getMyJobs: async () => {
    return apiClient.get<any>("/jobs/mine/list")
  },

  getJobById: async (id: string) => {
    return apiClient.get<any>(`/jobs/${id}`)
  },

  createJob: async (jobData: any) => {
    return apiClient.post<any>("/jobs", jobData)
  },

  /** Backend expects PATCH (not PUT) for job updates */
  updateJob: async (id: string, jobData: any) => {
    return apiClient.patch<any>(`/jobs/${id}`, jobData)
  },

  deleteJob: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/jobs/${id}`)
  }
}
