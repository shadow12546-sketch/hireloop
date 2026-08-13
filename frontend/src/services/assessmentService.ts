import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockAssessments } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const assessmentService = {
  getAssessments: async () => {
    if (IS_MOCK) {
      await delay(400)
      return mockAssessments
    }
    return apiClient.get<any[]>("/assessments")
  },

  getAssessmentById: async (id: string) => {
    if (IS_MOCK) {
      await delay(300)
      return mockAssessments.find(a => a.id === id)
    }
    return apiClient.get<any>(`/assessments/${id}`)
  },

  sendAssessment: async (candidateId: string, assessmentId: string) => {
    if (IS_MOCK) {
      await delay(600)
      return { success: true }
    }
    return apiClient.post<{ success: boolean }>("/assessments/send", { candidateId, assessmentId })
  },

  submitAssessment: async (id: string, answers: any) => {
    if (IS_MOCK) {
      await delay(1000)
      return { success: true, score: 85 }
    }
    return apiClient.post<{ success: boolean; score: number }>(`/assessments/${id}/submit`, answers)
  }
}
