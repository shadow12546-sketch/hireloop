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
    { label: "Total Active Jobs", value: data?.activeJobs, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Candidates", value: data?.activeCandidates, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Today's Interviews", value: data?.todaysInterviews, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Reviews", value: data?.pendingReviews, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Offer Acceptance Rate", value: data?.offerAcceptance, icon: Award, color: "text-green-500", bg: "bg-green-500/10" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Recruitment Overview</h1>
          <p className="page-subtitle">Here's what's happening with your hiring pipeline today.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" render={<Link href="/recruiter/kanban" />} className="flex-1 sm:flex-none">View Kanban</Button>
          <Button render={<Link href="/recruiter/jobs/create" />} className="flex-1 sm:flex-none">Post New Job</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <Card key={i} className="hover:border-primary/40 transition-colors group">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                    {kpi.label}
                  </p>
                  <div className={`p-2 rounded-lg shrink-0 ${kpi.bg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold">{kpi.value ?? "—"}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hiring Funnel */}
        {loading ? (
          <CardSkeleton className="lg:col-span-2" />
        ) : (
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
              <CardDescription>Conversion rates across all active roles</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <HiringFunnel data={data.funnel} />
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="icon" render={<Link href="/recruiter/notifications" />}>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {data.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 items-start border-b pb-3 last:border-0 last:pb-0">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-md mt-0.5 shrink-0">
                    {activity.type === 'application' && <Users className="w-3.5 h-3.5" />}
                    {activity.type === 'shortlist' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {activity.type === 'interview' && <Calendar className="w-3.5 h-3.5" />}
                    {activity.type === 'offer' && <Award className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight mb-1">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions / Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/recruiter/candidates">
              <div className="p-4 border rounded-xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-center space-y-2 group">
                <Users className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="font-medium text-sm">Candidate Database</p>
              </div>
            </Link>
            <Link href="/recruiter/jobs">
              <div className="p-4 border rounded-xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-center space-y-2 group">
                <Briefcase className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="font-medium text-sm">Manage Jobs</p>
              </div>
            </Link>
            <Link href="/recruiter/interviews">
              <div className="p-4 border rounded-xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-center space-y-2 group">
                <Calendar className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="font-medium text-sm">Schedule Interview</p>
              </div>
            </Link>
            <Link href="/recruiter/offers">
              <div className="p-4 border rounded-xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-center space-y-2 group">
                <Award className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="font-medium text-sm">Send Offer</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Hiring Trend */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Hiring Trends
              </CardTitle>
              <CardDescription>Hires per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-2">
              <div className="flex h-[180px] items-end justify-between gap-2 px-2">
                {data.trend.map((t: any, i: number) => {
                  const height = Math.max((t.hires / 20) * 100, 10)
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full relative bg-primary/10 rounded-t-sm transition-colors group-hover:bg-primary/30" style={{ height: `${height}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.hires}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.month}</span>
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
