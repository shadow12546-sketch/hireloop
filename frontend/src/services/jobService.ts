import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockJobs } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const jobService = {
  getJobs: async () => {
    if (IS_MOCK) {
      await delay(600)
      return mockJobs
    }
    return apiClient.get<any[]>("/jobs")
  },

  getJobById: async (id: string) => {
    if (IS_MOCK) {
      await delay(400)
      return mockJobs.find(j => j.id === id)
    }
    return apiClient.get<any>(`/jobs/${id}`)
  },

  createJob: async (jobData: any) => {
    if (IS_MOCK) {
      await delay(800)
      const newJob = { ...jobData, id: Math.random().toString(), status: "Active", created: new Date().toISOString() }
      return newJob
    }
    return apiClient.post<any>("/jobs", jobData)
  },

  updateJob: async (id: string, jobData: any) => {
    if (IS_MOCK) {
      await delay(500)
      return { ...jobData, id }
    }
    return apiClient.put<any>(`/jobs/${id}`, jobData)
  },

  deleteJob: async (id: string) => {
    if (IS_MOCK) {
      await delay(500)
      return { success: true }
    }
    return apiClient.delete<{ success: boolean }>(`/jobs/${id}`)
  }
}
