import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockUsers } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authService = {
  login: async (credentials: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { token: "mock_token", user: mockUsers[0] }
    }
    return apiClient.post("/auth/login", credentials)
  },
  
  register: async (data: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { token: "mock_token", user: { ...mockUsers[0], name: data.name, email: data.email } }
    }
    return apiClient.post("/auth/register", data)
  },

  getUsers: async () => {
    if (IS_MOCK) {
      await delay(500)
      return mockUsers
    }
    return apiClient.get<any[]>("/users")
  },

  getRoles: async () => {
    if (IS_MOCK) {
      await delay(400)
      return [
        { id: "r1", name: "Super Admin", users: 5, description: "Full system access." },
        { id: "r2", name: "Recruiter", users: 120, description: "Manage jobs and candidates." },
        { id: "r3", name: "Hiring Manager", users: 85, description: "Review and make final decisions." },
        { id: "r4", name: "Interviewer", users: 300, description: "Submit interview feedback." },
        { id: "r5", name: "Candidate", users: 5000, description: "Apply and track jobs." },
      ]
    }
    return apiClient.get<any[]>("/roles")
  },

  getCompanies: async () => {
    if (IS_MOCK) {
      await delay(500)
      return [
        { id: "c1", name: "Acme Corp", industry: "Technology", employees: "1000+", plan: "Enterprise", status: "Active" },
        { id: "c2", name: "Global Tech", industry: "Software", employees: "50-200", plan: "Pro", status: "Active" },
        { id: "c3", name: "Startup Inc", industry: "Finance", employees: "1-50", plan: "Basic", status: "Inactive" },
      ]
    }
    return apiClient.get<any[]>("/companies")
  },

  getAuditLogs: async () => {
    if (IS_MOCK) {
      await delay(600)
      return [
        { id: "log1", user: "System Admin", action: "Updated Role Permissions", entity: "Role: Recruiter", timestamp: "2026-08-09 14:32:00" },
        { id: "log2", user: "Recruiter Bob", action: "Created Job", entity: "Job: Senior React Developer", timestamp: "2026-08-09 11:15:22" },
        { id: "log3", user: "Hiring Manager Jane", action: "Approved Candidate", entity: "Candidate: John Doe", timestamp: "2026-08-08 16:45:10" },
        { id: "log4", user: "System Admin", action: "Suspended Company", entity: "Company: Startup Inc", timestamp: "2026-08-07 09:20:05" },
      ]
    }
    return apiClient.get<any[]>("/audit-logs")
  }
}
