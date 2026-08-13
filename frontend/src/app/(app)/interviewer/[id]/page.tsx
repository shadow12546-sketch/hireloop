"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Calendar, Clock, Video, FileText, FileSignature } from "lucide-react"

export default function InterviewerDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await interviewService.getInterviewById(resolvedParams.id)
        setInterview(data)
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

  if (!interview) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Interview Not Found</h2>
        <Button variant="link" render={<Link href="/interviewer" />} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/interviewer" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{interview.candidate}</h1>
            <Badge variant="outline" className={interview.status === 'Completed' ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}>
              {interview.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{interview.role} • {interview.type} Round</p>
        </div>
        
        {interview.status !== 'Completed' ? (
          <div className="flex gap-2">
            <Button className="gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
              <Video className="w-4 h-4" /> Join Meeting
            </Button>
            <Button variant="secondary" className="gap-2" render={<Link href={`/interviewer/${interview.id}/feedback`} />}>
              <FileSignature className="w-4 h-4" /> Evaluate
            </Button>
          </div>
        ) : (
          <Button variant="outline" disabled className="gap-2">
            <FileSignature className="w-4 h-4" /> Feedback Submitted
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground min-h-[500px]">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p>Resume Viewer</p>
                <p className="text-sm mt-2">{interview.resumeLink}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-muted-foreground text-sm">{new Date(interview.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b pb-4">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-muted-foreground text-sm">{interview.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-2">
                <Video className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Platform</p>
                  <p className="text-muted-foreground text-sm">Zoom Video Call</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Key requirements to assess</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                <li>Strong fundamental knowledge of system architecture.</li>
                <li>Clear communication and ability to articulate trade-offs.</li>
                <li>Experience with scalable backend systems.</li>
                <li>Cultural fit and team collaboration skills.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
