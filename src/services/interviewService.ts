import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockInterviews } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const interviewService = {
  getInterviews: async () => {
    if (IS_MOCK) {
      await delay(400)
      return mockInterviews
    }
    return apiClient.get<any[]>("/interviews")
  },

  getInterviewById: async (id: string) => {
    if (IS_MOCK) {
      await delay(300)
      return mockInterviews.find(i => i.id === id)
    }
    return apiClient.get<any>(`/interviews/${id}`)
  },

  scheduleInterview: async (data: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { success: true, interviewId: Math.random().toString() }
    }
    return apiClient.post<{ success: boolean; interviewId: string }>("/interviews", data)
  },

  submitFeedback: async (id: string, feedback: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { success: true }
    }
    return apiClient.post<{ success: boolean }>(`/interviews/${id}/feedback`, feedback)
  }
}
