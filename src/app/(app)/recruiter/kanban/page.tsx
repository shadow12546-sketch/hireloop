"use client"
import { candidateService } from "@/services/candidateService"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/recruiter/KanbanBoard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RecruiterKanbanPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await candidateService.getAllCandidates()
        setCandidates(data)
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
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="page-title">Hiring Pipeline</h1>
          <p className="page-subtitle">Drag and drop candidates across stages.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Filter by Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="job1">Senior React Developer</SelectItem>
              <SelectItem value="job2">Product Manager</SelectItem>
              <SelectItem value="job3">UX Designer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialCandidates={candidates} />
      </div>
    </div>
  )
}
