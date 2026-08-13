import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockAiResults, type AiAnalysisResult } from "@/lib/mockData"

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const aiService = {
  analyzeCandidate: async (
    applicationId: string
  ): Promise<AiAnalysisResult> => {
    if (IS_MOCK) {
      await delay(1200)

      if (mockAiResults[applicationId]) {
        return mockAiResults[applicationId]
      }

      return {
        matchScore: Math.floor(Math.random() * 30) + 65,
        strengths: [
          "Strong relevant experience",
          "Good cultural fit potential",
        ],
        missingSkills: ["Specific framework knowledge"],
        skillGaps: ["Leadership experience"],
        recommendations: [
          "Probe deeper on system design during interview",
        ],
      }
    }

    return apiClient.post<AiAnalysisResult>(
      `/ai/analyze/${applicationId}`,
      {}
    )
  },

  parseResume: async (file: File) => {
    if (IS_MOCK) {
      await delay(2500)

      return {
        name: "Mock Candidate",
        email: "candidate@mock.com",
        phone: "+1 234 567 890",
        skills: [
          "React",
          "TypeScript",
          "Node.js",
          "AI Integration",
        ],
        education: [
          {
            degree: "B.Tech",
            school: "Mock University",
            year: "2024",
          },
        ],
        experience: [
          {
            role: "Frontend Dev",
            company: "Tech Corp",
            start: "2023",
            end: "Present",
            description: "Built awesome UI.",
          },
        ],
        projects: [
          {
            name: "AI ATS",
            description: "An applicant tracking system.",
          },
        ],
        certifications: ["AWS Certified Developer"],
      }
    }

    const formData = new FormData()
    formData.append("resume", file)

    return apiClient.post<any>(
      "/ai/resume/parse",
      formData
    )
  },

  getMatchScore: async (applicationId: string) => {
    if (IS_MOCK) {
      await delay(2000)

      return {
        matchScore: 92,
        breakdown: {
          skillMatch: 95,
          experienceMatch: 88,
          educationMatch: 90,
          projectMatch: 95,
        },
        strengths: [
          "Strong React background",
          "Typescript expert",
        ],
        missingSkills: ["Python"],
        weakAreas: ["Limited DevOps experience"],
        recommendation:
          "Highly Recommended for Technical Interview",
      }
    }

    return apiClient.post<any>(
      "/ai/resume/match",
      { applicationId }
    )
  },

  autoAssignAssessment: async (applicationId: string) => {
    if (IS_MOCK) {
      await delay(1500)

      return {
        success: true,
        assessmentId: "assessment_mock_1",
      }
    }

    return apiClient.post<any>(
      "/ai/assessment/auto-assign",
      { applicationId }
    )
  },

  conductInterview: async (
    sessionId: string,
    message: string
  ) => {
    if (IS_MOCK) {
      await delay(2000)

      if (
        message.toLowerCase().includes("finish") ||
        message.toLowerCase().includes("done")
      ) {
        return {
          reply:
            "Thank you for your time. We have recorded your responses.",
          finished: true,
          summary: {
            overallScore: 85,
            summary:
              "Candidate demonstrated strong communication and adequate technical knowledge.",
            strengths: [
              "Clear communication",
              "Problem solving",
            ],
            weaknesses: [
              "Deep technical details lacking",
            ],
            technicalAssessment:
              "Satisfactory. Could improve on complex system design.",
            communicationAssessment:
              "Excellent. Very articulate.",
            recommendation: "Proceed to next round",
            completedAt: new Date().toISOString(),
          },
        }
      }

      return {
        reply:
          "That's interesting. Can you tell me more about how you handled a challenging bug in that project?",
        finished: false,
      }
    }

    return apiClient.post<any>(
      "/ai/interview/session",
      {
        sessionId,
        message,
      }
    )
  },
}
