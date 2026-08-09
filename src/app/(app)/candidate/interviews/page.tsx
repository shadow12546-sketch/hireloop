"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Building2, User, HelpCircle } from "lucide-react"

export default function CandidateInterviews() {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past interviews.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No upcoming interviews</h3>
          <p className="text-muted-foreground mt-1">Keep applying to land your next interview.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {interviews.map(interview => (
            <Card key={interview.id} className="overflow-hidden">
              <div className="bg-primary/5 px-6 py-3 border-b flex justify-between items-center">
                <span className="font-semibold text-primary">{interview.status}</span>
                <span className="text-sm font-medium">{interview.type}</span>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{interview.jobTitle}</h3>
                      <div className="flex items-center text-muted-foreground">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{interview.company}</span>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(interview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{interview.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-primary" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-48">
                    <Button className="w-full gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
                      <Video className="w-4 h-4" /> Join Meeting
                    </Button>
                    <Button variant="outline" className="w-full gap-2 text-muted-foreground">
                      <HelpCircle className="w-4 h-4" /> Need Help?
                    </Button>
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
