import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockCandidates } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const candidateProfile = {
  id: "1",
  firstName: "Sachin",
  lastName: "Verma",
  title: "Senior Software Engineer",
  email: "sachin@example.com",
  phone: "+1 234 567 890",
  location: "San Francisco, CA",
  completionScore: 85,
  skills: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
  experience: [
    {
      id: "exp1",
      role: "Software Engineer",
      company: "Tech Corp",
      start: "2021",
      end: "Present",
      description: "Building awesome web applications.",
    },
  ],
  education: [
    {
      id: "edu1",
      degree: "B.Tech in Computer Science",
      institution: "IIT Bombay",
      year: "2020",
    },
  ],
  links: {
    github: "https://github.com/sachin",
    linkedin: "https://linkedin.com/in/sachin",
    portfolio: "https://sachin.dev",
  },
}

export const candidateService = {
  getProfile: async () => {
    if (IS_MOCK) {
      await delay(500)
      return candidateProfile
    }
    return apiClient.get<any>("/candidates/me")
  },

  updateProfile: async (data: any) => {
    if (IS_MOCK) {
      await delay(600)
      return { ...candidateProfile, ...data }
    }
    return apiClient.put<any>("/candidates/me", data)
  },

  getAllCandidates: async () => {
    if (IS_MOCK) {
      await delay(500)
      return mockCandidates
    }
    return apiClient.get<any[]>("/candidates")
  },

  getCandidateById: async (id: string) => {
    if (IS_MOCK) {
      await delay(300)
      return mockCandidates.find(c => c.id === id)
    }
    return apiClient.get<any>(`/candidates/${id}`)
  }
}
