"use client"
import { jobService } from "@/services/jobService"
import { candidateService } from "@/services/candidateService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit, Trash2, MapPin, Briefcase, DollarSign, Users, Eye } from "lucide-react"

export default function RecruiterJobDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [job, setJob] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [jobData, allCandidates] = await Promise.all([
          jobService.getJobById(resolvedParams.id),
          candidateService.getAllCandidates()
        ])
        setJob(jobData)
        // Simulate finding candidates for this specific role
        setCandidates(allCandidates.filter(c => c.role === jobData?.title))
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

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <Button variant="link" render={<Link href="/recruiter/jobs" />} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/recruiter/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge variant="outline" className={job.status === 'Active' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-muted text-muted-foreground'}>
              {job.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {job.location}
            </span>
            <span className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1" /> {job.department}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" /> Edit Job
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> Close Role
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Candidates Applied ({candidates.length})</CardTitle>
              <Button variant="outline" size="sm" render={<Link href="/recruiter/kanban" />}>View in Kanban</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {candidates.length > 0 ? (
                  candidates.map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {candidate.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{candidate.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Applied on {new Date(candidate.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="hidden sm:inline-flex">{candidate.status}</Badge>
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-semibold">{candidate.matchScore}%</p>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                        <Button variant="ghost" size="icon" render={<Link href={`/recruiter/candidates/${candidate.id}`} />}>
                          <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No candidates have applied for this role yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {job.applications}
                </p>
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Created Date</p>
                  <p className="text-sm font-medium">{new Date(job.created).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Application Deadline</p>
                  <p className="text-sm font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
