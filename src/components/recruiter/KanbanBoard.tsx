"use client"
import { applicationService } from "@/services/applicationService"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  name: string
  role: string
  matchScore: number
  experience: string
  appliedDate: string
  status: string
  avatar: string
}

const COLUMNS = ["Applied", "Screening", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"]

interface KanbanBoardProps {
  initialCandidates: Candidate[]
}

export function KanbanBoard({ initialCandidates }: KanbanBoardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData("text/plain", id)
    e.currentTarget.classList.add("opacity-50")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50")
    setDraggedId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    
    if (!id || !draggedId) return
    
    const candidateToMove = candidates.find(c => c.id === id)
    if (!candidateToMove || candidateToMove.status === status) return

    const oldStatus = candidateToMove.status

    // Optimistic update
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))

    try {
      await applicationService.updateApplicationStatus(id, status)
    } catch (error) {
      // Rollback
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: oldStatus } : c))
      console.error("Failed to update status")
    }
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar">
      {COLUMNS.map(column => (
        <div 
          key={column} 
          className="flex flex-col min-w-[280px] sm:min-w-[320px] bg-muted/30 rounded-xl border"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column)}
        >
          <div className="p-3 border-b flex justify-between items-center bg-card rounded-t-xl">
            <h3 className="font-semibold text-sm">{column}</h3>
            <Badge variant="secondary">
              {candidates.filter(c => c.status === column).length}
            </Badge>
          </div>
          
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {candidates
              .filter(c => c.status === column)
              .map(candidate => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate.id)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {candidate.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm leading-none">{candidate.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{candidate.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <Badge variant="outline" className="text-[10px] py-0">
                          Score: {candidate.matchScore}%
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(candidate.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
