"use client"
import { assessmentService } from "@/services/assessmentService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Eye, CheckCircle2 } from "lucide-react"

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground mt-1">Assign assessments and review candidate results.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Assessment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sent Assessments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Date Sent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessments.length > 0 ? (
                  assessments.map(ass => (
                    <tr key={ass.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{ass.candidate}</td>
                      <td className="px-6 py-4">{ass.role}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(ass.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={ass.status === 'Completed' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-muted text-muted-foreground'}>
                          {ass.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-primary">
                        {ass.score || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="gap-2" disabled={ass.status !== 'Completed'}>
                          <Eye className="w-4 h-4" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No assessments sent yet.
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
