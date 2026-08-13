"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect } from "react"
import Link from "next/link"
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
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No upcoming interviews</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Keep applying to land your next interview. We'll notify you when an employer schedules one.
            </p>
            <Button render={<Link href="/candidate/jobs" />} className="h-9 px-4 shadow-sm" variant="outline">
              Find Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {interviews.map(interview => {
            let headerStyle = "bg-primary/5 text-primary border-b"
            let badgeStyle = "text-primary"
            let showJoin = false
            let statusText = interview.status

            if (interview.status === "Upcoming" || interview.status === "Scheduled") {
              headerStyle = "bg-indigo-500/5 border-indigo-500/10 border-b"
              badgeStyle = "text-indigo-600 dark:text-indigo-400 font-semibold"
              showJoin = true
              statusText = "Upcoming"
            } else if (interview.status === "Completed") {
              headerStyle = "bg-green-500/5 border-green-500/10 border-b"
              badgeStyle = "text-green-600 dark:text-green-400 font-semibold"
            } else if (interview.status === "Cancelled") {
              headerStyle = "bg-red-500/5 border-red-500/10 border-b"
              badgeStyle = "text-red-600 dark:text-red-400 font-semibold"
            } else if (interview.status === "Rescheduled") {
              headerStyle = "bg-amber-500/5 border-amber-500/10 border-b"
              badgeStyle = "text-amber-600 dark:text-amber-400 font-semibold"
              showJoin = true
            }

            return (
              <Card key={interview.id} className="overflow-hidden hover:border-primary/40 transition-colors">
                <div className={`px-6 py-3 flex justify-between items-center ${headerStyle}`}>
                  <span className={badgeStyle}>{statusText}</span>
                  <span className="text-sm font-medium opacity-80">{interview.type}</span>
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
                          <Calendar className={`w-4 h-4 ${interview.status === 'Cancelled' ? 'text-muted-foreground' : 'text-primary'}`} />
                          <span className={`font-medium ${interview.status === 'Cancelled' ? 'line-through text-muted-foreground' : ''}`}>
                            {new Date(interview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className={`w-4 h-4 ${interview.status === 'Cancelled' ? 'text-muted-foreground' : 'text-primary'}`} />
                          <span className={`font-medium ${interview.status === 'Cancelled' ? 'line-through text-muted-foreground' : ''}`}>
                            {interview.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{interview.interviewer}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full md:w-48">
                      {showJoin && (
                        <Button className="w-full gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
                          <Video className="w-4 h-4" /> Join Meeting
                        </Button>
                      )}
                      {(interview.status === "Upcoming" || interview.status === "Rescheduled") && (
                        <Button variant="outline" className="w-full gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" /> Reschedule
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
                        <HelpCircle className="w-4 h-4" /> Need Help?
                      </Button>
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
