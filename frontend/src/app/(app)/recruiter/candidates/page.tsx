"use client"
import { candidateService } from "@/services/candidateService"
import { applicationService } from "@/services/applicationService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, ChevronRight, Users } from "lucide-react"

function MatchBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden shrink-0">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums">{score}%</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Shortlisted" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" :
    status === "Interview"   ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
    status === "Offer"       ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" :
    "bg-muted text-muted-foreground border-border"
  return <Badge variant="outline" className={cls}>{status}</Badge>
}

function RowSkeleton() {
  return (
    <tr className="border-b">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded skeleton-shimmer" style={{ width: `${55 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

const PIPELINE_STAGES = [
  "All",
  "Applied",
  "Screening",
  "AI Pre-Screening",
  "Shortlisted",
  "Assessment",
  "Interview",
  "Offer",
  "Hired",
  "Rejected"
]

export default function CandidatesList() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    async function load() {
      try {
        const apps = await applicationService.getEmployerApplications()
        const candidateList = apps.map((app: any) => ({
          id: app.candidateId || app._id,
          userId: app.candidateId,
          name: app.candidateName || "Candidate",
          email: app.candidateEmail || "",
          role: app.jobTitle || "Applicant",
          matchScore: app.aiMatchScore ?? app.matchScore ?? 80,
          status: app.status || "Applied",
          appliedDate: app.appliedDate || new Date().toISOString(),
        }))
        setCandidates(candidateList)
      } catch {
        setCandidates([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Candidate Database</h1>
          <p className="page-subtitle">Search, filter, and manage all your candidates.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="text-lg">All Candidates</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or role..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PIPELINE_STAGES.map(stage => (
              <button
                key={stage}
                onClick={() => setStatusFilter(stage)}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  statusFilter === stage 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          {candidates.length === 0 && !loading ? (
            <div className="p-12 flex flex-col items-center text-center bg-muted/10 border-dashed border-b last:border-b-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary opacity-80" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No candidates found</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                You don't have any candidates yet. Make sure your job postings are active.
              </p>
              <Button render={<Link href="/recruiter/jobs" />} className="h-9 px-4 shadow-sm" variant="outline">
                View Jobs
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 dark:bg-muted/40 border-y">
                    <tr>
                      <th className="th-cell">Candidate</th>
                      <th className="th-cell">Role Applied</th>
                      <th className="th-cell">Experience</th>
                      <th className="th-cell text-center">Match Score</th>
                      <th className="th-cell">Status</th>
                      <th className="th-cell">Applied Date</th>
                      <th className="th-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      [...Array(6)].map((_, i) => <RowSkeleton key={i} />)
                    ) : filteredCandidates.length > 0 ? (
                      filteredCandidates.map(candidate => (
                        <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                          <td className="td-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full gradient-violet text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {candidate.avatar}
                              </div>
                              <span className="font-semibold">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="td-cell">{candidate.role}</td>
                          <td className="td-cell text-muted-foreground">{candidate.experience}</td>
                          <td className="td-cell">
                            <div className="flex justify-center">
                              <MatchBar score={candidate.matchScore} />
                            </div>
                          </td>
                          <td className="td-cell">
                            <StatusBadge status={candidate.status} />
                          </td>
                          <td className="td-cell text-muted-foreground">
                            {new Date(candidate.appliedDate).toLocaleDateString()}
                          </td>
                          <td className="td-cell text-right">
                            <Button variant="ghost" size="icon" render={<Link href={`/recruiter/candidates/${candidate.id}`} />}>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>No candidates found matching your search.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-xl space-y-2 animate-pulse">
                        <div className="flex gap-3 items-center">
                          <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map(candidate => (
                    <Link key={candidate.id} href={`/recruiter/candidates/${candidate.id}`}>
                      <div className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-violet text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {candidate.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{candidate.role} · {candidate.experience}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <StatusBadge status={candidate.status} />
                            <MatchBar score={candidate.matchScore} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No candidates found matching your search.</p>
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
