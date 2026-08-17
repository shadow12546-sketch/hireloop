import { apiClient } from "@/lib/apiClient"

export type VerificationStatus = "pending" | "verified" | "rejected" | "needs_more_info"

export const employerService = {
  /**
   * GET /api/companies/me — employer's own company profile.
   * Requires employer role.
   */
  getCompanyProfile: async () => {
    return apiClient.get<any>("/companies/me")
  },

  /**
   * PUT /api/companies/me — update employer's company profile.
   * Body: { name, description?, industry?, location?, website?, logoUrl? }
   * Requires employer role.
   */
  updateCompanyProfile: async (data: any) => {
    return apiClient.put<any>("/companies/me", data)
  },

  /**
   * GET /api/candidates/:userId — employer viewing a specific candidate's profile.
   * Requires employer role.
   */
  getCandidateById: async (userId: string) => {
    return apiClient.get<any>(`/candidates/${userId}`)
  },

  /**
   * Advance an application to SHORTLISTED stage.
   * Maps to PATCH /api/applications/:applicationId/advance
   */
  shortlistCandidate: async (applicationId: string) => {
    return apiClient.patch<{ success: boolean }>(
      `/applications/${applicationId}/advance`,
      { toStatus: "SHORTLISTED", note: "" }
    )
  },

  /**
   * Update application stage (advance or final decision).
   * Advance: PATCH /api/applications/:applicationId/advance with { toStatus, note }
   * Decision: POST /api/applications/:applicationId/decision with { decision, note }
   */
  updateCandidateStage: async (applicationId: string, stage: string, note?: string) => {
    if (stage === "OFFER" || stage === "REJECTED") {
      return apiClient.post(`/applications/${applicationId}/decision`, {
        decision: stage,
        note: note || ""
      })
    }
    return apiClient.patch(`/applications/${applicationId}/advance`, {
      toStatus: stage,
      note: note || ""
    })
  },

  /**
   * NOTE: Employer verification endpoints do NOT exist in the backend.
   * These return mock data to prevent 404 crashes.
   */
  getVerificationStatus: async (): Promise<{ status: VerificationStatus; submittedAt: string; message?: string }> => {
    // No backend endpoint. Return a mock verified state.
    return {
      status: "verified" as VerificationStatus,
      submittedAt: new Date().toISOString(),
      message: undefined,
    }
  },

  submitAdditionalInfo: async (_info: { message: string; document?: File }) => {
    // No backend endpoint for this.
    return { success: true }
  },
}
