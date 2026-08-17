import { apiClient } from "@/lib/apiClient"

export const authService = {
  login: async (credentials: any) => {
    return apiClient.post<any>("/auth/login", credentials)
  },

  register: async (data: any) => {
    return apiClient.post<any>("/auth/register", data)
  },

  /**
   * POST /api/auth/google
   * Sends a Google ID token obtained from Google Identity Services.
   * role is required for first-time sign-up ("candidate" | "employer").
   */
  googleAuth: async (idToken: string, role?: string) => {
    return apiClient.post<any>("/auth/google", { idToken, role })
  },

  getMe: async () => {
    return apiClient.get<any>("/auth/me")
  },

  logout: async () => {
    return apiClient.post<any>("/auth/logout", {})
  },

  // The following endpoints do not exist in the backend (no admin role).
  // They are kept to avoid undefined function errors in the frontend components,
  // but will return 404s when called.
  getUsers: async () => {
    return apiClient.get<any[]>("/users")
  },

  getRoles: async () => {
    return apiClient.get<any[]>("/roles")
  },

  getCompanies: async () => {
    return apiClient.get<any[]>("/companies")
  },

  getAuditLogs: async () => {
    return apiClient.get<any[]>("/audit-logs")
  },
}


