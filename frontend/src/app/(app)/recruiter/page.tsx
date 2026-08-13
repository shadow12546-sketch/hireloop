"use client"
import { analyticsService } from "@/services/analyticsService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HiringFunnel } from "@/components/recruiter/HiringFunnel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, Calendar, Clock, Award, Activity, CheckCircle2, TrendingUp, Plus } from "lucide-react"

function KpiSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-3.5 bg-muted rounded w-24" />
            <div className="h-9 w-9 rounded-lg bg-muted" />
          </div>
          <div className="h-9 bg-muted rounded w-20" />
          <div className="h-5 bg-muted rounded w-14" />
        </div>
      </CardContent>
    </Card>
  )
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`flex flex-col ${className} border-border/60`}>
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="h-5 bg-muted rounded w-1/3 animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full w-full bg-muted rounded-xl animate-pulse min-h-[200px]" />
      </CardContent>
    </Card>
  )
}

export default function RecruiterDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const fullData = await analyticsService.getAnalytics()
        setData({
          ...fullData.kpis,
          funnel: fullData.funnel,
          trend: fullData.monthlyTrend,
          recentActivity: [
            { id: 1, type: "application", text: "New application received for Senior React Developer", time: "2 hours ago" },
            { id: 2, type: "interview",   text: "AI interview completed with John Doe",               time: "4 hours ago" },
            { id: 3, type: "offer",       text: "Offer accepted by Jane Smith",                       time: "1 day ago" },
            { id: 4, type: "shortlist",   text: "Alice shortlisted for Backend Engineer",             time: "2 days ago" },
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!loading && !data) {
    throw new Error("Failed to load dashboard data.")
  }

  const kpis = [
    { label: "Total Active Jobs",  value: data?.activeJobs,       icon: Briefcase, color: "text-blue-500",   bg: "bg-blue-500/10",   trend: "+12%", trendDir: "up" },
    { label: "Active Candidates",  value: data?.activeCandidates, icon: Users,     color: "text-violet-500", bg: "bg-violet-500/10", trend: "+24%", trendDir: "up" },
    { label: "Today's Interviews", value: data?.todaysInterviews, icon: Calendar,  color: "text-amber-500",  bg: "bg-amber-500/10",  trend: "-2",   trendDir: "down" },
    { label: "Pending Reviews",    value: data?.pendingReviews,   icon: Clock,     color: "text-orange-500", bg: "bg-orange-500/10", trend: "+5",   trendDir: "up" },
    { label: "Offer Acceptance",   value: data?.offerAcceptance,  icon: Award,     color: "text-green-500",  bg: "bg-green-500/10",  trend: "+4%",  trendDir: "up" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Overview of your hiring activity, candidates, and recruitment performance.
          </p>
        </div>
        <Button
          render={<Link href="/recruiter/jobs/create" />}
          className="w-full sm:w-auto h-9 px-4 gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <Card
              key={i}
              className="hover:border-primary/40 hover:shadow-md transition-all duration-200 group shadow-sm border-border/60"
            >
              <CardContent className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-snug max-w-[80px]">
                    {kpi.label}
                  </p>
                  <div className={`p-2.5 rounded-lg shrink-0 ${kpi.bg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground tabular-nums">{kpi.value ?? "—"}</p>
                  <span
                    className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      kpi.trendDir === "up"
                        ? "text-green-700 bg-green-500/10 dark:text-green-400"
                        : "text-red-600 bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {kpi.trend} vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* ── Recruitment Funnel + Activity Timeline ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recruitment Funnel */}
        {loading ? (
          <CardSkeleton className="lg:col-span-2 h-96" />
        ) : (
          <Card className="lg:col-span-2 flex flex-col shadow-sm border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold">Recruitment Funnel</CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    Candidate progression across your active jobs
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center p-6">
              <HiringFunnel data={data.funnel} />
            </CardContent>
          </Card>
        )}

        {/* Activity Timeline */}
        {loading ? (
          <CardSkeleton className="h-96" />
        ) : (
          <Card className="flex flex-col shadow-sm border-border/60">
            <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
                <CardDescription className="mt-0.5 text-xs">Recent hiring events</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" render={<Link href="/recruiter/notifications" />}>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[360px]">
              <div className="relative p-5 space-y-5">
                <div className="absolute left-[2.125rem] top-6 bottom-6 w-px bg-border/70" />
                {data.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="relative flex gap-3 items-start group">
                    <div className="relative z-10 p-1.5 bg-background border border-border/80 shadow-sm rounded-full shrink-0 mt-0.5 group-hover:border-primary/50 transition-colors">
                      {activity.type === "application" && <Users className="w-3.5 h-3.5 text-blue-500" />}
                      {activity.type === "shortlist"   && <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />}
                      {activity.type === "interview"   && <Calendar className="w-3.5 h-3.5 text-amber-500" />}
                      {activity.type === "offer"       && <Award className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-foreground leading-snug">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Quick Actions + Hiring Velocity ── */}
      <div className="grid gap-6 md:grid-cols-2">

        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs mt-0.5">Jump to key sections</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-5">
            <Link
              href="/recruiter/candidates"
              className="group p-4 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2.5"
            >
              <div className="p-2.5 bg-muted group-hover:bg-background rounded-lg transition-colors">
                <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-xs text-foreground">Candidates</p>
            </Link>
            <Link
              href="/recruiter/jobs"
              className="group p-4 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2.5"
            >
              <div className="p-2.5 bg-muted group-hover:bg-background rounded-lg transition-colors">
                <Briefcase className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-xs text-foreground">Manage Jobs</p>
            </Link>
            <Link
              href="/recruiter/offers"
              className="group p-4 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2.5"
            >
              <div className="p-2.5 bg-muted group-hover:bg-background rounded-lg transition-colors">
                <Award className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-xs text-foreground">Offers</p>
            </Link>
            <Link
              href="/recruiter/analytics"
              className="group p-4 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2.5"
            >
              <div className="p-2.5 bg-muted group-hover:bg-background rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-xs text-foreground">Analytics</p>
            </Link>
          </CardContent>
        </Card>

        {loading ? (
          <CardSkeleton className="h-full" />
        ) : (
          <Card className="flex flex-col shadow-sm border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Hiring Velocity
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Monthly hires vs target</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-5 flex flex-col justify-end">
              <div className="flex h-[160px] items-end justify-between gap-2">
                {data.trend.map((t: any, i: number) => {
                  const height = Math.max((t.hires / 20) * 100, 8)
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group">
                      <div
                        className="w-full relative bg-primary/20 rounded-t transition-all group-hover:bg-primary/50 border-t-2 border-primary/60"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded border shadow-sm z-10 whitespace-nowrap">
                          {t.hires}
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{t.month}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


