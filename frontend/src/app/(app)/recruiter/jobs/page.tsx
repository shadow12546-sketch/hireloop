"use client"
import { jobService } from "@/services/jobService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Eye, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"

function StatusBadge({ status }: { status: string }) {
  if (status === "Active") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        {status}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground">
      {status}
    </Badge>
  )
}

function JobRowSkeleton() {
  return (
    <tr className="border-b">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded skeleton-shimmer" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

function JobCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
    </div>
  )
}

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function load() {
      try {
        // Use employer-specific endpoint to see own jobs at all statuses
        const res: any = await jobService.getMyJobs()
        const jobsList = Array.isArray(res) ? res : res?.data?.jobs || res?.jobs || res?.data || []
        setJobs(Array.isArray(jobsList) ? jobsList : [])
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const jobsArray = Array.isArray(jobs) ? jobs : []

  const filteredJobs = jobsArray.filter(job => {
    if (!job) return false
    const title = job.title || ''
    const dept = job.department || job.category || ''
    const loc = job.location || ''
    const search = searchTerm.toLowerCase()
    return title.toLowerCase().includes(search) || dept.toLowerCase().includes(search) || loc.toLowerCase().includes(search)
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Job Openings</h1>
          <p className="page-subtitle">Manage and track all your active job postings.</p>
        </div>
        <Button className="gap-2 shrink-0" render={<Link href="/recruiter/jobs/create" />}>
          <Plus className="w-4 h-4" /> Create New Job
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="text-lg">All Jobs</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          {jobs.length === 0 && !loading ? (
            <div className="p-12 flex flex-col items-center text-center bg-muted/10 border-dashed border-b last:border-b-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary opacity-80" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No jobs posted yet</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                Create your first job posting to start attracting top candidates.
              </p>
              <Button render={<Link href="/recruiter/jobs/create" />} className="h-9 px-4 shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Post Your First Job
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 dark:bg-muted/40 border-y">
                    <tr>
                      <th className="th-cell">Job Title</th>
                      <th className="th-cell">Department</th>
                      <th className="th-cell">Location</th>
                      <th className="th-cell text-center">Applicants</th>
                      <th className="th-cell">Status</th>
                      <th className="th-cell">Deadline</th>
                      <th className="th-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      [...Array(5)].map((_, i) => <JobRowSkeleton key={i} />)
                    ) : filteredJobs.length > 0 ? (
                      filteredJobs.map((job, idx) => {
                        const jobId = job._id || job.id || idx
                        const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'
                        const applications = job.applicationCount ?? job.applications ?? 0
                        return (
                        <tr key={jobId} className="hover:bg-muted/30 transition-colors">
                          <td className="td-cell font-semibold">{job.title || 'Untitled'}</td>
                          <td className="td-cell text-muted-foreground">{job.department || job.category || '—'}</td>
                          <td className="td-cell text-muted-foreground">{job.location || 'Remote'}</td>
                          <td className="td-cell text-center">
                            <Badge variant="secondary">{applications}</Badge>
                          </td>
                          <td className="td-cell">
                            <StatusBadge status={job.status || 'OPEN'} />
                          </td>
                          <td className="td-cell text-muted-foreground">
                            {deadline}
                          </td>
                          <td className="td-cell text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" render={<Link href={`/recruiter/jobs/${jobId}`} />}>
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-muted-foreground">
                          <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>No jobs found matching your search.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
                  </div>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => {
                    const jobId = job._id || job.id || idx
                    const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'
                    const applications = job.applicationCount ?? job.applications ?? 0
                    return (
                    <Link key={String(jobId)} href={`/recruiter/jobs/${jobId}`}>
                      <div className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-sm">{job.title || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">{job.department || job.category || '—'} · {job.location || 'Remote'}</p>
                          </div>
                          <StatusBadge status={job.status || 'OPEN'} />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs">{applications} applicants</Badge>
                          <span className="text-xs text-muted-foreground">
                            Due {deadline}
                          </span>
                        </div>
                      </div>
                    </Link>
                    )
                  })
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No jobs found matching your search.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
