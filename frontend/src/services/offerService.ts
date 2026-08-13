import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockOffers } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const offerService = {
  getOffers: async () => {
    if (IS_MOCK) {
      await delay(400)
      return mockOffers
    }
    return apiClient.get<any[]>("/offers")
  },

  getOfferById: async (id: string) => {
    if (IS_MOCK) {
      await delay(300)
      return mockOffers.find(o => o.id === id)
    }
    return apiClient.get<any>(`/offers/${id}`)
  },

  createOffer: async (data: any) => {
    if (IS_MOCK) {
      await delay(800)
      return { success: true, offerId: Math.random().toString() }
    }
    return apiClient.post<{ success: boolean; offerId: string }>("/offers", data)
  },

  respondToOffer: async (id: string, accept: boolean) => {
    if (IS_MOCK) {
      await delay(600)
      return { success: true, status: accept ? "Accepted" : "Rejected" }
    }
    return apiClient.post<{ success: boolean; status: string }>(`/offers/${id}/respond`, { accept })
  }
}
