"use client"
import { candidateService } from "@/services/candidateService"
import { applicationService } from "@/services/applicationService"
import { interviewService } from "@/services/interviewService"
import { assessmentService } from "@/services/assessmentService"
import { offerService } from "@/services/offerService"
import { notificationService } from "@/services/notificationService"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  Award, 
  Bell, 
  CheckCircle,
  Clock,
  Video,
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { AIAnalysisCard } from "@/components/candidate/AIAnalysisCard"

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
        <div className="h-full w-full bg-muted rounded-xl animate-pulse min-h-[100px]" />
      </CardContent>
    </Card>
  )
}

export default function CandidateDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profile, apps, interviews, assessments, offers, notifs] = await Promise.all([
          candidateService.getProfile(),
          applicationService.getApplications(),
          interviewService.getInterviews(),
          assessmentService.getAssessments(),
          offerService.getOffers(),
          notificationService.getNotifications()
        ])
        
        setData({ profile, apps, interviews, assessments, offers, notifs })
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboard()
  }, [])

  if (!loading && !data) {
    throw new Error("Failed to load dashboard data.")
  }

  const nextActions = data ? [
    ...data.offers.map((o: any) => ({ type: "Offer", title: `Offer from ${o.company}`, desc: "Respond to job offer", date: o.date, priority: "high", action: "Review Offer", icon: Award, color: "text-green-500", bg: "bg-green-500/10" })),
    ...data.interviews.map((i: any) => ({ type: "Interview", title: `${i.jobTitle} at ${i.company}`, desc: `Scheduled for ${i.time}`, date: i.date, priority: "high", action: "Join Meeting", icon: Video, color: "text-blue-500", bg: "bg-blue-500/10", link: i.link })),
    ...data.assessments.map((a: any) => ({ type: "Assessment", title: `${a.type} for ${a.company}`, desc: `Due by ${new Date(a.dueDate).toLocaleDateString()}`, priority: "medium", action: "Start Assessment", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" })),
  ] : []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {loading ? "Welcome back!" : `Welcome back, ${data.profile.firstName}!`}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here are your next steps and application updates.
          </p>
        </div>
        <Button render={<Link href="/candidate/jobs" />} className="h-10 px-5">
          Find New Jobs
        </Button>
      </div>

      {/* Next Actions Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Requires your attention</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton className="h-32" />
            <CardSkeleton className="h-32" />
          </div>
        ) : nextActions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextActions.slice(0, 3).map((action, i) => (
              <Card key={i} className="hover:border-primary/40 transition-colors shadow-sm">
                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg shrink-0 ${action.bg}`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground leading-tight mb-1">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <Button variant={action.priority === "high" ? "default" : "secondary"} className="w-full h-9 text-sm" render={action.link ? <a href={action.link} target="_blank" rel="noreferrer" /> : <Link href="#" />}>
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3 opacity-80" />
              <p className="font-medium text-foreground">You're all caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No pending actions required right now.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Applications */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Active Applications</h2>
            <Link href="/candidate/applications" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          {loading ? (
            <CardSkeleton className="h-64" />
          ) : data.apps.length > 0 ? (
            <div className="space-y-3">
              {data.apps.slice(0, 4).map((app: any) => (
                <Card key={app.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0">
                        {app.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{app.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{app.company} • Applied {new Date(app.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <Badge variant="secondary" className="px-3 py-1 bg-muted/80 text-foreground font-medium rounded-full">
                        {app.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="shrink-0" render={<Link href={`/candidate/applications/${app.id}`} />}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="p-12 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary opacity-80" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">You haven't applied to any jobs yet.</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                  Start exploring opportunities and apply to jobs that match your skills.
                </p>
                <Button render={<Link href="/candidate/jobs" />} className="h-9 px-4 shadow-sm">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Profile & Insights */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Profile Overview</h2>
            {loading ? (
              <CardSkeleton className="h-32" />
            ) : (
              <Card>
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">Profile Completeness</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{data.profile.completionScore}% Complete</p>
                      </div>
                    </div>
                    {data.profile.completionScore < 100 && (
                      <Button variant="outline" size="sm" render={<Link href="/candidate/profile" />}>
                        Update
                      </Button>
                    )}
                  </div>
                  
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${data.profile.completionScore}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Latest Notifications</h2>
            {loading ? (
              <CardSkeleton className="h-48" />
            ) : (
              <Card>
                <CardContent className="p-5 space-y-5">
                  {data.notifs.slice(0, 3).map((notif: any) => (
                    <div key={notif.id} className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${notif.read ? 'bg-muted' : 'bg-primary shadow-[0_0_8px_rgba(118,122,254,0.6)]'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight mb-1">{notif.title}</p>
                        <p className="text-[13px] text-muted-foreground leading-snug">{notif.message}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1.5">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground" render={<Link href="/candidate/notifications" />}>
                    View all notifications
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
