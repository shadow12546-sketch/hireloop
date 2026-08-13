"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain, MessageSquare, CheckCircle2, AlertCircle, Loader2, Star,
  ThumbsUp, ThumbsDown, Eye, Video, Clock
} from "lucide-react"

function ScorePill({ score, label }: { score: number; label: string }) {
  const color =
    score >= 85 ? "text-green-700 dark:text-green-400 bg-green-500/10 border-green-500/20" :
    score >= 70 ? "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" :
    "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20"
  return (
    <div className="text-center">
      <span className={`inline-block px-2.5 py-1 rounded-lg border text-sm font-bold ${color}`}>
        {score}%
      </span>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed:    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    "In Progress":"bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    Scheduled:    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    Failed:       "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  }
  return (
    <Badge variant="outline" className={map[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  )
}

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await interviewService.getInterviews()
        setInterviews(data)
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
          <h1 className="text-3xl font-bold tracking-tight">AI Interview Results</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-[52px]">
          AI interviews are conducted automatically. Review evaluation scores and recommendations below.
        </p>
      </div>

      {/* AI Notice Banner */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Interviews are AI-managed</p>
          <p className="text-muted-foreground mt-0.5">
            HireLoop AI conducts structured, text-based interviews for shortlisted candidates and generates
            detailed evaluation reports. No manual scheduling is required.
          </p>
        </div>
      </div>

      {/* Interview Results Cards */}
      <div className="grid gap-6">
        {interviews.length > 0 ? (
          interviews.map(interview => (
            <Card key={interview.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left: Candidate info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-bold">{interview.candidate}</h3>
                        <p className="text-muted-foreground text-sm">
                          {interview.role} &bull; AI Interview &bull;{" "}
                          {new Date(interview.date).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={interview.status} />
                    </div>

                    {interview.status === "Completed" && (
                      <>
                        {/* Score breakdown */}
                        <div className="flex items-center gap-6 py-3 border-y border-border/50">
                          <ScorePill score={interview.overallScore || 87} label="Overall Score" />
                          <ScorePill score={interview.technicalScore || 90} label="Technical" />
                          <ScorePill score={interview.communicationScore || 84} label="Communication" />
                        </div>

                        {/* Summary */}
                        {interview.summary && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              AI Interview Summary
                            </p>
                            <p className="text-sm leading-relaxed">{interview.summary}</p>
                          </div>
                        )}

                        {/* AI Recommendation */}
                        <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/15 rounded-lg">
                          <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                          <div className="text-sm">
                            <span className="font-semibold text-green-700 dark:text-green-400">AI Recommendation: </span>
                            <span className="text-muted-foreground">{interview.recommendation || "Strong Candidate — recommended for final review."}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {interview.status === "In Progress" && (
                      <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        AI interview is in progress...
                      </div>
                    )}

                    {interview.status === "Scheduled" && (
                      <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                        <Clock className="w-4 h-4 shrink-0" />
                        AI interview is pending candidate participation.
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 w-full lg:w-44 shrink-0">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      disabled={interview.status !== "Completed"}
                    >
                      <Eye className="w-4 h-4" /> View Full Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-primary opacity-80" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No AI interview results yet</h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-sm">
                AI interviews are automatically conducted for candidates who have completed the assessment stage.
                Results will appear here once interviews are finished.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
