import { apiClient } from "@/lib/apiClient"

export const notificationService = {
  getNotifications: async () => {
    try {
      return await apiClient.get<any[]>("/notifications")
    } catch {
      return []
    }
  },

  markAsRead: async (id: string) => {
    return apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {})
  },

  markAllAsRead: async () => {
    return apiClient.patch<{ success: boolean }>("/notifications/read-all", {})
  }
}

