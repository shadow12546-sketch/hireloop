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

  const stats = data ? [
    { label: "Profile Completion", value: `${data.profile.completionScore}%`, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Applications", value: data.apps.length.toString(), icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Upcoming Interviews", value: data.interviews.length.toString(), icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Assessments", value: data.assessments.length.toString(), icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Job Offers", value: data.offers.length.toString(), icon: Award, color: "text-green-500", bg: "bg-green-500/10" },
  ] : []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">
            {loading ? "Welcome back!" : `Welcome back, ${data.profile.firstName}!`}
          </h1>
          <p className="page-subtitle">Here is what is happening with your job search today.</p>
        </div>
        <Button render={<Link href="/candidate/jobs" />}>
          Find New Jobs
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading 
          ? [...Array(5)].map((_, i) => <KpiSkeleton key={i} />)
          : stats.map((s, i) => (
          <Card key={i} className="hover:border-primary/40 transition-colors group">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                  {s.label}
                </p>
                <div className={`p-2 rounded-lg shrink-0 ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications */}
        {loading ? (
          <CardSkeleton className="lg:col-span-2" />
        ) : (
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Track your active application statuses</CardDescription>
              </div>
              <Button variant="outline" size="sm" render={<Link href="/candidate/applications" />} className="hidden sm:inline-flex border-primary/30 text-primary hover:bg-primary/5">
                View All
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {data.apps.map((app: any) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                      {app.company.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight mb-1 truncate">{app.jobTitle}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                        <span className="truncate">{app.company}</span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 whitespace-nowrap">
                      {app.status}
                    </Badge>
                    <Button variant="ghost" size="icon" render={<Link href={`/candidate/applications/${app.id}`} />}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          {loading ? (
            <CardSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.interviews.length > 0 ? data.interviews.map((interview: any) => (
                  <div key={interview.id} className="p-3 border rounded-xl space-y-3">
                    <div>
                      <div className="font-medium text-sm">{interview.jobTitle}</div>
                      <div className="text-xs text-muted-foreground">{interview.company}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(interview.date).toLocaleDateString()} at {interview.time}</span>
                    </div>
                    <Button size="sm" className="w-full gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
                      <Video className="w-4 h-4" /> Join Meeting
                    </Button>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground text-center py-4">No upcoming interviews</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {loading ? (
            <CardSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.notifs.slice(0, 3).map((notif: any) => (
                  <div key={notif.id} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${notif.read ? 'bg-muted' : 'bg-primary'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight mb-1">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Resume Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Resume AI Analysis</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md">
            We use AI to match your resume against your active applications to give you personalized insights.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">Resume Uploaded</p>
                  <p className="text-xs text-muted-foreground truncate">sachin_verma_resume.pdf</p>
                </div>
              </div>
              <Button variant="outline" size="sm" render={<Link href="/candidate/profile" />}>Update</Button>
            </div>
            
            <div className="p-4 border rounded-xl bg-card">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Top Extracted Skills</h4>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  [...Array(6)].map((_, i) => <div key={i} className="h-6 w-16 bg-muted rounded-md animate-pulse" />)
                ) : (
                  data.profile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          {loading ? (
            <div className="h-[300px] bg-muted rounded-2xl animate-pulse" />
          ) : data.apps.length > 0 && data.apps[0].aiAnalysis && (
            <AIAnalysisCard 
              score={data.apps[0].matchScore}
              strengths={data.apps[0].aiAnalysis?.strengths ?? []}
              gaps={data.apps[0].aiAnalysis?.gaps ?? []}
              recommendation={data.apps[0].aiAnalysis?.recommendation ?? ""}
            />
          )}
        </div>
      </div>
    </div>
  )
}
