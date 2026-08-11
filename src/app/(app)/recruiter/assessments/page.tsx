"use client"
import { assessmentService } from "@/services/assessmentService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, CheckCircle2, Brain, AlertCircle, Loader2, Clock } from "lucide-react"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed:   "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    "In Progress":"bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    Assigned:    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    Failed:      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  }
  return (
    <Badge variant="outline" className={map[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  )
}

export default function RecruiterAssessments() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await assessmentService.getAssessments()
        setAssessments(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assessment Results</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-[52px]">
          Assessments are automatically assigned and conducted by HireLoop AI. Review results below.
        </p>
      </div>

      {/* AI Notice Banner */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Assessments are AI-managed</p>
          <p className="text-muted-foreground mt-0.5">
            HireLoop AI automatically assigns and evaluates assessments for shortlisted candidates.
            No manual assignment is required.
          </p>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Assessment Results</CardTitle>
          <CardDescription>AI-generated assessment scores and evaluations for all candidates.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">AI Assessment Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">AI Score</th>
                  <th className="px-6 py-4 text-right">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessments.length > 0 ? (
                  assessments.map(ass => (
                    <tr key={ass.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{ass.candidate}</td>
                      <td className="px-6 py-4 text-muted-foreground">{ass.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-primary" />
                          <span>AI Technical Assessment</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(ass.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ass.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {ass.status === "Completed" ? (
                          <span className="font-bold text-primary text-base">{ass.score}</span>
                        ) : ass.status === "In Progress" ? (
                          <span className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          disabled={ass.status !== "Completed"}
                        >
                          <Eye className="w-4 h-4" /> View Results
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <FileText className="w-6 h-6 opacity-40" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">No assessment results yet</p>
                          <p className="text-sm mt-1">
                            AI assessments will appear here automatically once candidates are shortlisted.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
