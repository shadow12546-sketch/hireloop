import { apiClient } from "@/lib/apiClient"

export interface ParsedExperience {
  title?: string
  company?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  description?: string
}

export interface ParsedEducation {
  institution?: string
  degree?: string
  fieldOfStudy?: string
  startYear?: number | string
  endYear?: number | string
}

export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  location?: string

  skills?: string[]

  experience?: ParsedExperience[]

  education?: ParsedEducation[]

  certifications?: string[]
  languages?: string[]

  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string

  projects?: unknown[]

  totalExperienceYears?: number
  atsScore?: number | null
}

interface UploadResumeResponse {
  success: boolean
  message: string
  data: {
    resume: {
      id: string
      originalFilename: string
      mimeType: string
      fileSize: number
      uploadedAt: string
    }
  }
}

interface ParseResumeResponse {
  success: boolean
  message: string
  data: {
    analysis: unknown
    parsedResume: ParsedResume
  }
}

export interface AiAnalysisResult {
  matchScore: number
  strengths: string[]
  missingSkills: string[]
  skillGaps: string[]
  recommendations: string[]
}

export const aiService = {
  /**
   * Upload resume -> get resumeId -> AI parse.
   *
   * Backend:
   * POST /api/resumes/upload
   * field: resume
   *
   * POST /api/ai/resume/parse
   * body: { resumeId }
   */
  parseResume: async (file: File): Promise<ParsedResume> => {
    const formData = new FormData()

    formData.append("resume", file)

    const uploadResponse =
      await apiClient.post<UploadResumeResponse>(
        "/resumes/upload",
        formData
      )

    const resumeId =
      uploadResponse?.data?.resume?.id

    if (!resumeId) {
      throw new Error(
        "Resume uploaded, but server did not return a resume ID."
      )
    }

    const parseResponse =
      await apiClient.post<ParseResumeResponse>(
        "/ai/resume/parse",
        {
          resumeId,
        }
      )

    const parsedResume =
      parseResponse?.data?.parsedResume

    if (!parsedResume) {
      throw new Error(
        "Resume was uploaded, but AI parsing returned no profile data."
      )
    }

    return {
      ...parsedResume,

      // Keep the resume ID available to frontend.
      resumeId,
    } as ParsedResume & {
      resumeId: string
    }
  },

  analyzeCandidate: async (
    applicationId: string
  ): Promise<AiAnalysisResult> => {
    return apiClient.post<AiAnalysisResult>(
      `/ai/analyze/${applicationId}`,
      {}
    )
  },

  /**
   * Backend requires:
   * resumeId + jobId
   */
  getMatchScore: async (
    resumeId: string,
    jobId?: string,
    applicationId?: string
  ) => {
    return apiClient.post<any>(
      "/ai/resume/match",
      {
        resumeId,
        ...(jobId ? { jobId } : {}),
        ...(applicationId ? { applicationId } : {}),
      }
    )
  },

  autoAssignAssessment: async (
    applicationId: string
  ) => {
    return apiClient.post<any>(
      "/ai/assessment/auto-assign",
      {
        applicationId,
      }
    )
  },

  /**
   * Backend expects applicationId.
   *
   * Do NOT call the parameter sessionId.
   */
  conductInterview: async (
    applicationId: string,
    message: string
  ) => {
    return apiClient.post<any>(
      "/ai/interview/session",
      {
        applicationId,
        transcript: [
          {
            speaker: "candidate",
            message,
          },
        ],
      }
    )
  },

  getInterviewSession: async (
    applicationId: string
  ) => {
    return apiClient.get<any>(
      `/ai/interview/session/${applicationId}`
    )
  },
}