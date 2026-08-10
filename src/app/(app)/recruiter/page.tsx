"use client"
import { analyticsService } from "@/services/analyticsService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HiringFunnel } from "@/components/recruiter/HiringFunnel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, Calendar, Clock, Award, Activity, CheckCircle2, TrendingUp } from "lucide-react"

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 w-8 rounded-lg bg-muted" />
          </div>
          <div className="h-8 bg-muted rounded w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader>
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
        // Map the service response to the shape the page expects
        setData({
          ...fullData.kpis, // spread KPIs to match previous shape
          funnel: fullData.funnel,
          trend: fullData.monthlyTrend,
          recentActivity: [
            { id: 1, type: "application", text: "New application for Senior React Developer", time: "2 hours ago" },
            { id: 2, type: "interview", text: "Interview completed with John Doe", time: "4 hours ago" },
            { id: 3, type: "offer", text: "Offer accepted by Jane Smith", time: "1 day ago" },
            { id: 4, type: "shortlist", text: "Alice shortlisted for Backend Engineer", time: "2 days ago" },
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
    { label: "Total Active Jobs", value: data?.activeJobs, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%", trendDir: "up" },
    { label: "Active Candidates", value: data?.activeCandidates, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+24%", trendDir: "up" },
    { label: "Today's Interviews", value: data?.todaysInterviews, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", trend: "-2", trendDir: "down" },
    { label: "Pending Reviews", value: data?.pendingReviews, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", trend: "+5", trendDir: "up" },
    { label: "Offer Acceptance", value: data?.offerAcceptance, icon: Award, color: "text-green-500", bg: "bg-green-500/10", trend: "+4%", trendDir: "up" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header section with high-level actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Real-time overview of your hiring metrics and candidate pipeline.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" render={<Link href="/recruiter/kanban" />} className="flex-1 sm:flex-none h-10 border-border/60">
            Pipeline Board
          </Button>
          <Button render={<Link href="/recruiter/jobs/create" />} className="flex-1 sm:flex-none h-10 shadow-sm">
            Post a Job
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <Card key={i} className="hover:border-primary/40 transition-colors group shadow-sm border-border/60">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-start">
                  <p className="text-[13px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                    {kpi.label}
                  </p>
                  <div className={`p-2 rounded-md shrink-0 ${kpi.bg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-3xl font-bold text-foreground">{kpi.value ?? "—"}</p>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.trendDir === 'up' ? 'text-green-600 bg-green-500/10 dark:text-green-400' : 'text-red-600 bg-red-500/10 dark:text-red-400'}`}>
                    {kpi.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Analytics - Funnel */}
        {loading ? (
          <CardSkeleton className="lg:col-span-2 h-96" />
        ) : (
          <Card className="lg:col-span-2 flex flex-col shadow-sm border-border/60">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                  <CardDescription>Candidate drop-off rates across active roles</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8">Export Report</Button>
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
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
              <div>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
                <CardDescription>Real-time updates</CardDescription>
              </div>
              <Button variant="ghost" size="icon" render={<Link href="/recruiter/notifications" />}>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[400px]">
              <div className="relative p-6 space-y-6">
                <div className="absolute left-9 top-8 bottom-8 w-px bg-border" />
                {data.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="relative flex gap-4 items-start group">
                    <div className="relative z-10 p-1.5 bg-background border shadow-sm rounded-full mt-0.5 shrink-0 group-hover:border-primary/50 transition-colors">
                      {activity.type === 'application' && <Users className="w-4 h-4 text-blue-500" />}
                      {activity.type === 'shortlist' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                      {activity.type === 'interview' && <Calendar className="w-4 h-4 text-amber-500" />}
                      {activity.type === 'offer' && <Award className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex-1 pt-0.5">
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

      {/* Bottom section: Quick Actions & Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 p-6">
            <Link href="/recruiter/candidates" className="group p-5 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-muted group-hover:bg-background rounded-full transition-colors">
                <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-sm text-foreground">Candidate Database</p>
            </Link>
            <Link href="/recruiter/jobs" className="group p-5 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-muted group-hover:bg-background rounded-full transition-colors">
                <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-sm text-foreground">Manage Jobs</p>
            </Link>
            <Link href="/recruiter/interviews" className="group p-5 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-muted group-hover:bg-background rounded-full transition-colors">
                <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-sm text-foreground">Schedule Interview</p>
            </Link>
            <Link href="/recruiter/offers" className="group p-5 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-muted group-hover:bg-background rounded-full transition-colors">
                <Award className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-sm text-foreground">Send Offer</p>
            </Link>
          </CardContent>
        </Card>

        {loading ? (
          <CardSkeleton className="h-full" />
        ) : (
          <Card className="flex flex-col shadow-sm border-border/60">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Hiring Velocity
              </CardTitle>
              <CardDescription>Monthly hires vs target</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col justify-end">
              <div className="flex h-[180px] items-end justify-between gap-3">
                {data.trend.map((t: any, i: number) => {
                  const height = Math.max((t.hires / 20) * 100, 10)
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full relative bg-primary/20 rounded-t-md transition-all group-hover:bg-primary/40 border-t-2 border-primary/50" style={{ height: `${height}%` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded border shadow-sm z-10">
                          {t.hires}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{t.month}</span>
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
