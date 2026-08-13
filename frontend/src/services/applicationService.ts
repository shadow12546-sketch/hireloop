import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockApplications } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const applicationService = {
  getApplications: async () => {
    if (IS_MOCK) {
      await delay(500)
      return mockApplications
    }
    return apiClient.get<any[]>("/applications")
  },

  getApplicationById: async (id: string) => {
    if (IS_MOCK) {
      await delay(400)
      return mockApplications.find(a => a.id === id)
    }
    return apiClient.get<any>(`/applications/${id}`)
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    if (IS_MOCK) {
      await delay(600)
      return { success: true, status, notes }
    }
    return apiClient.patch<{ success: boolean }>(`/applications/${id}/status`, { status, notes })
  },

  applyForJob: async (jobId: string, candidateData: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { success: true, applicationId: Math.random().toString() }
    }
    return apiClient.post<{ success: boolean; applicationId: string }>("/applications", { jobId, ...candidateData })
  }
}
