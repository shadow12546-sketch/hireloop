"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, Plus, User, Search } from "lucide-react"

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isScheduling, setIsScheduling] = useState(false)

  const [form, setForm] = useState({
    candidate: "",
    interviewer: "",
    date: "",
    time: "",
    type: "Technical",
    link: "https://zoom.us/j/generated"
  })

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

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock scheduling
    const newInterview = {
      id: Math.random().toString(),
      candidate: form.candidate,
      role: "Various",
      interviewer: form.interviewer,
      date: form.date,
      time: form.time,
      type: form.type,
      link: form.link,
      status: "Scheduled"
    }
    setInterviews([...interviews, newInterview])
    setIsScheduling(false)
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage candidate interviews.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsScheduling(!isScheduling)}>
          {isScheduling ? "Cancel Scheduling" : <><Plus className="w-4 h-4" /> Schedule Interview</>}
        </Button>
      </div>

      {isScheduling && (
        <Card className="border-primary/50 animate-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Schedule New Interview</CardTitle>
            <CardDescription>Select a candidate and interviewer to set up a meeting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Candidate Name</label>
                  <Input required placeholder="e.g. Alice Johnson" value={form.candidate} onChange={e => setForm({...form, candidate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interviewer</label>
                  <Input required placeholder="e.g. Sarah (Design Lead)" value={form.interviewer} onChange={e => setForm({...form, interviewer: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Interview Type</label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v as string})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Screening">Screening (30 min)</SelectItem>
                      <SelectItem value="Technical">Technical (60 min)</SelectItem>
                      <SelectItem value="Cultural">Cultural (45 min)</SelectItem>
                      <SelectItem value="Final">Final Round (60 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
                <Button type="submit">Send Invite</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {interviews.length > 0 ? (
          interviews.map(interview => (
            <Card key={interview.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{interview.candidate}</h3>
                        <p className="text-muted-foreground">{interview.role} • {interview.type} Interview</p>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {interview.status}
                      </Badge>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(interview.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{interview.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-primary" />
                        <span className="truncate" title={`Interviewer: ${interview.interviewer}`}>Host: {interview.interviewer}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-48 shrink-0">
                    <Button className="w-full gap-2" render={<a href={interview.link} target="_blank" rel="noreferrer" />}>
                      <Video className="w-4 h-4" /> Join Meeting
                    </Button>
                    <Button variant="outline" className="w-full">Reschedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary opacity-80" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No upcoming interviews</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                You haven't scheduled any interviews yet. Click the schedule button to set up an interview with a candidate.
              </p>
              <Button onClick={() => setIsScheduling(true)} className="h-9 px-4 shadow-sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Schedule Interview
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
