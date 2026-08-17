import { apiClient } from "@/lib/apiClient"

/**
 * NOTE: The backend does NOT have a /interviews route.
 * Interviews in HireLoop are AI-driven sessions tracked via:
 *   POST /api/ai/interview/session
 *   GET  /api/ai/interview/session/:applicationId
 *
 * The methods below gracefully handle missing endpoints.
 */
export const interviewService = {
  /** No backend /interviews list endpoint. Returns empty array. */
  getInterviews: async (): Promise<any[]> => {
    return []
  },

  /** No backend /interviews/:id endpoint. Returns null. */
  getInterviewById: async (_id: string): Promise<null> => {
    return null
  },

  /**
   * Get AI interview session for an application.
   * GET /api/ai/interview/session/:applicationId
   */
  getInterviewSession: async (applicationId: string) => {
    try {
      return await apiClient.get<any>(`/ai/interview/session/${applicationId}`)
    } catch {
      return null
    }
  },

  /**
   * Save/update AI interview session.
   * POST /api/ai/interview/session
   * Body: { applicationId, transcript?, summary?, score?, recommendation?, status? }
   */
  saveInterviewSession: async (applicationId: string, sessionData: any) => {
    return apiClient.post<any>("/ai/interview/session", {
      applicationId,
      ...sessionData,
    })
  },

  /** No backend /interviews schedule endpoint. */
  scheduleInterview: async (_data: any) => {
    return { success: false, error: "Interview scheduling not supported in this version." }
  },

  /** No backend /interviews/:id/feedback endpoint. */
  submitFeedback: async (_id: string, _feedback: any) => {
    return { success: false, error: "Feedback submission not supported in this version." }
  }
}
