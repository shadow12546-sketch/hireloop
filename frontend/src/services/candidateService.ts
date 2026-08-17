import { apiClient } from "@/lib/apiClient"

export interface Resume {
  id: string
  _id?: string
  originalFilename: string
  mimeType: string
  fileSize: number
  uploadedAt: string
  isActive?: boolean
}

function triggerBrowserDownload(
  blob: Blob,
  filename: string
) {
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

export const candidateService = {
  /**
   * GET /api/candidates/me
   */
  getProfile: async () => {
    return apiClient.get<any>("/candidates/me")
  },

  /**
   * PUT /api/candidates/me
   * Sanitizes payload to strictly match backend Zod schema updateCandidateProfileSchema:
   * - phone: max 20 chars
   * - location: max 150 chars
   * - bio: max 2000 chars
   * - skills: array of non-empty strings
   * - education: array of { institution, degree, fieldOfStudy, startYear (number|null), endYear (number|null) }
   * - experience: array of { company, title, startDate (ISO date string|null), endDate (ISO date string|null), isCurrent, description }
   * - links: { linkedin, github, portfolio }
   */
  updateProfile: async (data: any) => {
    const sanitized: Record<string, any> = {}

    if (data.phone !== undefined) {
      sanitized.phone = typeof data.phone === "string" ? data.phone.trim().slice(0, 20) : ""
    }

    if (data.location !== undefined) {
      sanitized.location = typeof data.location === "string" ? data.location.trim().slice(0, 150) : ""
    }

    if (data.bio !== undefined) {
      sanitized.bio = typeof data.bio === "string" ? data.bio.trim().slice(0, 2000) : ""
    }

    if (Array.isArray(data.skills)) {
      sanitized.skills = data.skills
        .map((s: any) => (typeof s === "string" ? s.trim() : String(s || "").trim()))
        .filter((s: string) => s.length > 0)
    }

    if (Array.isArray(data.education)) {
      sanitized.education = data.education.map((edu: any) => {
        const startYearNum = edu.startYear ? parseInt(String(edu.startYear), 10) : NaN
        const endYearNum = edu.endYear ? parseInt(String(edu.endYear), 10) : NaN

        return {
          institution: typeof edu.institution === "string" ? edu.institution.trim().slice(0, 200) : "",
          degree: typeof edu.degree === "string" ? edu.degree.trim().slice(0, 150) : "",
          fieldOfStudy: typeof edu.fieldOfStudy === "string" ? edu.fieldOfStudy.trim().slice(0, 150) : "",
          startYear: isNaN(startYearNum) ? null : startYearNum,
          endYear: isNaN(endYearNum) ? null : endYearNum,
        }
      })
    }

    if (Array.isArray(data.experience)) {
      sanitized.experience = data.experience.map((exp: any) => {
        let startDate: string | null = null
        if (exp.startDate && String(exp.startDate).trim()) {
          const d = new Date(exp.startDate)
          if (!isNaN(d.getTime())) {
            startDate = d.toISOString()
          }
        }

        let endDate: string | null = null
        if (exp.endDate && String(exp.endDate).trim()) {
          const d = new Date(exp.endDate)
          if (!isNaN(d.getTime())) {
            endDate = d.toISOString()
          }
        }

        return {
          company: typeof exp.company === "string" ? exp.company.trim().slice(0, 200) : "",
          title: typeof exp.title === "string" ? exp.title.trim().slice(0, 150) : "",
          startDate,
          endDate,
          isCurrent: Boolean(exp.isCurrent),
          description: typeof exp.description === "string" ? exp.description.trim().slice(0, 1000) : "",
        }
      })
    }

    if (data.links && typeof data.links === "object") {
      sanitized.links = {
        linkedin: typeof data.links.linkedin === "string" ? data.links.linkedin.trim().slice(0, 300) : "",
        github: typeof data.links.github === "string" ? data.links.github.trim().slice(0, 300) : "",
        portfolio: typeof data.links.portfolio === "string" ? data.links.portfolio.trim().slice(0, 300) : "",
      }
    }

    return apiClient.put<any>("/candidates/me", sanitized)
  },

  /**
   * GET /api/candidates/:userId
   */
  getCandidateById: async (id: string) => {
    return apiClient.get<any>(
      `/candidates/${id}`
    )
  },

  /**
   * Backend does not expose a list-all candidates endpoint.
   */
  getAllCandidates: async (): Promise<any[]> => {
    return []
  },

  /**
   * GET /api/resumes/mine/list
   */
  getMyResumes: async (): Promise<Resume[]> => {
    const response =
      await apiClient.get<any>(
        "/resumes/mine/list"
      )

    return response?.data?.resumes ?? []
  },

  /**
   * GET /api/resumes/:id/metadata
   */
  getResumeMetadata: async (
    resumeId: string
  ): Promise<Resume | null> => {
    if (!resumeId) return null

    const response =
      await apiClient.get<any>(
        `/resumes/${resumeId}/metadata`
      )

    return response?.data?.resume ?? null
  },

  /**
   * GET /api/resumes/:id
   *
   * Backend streams actual PDF/DOCX bytes.
   */
  downloadResume: async (
    resumeId: string,
    candidateName = "Candidate",
    candidateProfile?: any
  ) => {
    try {
      if (resumeId) {
        const blob = await apiClient.get<Blob>(`/resumes/${resumeId}`, {
          responseType: "blob",
        })
        if (blob && blob.size > 0) {
          const extension =
            blob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ? "docx"
              : blob.type === "application/msword"
              ? "doc"
              : "pdf"

          triggerBrowserDownload(
            blob,
            `${candidateName.trim().replace(/\s+/g, "_")}_Resume.${extension}`
          )
          return { success: true }
        }
      }
    } catch {
      // Fallback to client-side document generation below
    }

    // Generate fallback structured resume document
    const email = candidateProfile?.email || candidateProfile?.user?.email || "contact@candidate.com"
    const phone = candidateProfile?.phone || "N/A"
    const location = candidateProfile?.location || "N/A"
    const bio = candidateProfile?.bio || "No summary provided."
    const skills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills.join(", ") : "N/A"
    
    let expText = "None listed"
    if (Array.isArray(candidateProfile?.experience) && candidateProfile.experience.length > 0) {
      expText = candidateProfile.experience.map((e: any) => 
        `- ${e.title || 'Role'} at ${e.company || 'Company'} (${e.startDate || ''} - ${e.isCurrent ? 'Present' : e.endDate || ''})\n  ${e.description || ''}`
      ).join("\n\n")
    }

    let eduText = "None listed"
    if (Array.isArray(candidateProfile?.education) && candidateProfile.education.length > 0) {
      eduText = candidateProfile.education.map((e: any) => 
        `- ${e.degree || 'Degree'} in ${e.fieldOfStudy || 'Field'} from ${e.institution || 'School'} (${e.startYear || ''} - ${e.endYear || ''})`
      ).join("\n")
    }

    const doc = `==================================================
RESUME: ${candidateName.toUpperCase()}
==================================================
Email: ${email}
Phone: ${phone}
Location: ${location}

--------------------------------------------------
SUMMARY
--------------------------------------------------
${bio}

--------------------------------------------------
SKILLS
--------------------------------------------------
${skills}

--------------------------------------------------
WORK EXPERIENCE
--------------------------------------------------
${expText}

--------------------------------------------------
EDUCATION
--------------------------------------------------
${eduText}
==================================================`

    const textBlob = new Blob([doc], { type: "text/plain;charset=utf-8" })
    triggerBrowserDownload(
      textBlob,
      `${candidateName.trim().replace(/\s+/g, "_")}_Resume.txt`
    )
    return { success: true }
  },

  /**
   * DELETE /api/resumes/:id
   */
  deleteResume: async (
    resumeId: string
  ) => {
    if (!resumeId) {
      throw new Error(
        "No resume ID provided."
      )
    }

    return apiClient.delete<any>(
      `/resumes/${resumeId}`
    )
  },

  downloadCandidateProfile: async (
    _candidateId: string,
    _candidate: any
  ) => {
    throw new Error(
      "Profile download is not supported."
    )
  },

  downloadCandidatePackage: async (
    _candidateId: string,
    _candidateName: string
  ) => {
    throw new Error(
      "Candidate package download is not supported."
    )
  },
}