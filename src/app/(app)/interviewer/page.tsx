"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, User, CheckCircle2 } from "lucide-react"

export default function InterviewerDashboard() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const dashboardData = await interviewService.getInterviews()
        setInterviews(dashboardData)
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

  const todayInterviews = interviews.filter(i => i.status === "Today")
  const upcomingInterviews = interviews.filter(i => i.status === "Upcoming")
  const completedInterviews = interviews.filter(i => i.status === "Completed")

  const renderInterviewCard = (interview: any, isPast: boolean = false) => (
    <Card key={interview.id} className={isPast ? "opacity-75" : "hover:border-primary/50 transition-colors"}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">{interview.candidate}</h3>
                <p className="text-muted-foreground">{interview.role} • {interview.type} Round</p>
              </div>
              <Badge variant="outline" className={
                interview.status === 'Today' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 
                interview.status === 'Completed' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 
                'bg-blue-500/10 text-blue-700 border-blue-500/20'
              }>
                {interview.status}
              </Badge>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{new Date(interview.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{interview.time}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-48 shrink-0">
            {!isPast && (
              <Button className="w-full gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
                <Video className="w-4 h-4" /> Join Meeting
              </Button>
            )}
            <Button variant={isPast ? "outline" : "secondary"} className="w-full" render={<Link href={`/interviewer/${interview.id}`} />}>
              View Details
            </Button>
            {isPast && (
              <Button variant="ghost" className="w-full text-green-600 dark:text-green-400 gap-2">
                <CheckCircle2 className="w-4 h-4" /> Feedback Submitted
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interviewer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your schedule and submit feedback.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Today's Interviews
        </h2>
        {todayInterviews.length > 0 ? (
          <div className="grid gap-4">
            {todayInterviews.map(i => renderInterviewCard(i))}
          </div>
        ) : (
          <Card className="bg-muted/30"><CardContent className="p-8 text-center text-muted-foreground">No interviews scheduled for today.</CardContent></Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> Upcoming
        </h2>
        {upcomingInterviews.length > 0 ? (
          <div className="grid gap-4">
            {upcomingInterviews.map(i => renderInterviewCard(i))}
          </div>
        ) : (
          <Card className="bg-muted/30"><CardContent className="p-8 text-center text-muted-foreground">No upcoming interviews.</CardContent></Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" /> Completed
        </h2>
        {completedInterviews.length > 0 ? (
          <div className="grid gap-4">
            {completedInterviews.map(i => renderInterviewCard(i, true))}
          </div>
        ) : (
          <Card className="bg-muted/30"><CardContent className="p-8 text-center text-muted-foreground">No past interviews found.</CardContent></Card>
        )}
      </div>
    </div>
  )
}
