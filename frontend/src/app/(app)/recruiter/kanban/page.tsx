"use client"

import { useState, useEffect, use } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { applicationService } from "@/services/applicationService"
import { KanbanBoard } from "@/components/recruiter/KanbanBoard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function RecruiterKanbanPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        let rawApps: any[] = []
        if (jobId) {
          const res: any = await applicationService.getApplicationsForJob(jobId)
          rawApps = Array.isArray(res) ? res : res?.data?.applications || res?.applications || res?.data || []
        } else {
          rawApps = await applicationService.getEmployerApplications()
        }

        const mapped = rawApps.map((app: any) => {
          const candidateObj = typeof app.candidate === "object" ? app.candidate : null
          const name = candidateObj?.name || app.candidateName || "Applicant"
          const role = app.jobTitle || app.job?.title || "Job Position"
          const status = (app.status || "APPLIED").toUpperCase()

          return {
            id: app._id || app.id,
            name,
            role,
            matchScore: app.aiMatchScore ?? 85,
            experience: app.experience || "N/A",
            appliedDate: app.appliedAt || app.createdAt || app.appliedDate || new Date().toISOString(),
            status,
            avatar: name.charAt(0).toUpperCase(),
          }
        })

        setCandidates(mapped)
      } catch (err) {
        console.error("Failed to load kanban candidates:", err)
        setCandidates([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [jobId])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" render={<Link href={jobId ? `/recruiter/jobs/${jobId}` : "/recruiter/applications"} />}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {jobId ? "Back to Job" : "Back to Applications"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hiring Pipeline Board</h1>
            <p className="text-xs text-muted-foreground">
              {jobId ? "Candidate pipeline for selected job" : "Candidate pipeline across all job postings"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard initialCandidates={candidates} />
      </div>
    </div>
  )
}
