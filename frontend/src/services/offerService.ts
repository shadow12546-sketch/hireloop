import { apiClient } from "@/lib/apiClient"

/**
 * NOTE: Backend offer endpoints are:
 *   POST /api/offers — create offer (employer only)
 *   GET  /api/offers/:id — get specific offer
 *   GET  /api/offers/application/:applicationId — get offer for an application
 *
 * There is NO GET /offers list endpoint.
 * Offers are accessed per-application.
 */
export const offerService = {
  /**
   * No backend list-all-offers endpoint. Returns empty array.
   * Use getOfferByApplication() to get an offer for a specific application.
   */
  getOffers: async (): Promise<any[]> => {
    return []
  },

  /** GET /api/offers/:id — get specific offer by ID */
  getOfferById: async (id: string) => {
    return apiClient.get<any>(`/offers/${id}`)
  },

  /**
   * GET /api/offers/application/:applicationId — get offer for an application.
   */
  getOfferByApplication: async (applicationId: string) => {
    try {
      return await apiClient.get<any>(`/offers/application/${applicationId}`)
    } catch {
      return null
    }
  },

  /**
   * POST /api/offers — create an offer (employer only).
   * Body: { applicationId, salary, startDate, ... } (per createOfferSchema)
   */
  createOffer: async (data: any) => {
    return apiClient.post<{ success: boolean; data: { offer: any } }>("/offers", data)
  },

  /**
   * NOTE: No /offers/:id/respond endpoint in backend.
   * Offer acceptance is tracked via application final decision.
   * This is a no-op to prevent 404.
   */
  respondToOffer: async (_id: string, _accept: boolean) => {
    return { success: false, error: "Direct offer response not supported. Use application decision endpoint." }
  }
}
