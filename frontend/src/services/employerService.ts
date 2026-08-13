import { apiClient, IS_MOCK } from "@/lib/apiClient"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export type VerificationStatus = "pending" | "verified" | "rejected" | "needs_more_info"

export interface EmployerRegistrationPayload {
  name: string
  email: string
  password: string
  companyName: string
  companyWebsite?: string
  designation: string
  verificationDocument?: File
}

export interface VerificationStatusResponse {
  status: VerificationStatus
  submittedAt: string
  reviewedAt?: string
  message?: string
}

/**
 * FRONTEND SERVICE CONTRACT — Employer registration + verification
 *
 * These methods will call the real backend when IS_MOCK === false.
 * The mock responses simulate the pending-review state accurately.
 * Backend/Admin controls actual status transitions.
 */
export const employerService = {
  registerEmployer: async (data: EmployerRegistrationPayload) => {
    if (IS_MOCK) {
      await delay(1200)
      return {
        success: true,
        userId: "usr_employer_mock",
        verificationStatus: "pending" as VerificationStatus,
      }
    }
    // Real API: multipart/form-data for document upload
    const formData = new FormData()
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, val as string | Blob)
      }
    })
    return apiClient.post<{ success: boolean; userId: string; verificationStatus: VerificationStatus }>(
      "/auth/register/employer",
      formData
    )
  },

  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    if (IS_MOCK) {
      await delay(600)
      return {
        status: "pending",
        submittedAt: new Date().toISOString(),
        message: "Your verification request is under review. We'll notify you once the review is complete.",
      }
    }
    return apiClient.get<VerificationStatusResponse>("/employer/verification/status")
  },

  submitAdditionalInfo: async (info: { message: string; document?: File }) => {
    if (IS_MOCK) {
      await delay(800)
      return { success: true }
    }
    const formData = new FormData()
    formData.append("message", info.message)
    if (info.document) formData.append("document", info.document)
    return apiClient.post("/employer/verification/update", formData)
  },

  getCompanyProfile: async () => {
    if (IS_MOCK) {
      await delay(500)
      return {
        id: "co_1",
        name: "Acme Corp",
        website: "https://acme.com",
        description: "We build innovative software products.",
        industry: "Technology",
        size: "50–200",
        location: "San Francisco, CA",
        logo: null,
        verified: false,
        verificationStatus: "pending" as VerificationStatus,
      }
    }
    return apiClient.get("/employer/profile")
  },

  updateCompanyProfile: async (data: any) => {
    if (IS_MOCK) {
      await delay(700)
      return { ...data, success: true }
    }
    return apiClient.put("/employer/profile", data)
  },

  getCandidates: async () => {
    if (IS_MOCK) {
      await delay(600)
      // Import here to avoid circular dependency
      const { mockCandidates } = await import("@/lib/mockData")
      return mockCandidates
    }
    return apiClient.get<any[]>("/employer/candidates")
  },

  shortlistCandidate: async (candidateId: string, jobId: string) => {
    if (IS_MOCK) {
      await delay(400)
      return { success: true, candidateId, jobId, status: "Shortlisted" }
    }
    return apiClient.post(`/employer/candidates/${candidateId}/shortlist`, { jobId })
  },

  updateCandidateStage: async (applicationId: string, stage: string) => {
    if (IS_MOCK) {
      await delay(400)
      return { success: true, applicationId, stage }
    }
    return apiClient.put(`/employer/applications/${applicationId}/stage`, { stage })
  },
}
