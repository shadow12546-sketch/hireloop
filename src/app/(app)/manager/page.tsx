"use client"
import { candidateService } from "@/services/candidateService"
import { analyticsService } from "@/services/analyticsService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle2, Award, Briefcase, ChevronRight } from "lucide-react"

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
          <div className="h-7 bg-muted rounded w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ManagerDashboard() {
  const [data, setData] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashboardData, candidatesData] = await Promise.all([
          analyticsService.getKpis(),
          candidateService.getAllCandidates()
        ])
        setData(dashboardData)
        setCandidates(candidatesData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!loading && (!data || !candidates)) {
    throw new Error("Failed to load manager dashboard data.")
  }

  const kpis = [
    { label: "Pending Reviews", value: data?.pendingReviews, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Shortlisted", value: data?.shortlisted, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Offers Extended", value: data?.offersExtended, icon: Award, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Roles", value: data?.activeRoles, icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="page-title">Hiring Manager Dashboard</h1>
        <p className="page-subtitle">Review candidates and make final hiring decisions.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <Card key={i} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1 truncate">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value ?? "—"}</p>
                </div>
                <div className={`p-3 rounded-xl shrink-0 ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates Pending Review</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 dark:bg-muted/40 border-y">
                <tr>
                  <th className="th-cell">Candidate</th>
                  <th className="th-cell">Role</th>
                  <th className="th-cell text-center">Match Score</th>
                  <th className="th-cell text-center">Assessment</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded skeleton-shimmer" style={{ width: `${60 + (j * 11) % 35}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : candidates.map(candidate => (
                  <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                    <td className="td-cell font-semibold">{candidate.name}</td>
                    <td className="td-cell text-muted-foreground">{candidate.role}</td>
                    <td className="td-cell text-center">
                      <span className="font-bold text-primary">{candidate.matchScore}%</span>
                    </td>
                    <td className="td-cell text-center">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {candidate.assessment.score}/100
                      </Badge>
                    </td>
                    <td className="td-cell">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">
                        {candidate.status}
                      </Badge>
                    </td>
                    <td className="td-cell text-right">
                      <Button variant="outline" size="sm" render={<Link href={`/manager/candidates/${candidate.id}`} />} className="gap-1.5">
                        Review <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-xl animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : candidates.map(candidate => (
              <div key={candidate.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{candidate.role}</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 shrink-0">
                    {candidate.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                      Match: {candidate.matchScore}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Score: {candidate.assessment.score}/100
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" render={<Link href={`/manager/candidates/${candidate.id}`} />} className="gap-1 text-xs">
                    Review <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
