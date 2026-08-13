"use client"

import { useState, useEffect } from "react"
import { applicationService } from "@/services/applicationService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Users, ChevronRight, Building2, Calendar, Filter, Loader2 } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Screening: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Shortlisted: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Assessment: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Interview: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Offer: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Hired: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

const STAGE_FILTERS = ["All", "Applied", "Screening", "Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    applicationService.getApplications().then((data) => {
      // Augment mock data with employer-side fields
      const augmented = data.map((app: any) => ({
        ...app,
        candidateName: ["John Doe", "Jane Smith", "Alice Johnson"][Math.floor(Math.random() * 3)],
        matchScore: Math.floor(Math.random() * 20) + 80,
        experience: ["2 years", "5 years", "3 years"][Math.floor(Math.random() * 3)],
      }))
      setApplications(augmented)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || app.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading ? "Loading..." : `${filtered.length} application${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <Button render={<Link href="/recruiter/kanban" />} className="shrink-0">
          View Pipeline Board
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate or job title..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {STAGE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              You haven't received any applications for your active jobs yet. Check your job postings.
            </p>
            <Button render={<Link href="/recruiter/jobs" />} className="h-9 px-4 shadow-sm" variant="outline">
              Manage Jobs
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id} className="hover:border-primary/40 transition-colors group">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shrink-0">
                    {app.candidateName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{app.candidateName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {app.jobTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-primary">Match: {app.matchScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"}`}
                  >
                    {app.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group-hover:translate-x-0.5 transition-transform"
                    render={<Link href={`/recruiter/candidates/${app.candidateId}`} />}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
