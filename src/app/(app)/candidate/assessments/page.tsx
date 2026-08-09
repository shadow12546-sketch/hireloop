"use client"
import { assessmentService } from "@/services/assessmentService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Code2, AlertCircle } from "lucide-react"

export default function CandidateAssessments() {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground mt-1">Complete your pending skills tests to advance your applications.</p>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No pending assessments</h3>
          <p className="text-muted-foreground mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assessments.map(ass => (
            <Card key={ass.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{ass.title}</h3>
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                        {ass.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">{ass.company} • {ass.jobTitle}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Duration: <strong>{ass.duration}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Deadline: {new Date(ass.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 md:w-48">
                    <Button className="w-full" render={<Link href={`/candidate/assessments/${ass.id}`} />}>
                      Start Assessment
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Make sure you have {ass.duration} of uninterrupted time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
