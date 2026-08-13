import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockNotifications } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const notificationService = {
  getNotifications: async () => {
    if (IS_MOCK) {
      await delay(300)
      return mockNotifications
    }
    return apiClient.get<any[]>("/notifications")
  },

  markAsRead: async (id: string) => {
    if (IS_MOCK) {
      await delay(200)
      return { success: true }
    }
    return apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {})
  },

  markAllAsRead: async () => {
    if (IS_MOCK) {
      await delay(400)
      return { success: true }
    }
    return apiClient.post<{ success: boolean }>("/notifications/read-all", {})
  }
}
