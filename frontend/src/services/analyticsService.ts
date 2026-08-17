/**
 * Analytics Service
 *
 * This file defines the data contract for the analytics API.
 * When the backend is ready, replace the mock data and delay() calls
 * with real fetch() calls using the same return types.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnalyticsKpis {
  activeJobs: number
  activeCandidates: number
  todaysInterviews: number
  pendingReviews: number
  offerAcceptanceRate: number // percentage 0-100
}

export interface FunnelStage {
  stage: string
  count: number
  conversionFromPrev: number | null // percentage, null for first stage
}

export interface MonthlyTrend {
  month: string     // "Jan", "Feb", etc.
  year: number
  applications: number
  hires: number
  interviews: number
}

export interface ApplicationsByJob {
  jobTitle: string
  count: number
}

export interface StatusDistribution {
  label: string
  count: number
  color: string
}

export interface InterviewAnalytics {
  scheduled: number
  completed: number
  pending: number
  cancelled: number
}

export interface OfferAnalytics {
  sent: number
  accepted: number
  rejected: number
  pending: number
}

export interface AdvancedAnalytics {
  avgTimeToHire: number           // days
  topSources: { source: string; count: number }[]
  recruiterPerformance: { name: string; hires: number; timeToFill: number }[]
  conversionRates: { stage: string; rate: number }[]
}

export interface AnalyticsData {
  kpis: AnalyticsKpis
  funnel: FunnelStage[]
  monthlyTrend: MonthlyTrend[]
  applicationsByJob: ApplicationsByJob[]
  applicationStatusDistribution: StatusDistribution[]
  interviewAnalytics: InterviewAnalytics
  offerAnalytics: OfferAnalytics
  advanced: AdvancedAnalytics
  generatedAt: string
}



// ─── Service ──────────────────────────────────────────────────────────────────

import { apiClient } from "@/lib/apiClient"

export type DateRange = "7d" | "30d" | "90d" | "1y"

export const analyticsService = {
  getAnalytics: async (range: DateRange = "30d"): Promise<AnalyticsData> => {
    try {
      const res = await apiClient.get<any>(`/analytics/overview`)
      const data = res.data || res;
      const stats = data.applicationsByStatus || {};

      const fallbackTrend = [
        { month: "Current", year: new Date().getFullYear(), applications: data.totalApplications || 0, hires: stats.HIRED || 0, interviews: stats.AI_INTERVIEW || 0 }
      ];

      const funnel: FunnelStage[] = [
        { stage: "Applied", count: stats.APPLIED || 0, conversionFromPrev: null },
        { stage: "Screening", count: stats.SCREENING || 0, conversionFromPrev: 100 },
        { stage: "Shortlisted", count: stats.SHORTLISTED || 0, conversionFromPrev: 100 },
        { stage: "Assessment", count: stats.ASSESSMENT || 0, conversionFromPrev: 100 },
        { stage: "Interview", count: stats.AI_INTERVIEW || 0, conversionFromPrev: 100 },
        { stage: "Offer", count: stats.OFFER || 0, conversionFromPrev: 100 },
      ];

      const distribution: StatusDistribution[] = [
        { label: "Applied", count: stats.APPLIED || 0, color: "#6366f1" },
        { label: "Screening", count: stats.SCREENING || 0, color: "#8b5cf6" },
        { label: "Shortlisted", count: stats.SHORTLISTED || 0, color: "#a855f7" },
        { label: "Interview", count: stats.AI_INTERVIEW || 0, color: "#d946ef" },
        { label: "Offer", count: stats.OFFER || 0, color: "#ec4899" },
        { label: "Rejected", count: stats.REJECTED || 0, color: "#ef4444" },
      ];

      return {
        kpis: {
          activeJobs: data.openJobs || 0,
          activeCandidates: data.totalApplications || 0,
          todaysInterviews: 0,
          pendingReviews: stats.EMPLOYER_FINAL_DECISION || 0,
          offerAcceptanceRate: 0,
        },
        funnel,
        monthlyTrend: fallbackTrend,
        applicationsByJob: [],
        applicationStatusDistribution: distribution,
        interviewAnalytics: { scheduled: 0, completed: 0, pending: 0, cancelled: 0 },
        offerAnalytics: { sent: stats.OFFER || 0, accepted: 0, rejected: 0, pending: 0 },
        advanced: {
          avgTimeToHire: 0,
          topSources: [],
          recruiterPerformance: [],
          conversionRates: [],
        },
        generatedAt: new Date().toISOString(),
      }
    } catch {
      return {
        kpis: { activeJobs: 0, activeCandidates: 0, todaysInterviews: 0, pendingReviews: 0, offerAcceptanceRate: 0 },
        funnel: [],
        monthlyTrend: [],
        applicationsByJob: [],
        applicationStatusDistribution: [],
        interviewAnalytics: { scheduled: 0, completed: 0, pending: 0, cancelled: 0 },
        offerAnalytics: { sent: 0, accepted: 0, rejected: 0, pending: 0 },
        advanced: { avgTimeToHire: 0, topSources: [], recruiterPerformance: [], conversionRates: [] },
        generatedAt: new Date().toISOString(),
      }
    }
  },

  getKpis: async (): Promise<AnalyticsKpis> => {
    const data = await analyticsService.getAnalytics();
    return data.kpis;
  },
}

