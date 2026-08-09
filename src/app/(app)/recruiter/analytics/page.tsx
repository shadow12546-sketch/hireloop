"use client"

import { useState, useEffect, useCallback } from "react"
import { analyticsService, type AnalyticsData, type DateRange } from "@/services/analyticsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/analytics/KpiCard"
import { FunnelChart } from "@/components/analytics/FunnelChart"
import { TrendBarChart } from "@/components/analytics/TrendBarChart"
import { DonutChart } from "@/components/analytics/DonutChart"
import { SkeletonKpiGrid, SkeletonChartCard } from "@/components/analytics/SkeletonCard"
import {
  Briefcase, Users, Calendar, Clock, Award,
  RefreshCw, AlertCircle, TrendingUp, BarChart3, CheckCircle2, Target, Timer
} from "lucide-react"

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year",  value: "1y"  },
]

const TREND_METRICS = [
  { label: "Applications", value: "applications" as const },
  { label: "Interviews",   value: "interviews"   as const },
  { label: "Hires",        value: "hires"        as const },
]

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-4 bg-destructive/10 rounded-full">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Failed to load analytics</h3>
      <p className="text-muted-foreground text-sm">There was an error fetching data from the server.</p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" /> Retry
      </Button>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [trendMetric, setTrendMetric] = useState<"applications" | "hires" | "interviews">("applications")

  const fetchData = useCallback(async (range: DateRange, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else { setLoading(true); setError(false) }

    try {
      const result = await analyticsService.getAnalytics(range)
      setData(result)
      setError(false)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData(dateRange) }, [dateRange, fetchData])

  const handleRefresh = () => fetchData(dateRange, true)

  // ─── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="h-10 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <SkeletonKpiGrid />
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonChartCard className="h-96" />
          <SkeletonChartCard className="h-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonChartCard />
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────────────
  if (error) return <ErrorState onRetry={() => fetchData(dateRange)} />

  if (!data) return null

  // ─── KPI Config ──────────────────────────────────────────────────────────
  const kpis = [
    { label: "Active Jobs",           value: data.kpis.activeJobs,        icon: Briefcase, color: "text-blue-500",   bg: "bg-blue-500/10",   trend: { value: 8, positive: true } },
    { label: "Active Candidates",     value: data.kpis.activeCandidates,  icon: Users,     color: "text-purple-500", bg: "bg-purple-500/10", trend: { value: 12, positive: true } },
    { label: "Today's Interviews",    value: data.kpis.todaysInterviews,  icon: Calendar,  color: "text-amber-500",  bg: "bg-amber-500/10",  trend: undefined },
    { label: "Pending Reviews",       value: data.kpis.pendingReviews,    icon: Clock,     color: "text-orange-500", bg: "bg-orange-500/10", trend: { value: 5, positive: false } },
    { label: "Offer Acceptance Rate", value: data.kpis.offerAcceptanceRate, icon: Award,  color: "text-green-500",  bg: "bg-green-500/10",  suffix: "%" },
  ]

  const { interviewAnalytics: ia, offerAnalytics: oa } = data

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Last updated: {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  dateRange === r.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── Core KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </div>

      {/* ── Hiring Funnel + Monthly Trend ──────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Hiring Funnel
            </CardTitle>
            <CardDescription>Candidate conversion rates across all active roles</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <FunnelChart data={data.funnel} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Monthly Trend
                </CardTitle>
                <CardDescription>Showing data for {DATE_RANGES.find(r => r.value === dateRange)?.label}</CardDescription>
              </div>
              <div className="flex bg-muted rounded-lg p-1 gap-1 self-start">
                {TREND_METRICS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setTrendMetric(m.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      trendMetric === m.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <TrendBarChart data={data.monthlyTrend} metric={trendMetric} />
          </CardContent>
        </Card>
      </div>

      {/* ── Application Analytics ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Application Analytics
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* By Job */}
          <Card>
            <CardHeader>
              <CardTitle>Applications by Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.applicationsByJob.length > 0 ? (
                data.applicationsByJob.map((item, i) => {
                  const max = data.applicationsByJob[0].count
                  const pct = (item.count / max) * 100
                  return (
                    <div key={i} className="space-y-1.5 group">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium truncate pr-4" title={item.jobTitle}>
                          {item.jobTitle}
                        </span>
                        <span className="font-bold shrink-0">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700 group-hover:bg-primary/80"
                          style={{ width: `${pct}%` }}
                          role="progressbar"
                          aria-valuenow={item.count}
                          aria-label={`${item.jobTitle}: ${item.count} applications`}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No applications data.</p>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>All applications by current stage</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart data={data.applicationStatusDistribution} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Interview & Offer Analytics ────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Interview Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Interview Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Scheduled",  value: ia.scheduled,  color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10" },
                { label: "Completed",  value: ia.completed,  color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
                { label: "Pending",    value: ia.pending,    color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
                { label: "Cancelled",  value: ia.cancelled,  color: "text-red-600 dark:text-red-400",     bg: "bg-red-500/10" },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl ${s.bg} flex flex-col gap-1`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Completion rate: <strong className="text-foreground">
                  {ia.completed + ia.scheduled > 0
                    ? Math.round((ia.completed / (ia.completed + ia.scheduled + ia.pending + ia.cancelled)) * 100)
                    : 0}%
                </strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Offer Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Offer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Offers Sent", value: oa.sent,     color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10" },
                { label: "Accepted",    value: oa.accepted, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
                { label: "Pending",     value: oa.pending,  color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
                { label: "Rejected",    value: oa.rejected, color: "text-red-600 dark:text-red-400",     bg: "bg-red-500/10" },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl ${s.bg} flex flex-col gap-1`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Acceptance rate: <strong className="text-foreground">
                  {oa.sent > 0 ? Math.round((oa.accepted / oa.sent) * 100) : 0}%
                </strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Advanced Analytics (Optional) ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Advanced Analytics
          </h2>
          <Badge variant="secondary" className="text-xs">Optional</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          These metrics require additional backend data and are provided as supplementary insight.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Avg Time to Hire */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2 py-10">
              <Timer className="w-8 h-8 text-primary mb-2" />
              <p className="text-4xl font-bold">{data.advanced.avgTimeToHire}</p>
              <p className="text-sm text-muted-foreground">Avg. Days to Hire</p>
              <p className="text-xs text-muted-foreground">From application to offer acceptance</p>
            </CardContent>
          </Card>

          {/* Top Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Candidate Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.advanced.topSources.map((src, i) => {
                const maxSrc = data.advanced.topSources[0].count
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{src.source}</span>
                      <span className="font-semibold">{src.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-700"
                        style={{ width: `${(src.count / maxSrc) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Stage Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stage Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.advanced.conversionRates.map((cr, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground leading-tight flex-1">{cr.stage}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cr.rate >= 50 ? "bg-green-500" : cr.rate >= 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${cr.rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-10 text-right">{cr.rate}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
