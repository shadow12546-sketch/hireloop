"use client"
import { assessmentService } from "@/services/assessmentService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Code2, AlertCircle } from "lucide-react"

export default function CandidateAssessments() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const data = await assessmentService.getCandidateAssessments()
        setAssessments(data)
      } catch (err: any) {
        setError(err?.message || "Failed to load assessments. Please try again.")
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground mt-1">Complete your pending skills tests to advance your applications.</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <h3 className="font-semibold text-lg text-foreground mb-1">Failed to load assessments</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : assessments.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No pending assessments</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              You're all caught up! Assessments will appear here when auto-assigned for high match applications (score ≥ 80%).
            </p>
            <Button render={<Link href="/candidate/applications" />} className="h-9 px-4 shadow-sm" variant="outline">
              View Applications
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assessments.map((ass) => {
            const normalizedStatus = (ass.status || "").toUpperCase()
            let badgeStyle = "bg-muted text-muted-foreground"
            let btnText = "Start Assessment"
            let btnVariant: "default" | "outline" | "secondary" = "default"
            let btnDisabled = false
            let helperText = `Make sure you have ${ass.duration || "uninterrupted time"}.`

            if (normalizedStatus === "ASSIGNED") {
              badgeStyle = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
              btnText = "Start Assessment"
            } else if (normalizedStatus === "IN_PROGRESS") {
              badgeStyle = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              btnText = "Resume Assessment"
              helperText = "Your assessment is currently in progress."
            } else if (normalizedStatus === "SUBMITTED" || normalizedStatus === "EVALUATED") {
              badgeStyle = "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
              btnText = "View Results"
              btnVariant = "outline"
              helperText = ass.score !== undefined && ass.maxScore ? `Score: ${ass.score} / ${ass.maxScore}` : "Completed assessment."
            } else if (normalizedStatus === "EXPIRED") {
              badgeStyle = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
              btnText = "Expired"
              btnVariant = "secondary"
              btnDisabled = true
              helperText = "The deadline for this assessment has passed."
            }

            const attemptId = ass.id || ass._id

            return (
              <Card key={attemptId} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{ass.title || "Technical Assessment"}</h3>
                        <Badge variant="outline" className={badgeStyle}>
                          {normalizedStatus}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {ass.company} • {ass.jobTitle}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-2 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Duration: <strong>{ass.duration || "60 Mins"}</strong>
                          </span>
                        </div>
                        {ass.deadline && (
                          <div className={`flex items-center gap-1.5 ${normalizedStatus === "EXPIRED" ? "text-red-600" : "text-amber-600 dark:text-amber-400"}`}>
                            <AlertCircle className="w-4 h-4" />
                            <span>Deadline: {new Date(ass.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 md:w-48">
                      <Button
                        className="w-full"
                        variant={btnVariant}
                        disabled={btnDisabled}
                        render={btnDisabled ? undefined : <Link href={`/candidate/assessments/${attemptId}`} />}
                      >
                        {btnText}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">{helperText}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
