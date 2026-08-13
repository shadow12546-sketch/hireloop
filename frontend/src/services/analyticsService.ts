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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockData: AnalyticsData = {
  kpis: {
    activeJobs: 12,
    activeCandidates: 145,
    todaysInterviews: 4,
    pendingReviews: 28,
    offerAcceptanceRate: 85,
  },
  funnel: [
    { stage: "Applications", count: 500, conversionFromPrev: null },
    { stage: "Screening",    count: 250, conversionFromPrev: 50 },
    { stage: "Shortlisted",  count: 100, conversionFromPrev: 40 },
    { stage: "Interview",    count: 45,  conversionFromPrev: 45 },
    { stage: "Offer",        count: 15,  conversionFromPrev: 33 },
    { stage: "Hired",        count: 12,  conversionFromPrev: 80 },
  ],
  monthlyTrend: [
    { month: "Jan", year: 2026, applications: 62,  hires: 5,  interviews: 22 },
    { month: "Feb", year: 2026, applications: 85,  hires: 8,  interviews: 30 },
    { month: "Mar", year: 2026, applications: 120, hires: 12, interviews: 44 },
    { month: "Apr", year: 2026, applications: 98,  hires: 10, interviews: 38 },
    { month: "May", year: 2026, applications: 145, hires: 15, interviews: 55 },
    { month: "Jun", year: 2026, applications: 190, hires: 20, interviews: 70 },
    { month: "Jul", year: 2026, applications: 175, hires: 18, interviews: 64 },
    { month: "Aug", year: 2026, applications: 110, hires: 7,  interviews: 40 },
  ],
  applicationsByJob: [
    { jobTitle: "Senior React Developer", count: 120 },
    { jobTitle: "Product Manager",        count: 85  },
    { jobTitle: "UX Designer",            count: 60  },
    { jobTitle: "Backend Engineer",       count: 45  },
    { jobTitle: "DevOps Engineer",        count: 30  },
  ],
  applicationStatusDistribution: [
    { label: "Applied",      count: 200, color: "#6366f1" },
    { label: "Screening",    count: 120, color: "#8b5cf6" },
    { label: "Shortlisted",  count: 80,  color: "#a855f7" },
    { label: "Interview",    count: 45,  color: "#d946ef" },
    { label: "Offer",        count: 15,  color: "#ec4899" },
    { label: "Hired",        count: 12,  color: "#10b981" },
    { label: "Rejected",     count: 28,  color: "#ef4444" },
  ],
  interviewAnalytics: {
    scheduled: 12,
    completed: 28,
    pending: 4,
    cancelled: 2,
  },
  offerAnalytics: {
    sent: 15,
    accepted: 10,
    rejected: 2,
    pending: 3,
  },
  advanced: {
    avgTimeToHire: 18,
    topSources: [
      { source: "LinkedIn",       count: 180 },
      { source: "Direct Apply",   count: 140 },
      { source: "Referral",       count: 95  },
      { source: "Job Boards",     count: 60  },
      { source: "Company Site",   count: 25  },
    ],
    recruiterPerformance: [
      { name: "Alice (Recruiter)", hires: 8,  timeToFill: 16 },
      { name: "Bob (Recruiter)",   hires: 5,  timeToFill: 22 },
      { name: "Carol (Recruiter)", hires: 7,  timeToFill: 14 },
    ],
    conversionRates: [
      { stage: "Applied → Screening",   rate: 50 },
      { stage: "Screening → Interview", rate: 18 },
      { stage: "Interview → Offer",     rate: 33 },
      { stage: "Offer → Hired",         rate: 80 },
    ],
  },
  generatedAt: new Date().toISOString(),
}

// ─── Service ──────────────────────────────────────────────────────────────────

import { apiClient, IS_MOCK } from "@/lib/apiClient"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export type DateRange = "7d" | "30d" | "90d" | "1y"

export const analyticsService = {
  getAnalytics: async (range: DateRange = "30d"): Promise<AnalyticsData> => {
    if (IS_MOCK) {
      await delay(700)
      return { ...mockData, generatedAt: new Date().toISOString() }
    }
    return apiClient.get<AnalyticsData>(`/analytics?range=${range}`)
  },

  getKpis: async (): Promise<AnalyticsKpis> => {
    if (IS_MOCK) {
      await delay(300)
      return mockData.kpis
    }
    return apiClient.get<AnalyticsKpis>(`/analytics/kpis`)
  },
}
