"use client"
import { applicationService } from "@/services/applicationService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Building2, Calendar, FileText, ExternalLink } from "lucide-react"
import { ApplicationTimeline } from "@/components/candidate/ApplicationTimeline"
import { AIAnalysisCard } from "@/components/candidate/AIAnalysisCard"

export default function ApplicationTracking({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await applicationService.getApplicationById(resolvedParams.id)
        setApp(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Application Not Found</h2>
        <Button variant="link" render={<Link href="/candidate/applications" />} className="mt-4">
          Back to Applications
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/candidate/applications" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Applications
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{app.jobTitle}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center text-foreground font-medium">
              <Building2 className="w-4 h-4 mr-2" /> {app.company}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Applied {new Date(app.appliedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <Button variant="outline" className="gap-2" render={<Link href={`/candidate/jobs/${app.jobId}`} />}>
          View Original Job <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-8">
          <ApplicationTimeline stages={app.stages} currentStageIndex={app.currentStage} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AIAnalysisCard 
            score={app.matchScore}
            strengths={app.aiAnalysis.strengths}
            gaps={app.aiAnalysis.gaps}
            recommendation={app.aiAnalysis.recommendation}
          />

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {app.status === "Interview" ? (
                <div className="p-4 border rounded-xl bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                  <h4 className="font-semibold mb-2">Interview Scheduled</h4>
                  <p className="text-sm mb-4">You have an upcoming interview scheduled. Please review the details and confirm your attendance.</p>
                  <Button size="sm" render={<Link href="/candidate/interviews" />}>View Interview Details</Button>
                </div>
              ) : app.status === "Assessment" ? (
                <div className="p-4 border rounded-xl bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <h4 className="font-semibold mb-2">Assessment Assigned</h4>
                  <p className="text-sm mb-4">You have a pending skills assessment. Complete it before the deadline to proceed to the next stage.</p>
                  <Button size="sm" render={<Link href="/candidate/assessments" />}>Go to Assessments</Button>
                </div>
              ) : app.status === "Offer" ? (
                <div className="p-4 border rounded-xl bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
                  <h4 className="font-semibold mb-2">Offer Received!</h4>
                  <p className="text-sm mb-4">Congratulations! You have received a job offer. Please review and respond to the offer letter.</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" render={<Link href="/candidate/offers" />}>Review Offer</Button>
                </div>
              ) : app.status === "Hired" ? (
                <div className="p-4 border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <h4 className="font-semibold mb-2">Welcome Aboard!</h4>
                  <p className="text-sm mb-4">You have been hired for this role. Look out for an email from the employer regarding onboarding.</p>
                </div>
              ) : app.status === "Rejected" ? (
                <div className="p-4 border rounded-xl bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400">
                  <h4 className="font-semibold mb-2">Application Unsuccessful</h4>
                  <p className="text-sm mb-4">Unfortunately, the hiring team has decided to move forward with other candidates.</p>
                  <Button size="sm" variant="outline" render={<Link href="/candidate/jobs" />}>Find Other Jobs</Button>
                </div>
              ) : app.status === "Screening" || app.status === "Shortlisted" ? (
                <div className="p-4 border rounded-xl bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400">
                  <h4 className="font-semibold mb-2">In Progress</h4>
                  <p className="text-sm">The hiring team is currently reviewing your profile. We will notify you once they make a decision.</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Please wait for the recruiter to update your status.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents Submitted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">sachin_verma_resume.pdf</p>
                  <p className="text-xs text-muted-foreground">Uploaded {new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
