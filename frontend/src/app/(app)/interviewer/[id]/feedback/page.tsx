"use client"
import { interviewService } from "@/services/interviewService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Send, CheckCircle2, AlertCircle } from "lucide-react"

export default function InterviewerFeedback({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    technical: "",
    communication: "",
    problemSolving: "",
    overall: "",
    comments: ""
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await interviewService.getInterviewById(resolvedParams.id)
        setInterview(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await interviewService.submitFeedback(resolvedParams.id, form)
    setSubmitting(false)
    setSubmitted(true)
    // Simulate updating interview status locally before redirect or just let mock do it if we implemented it
    setTimeout(() => {
      router.push("/interviewer")
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!interview) return null

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Feedback Submitted!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for submitting your evaluation for {interview.candidate}.
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Link href={`/interviewer/${interview.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Interview
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Evaluate Candidate</h1>
        <p className="text-muted-foreground mt-1">Submit your formal feedback for {interview.candidate} ({interview.role}).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Competency Ratings</CardTitle>
            <CardDescription>Rate the candidate on a scale of 1-5 (5 being exceptional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-medium">Technical Skills</label>
                <Select required value={form.technical} onValueChange={v => setForm({...form, technical: v as string})}>
                  <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Exceptional</SelectItem>
                    <SelectItem value="4">4 - Strong</SelectItem>
                    <SelectItem value="3">3 - Competent</SelectItem>
                    <SelectItem value="2">2 - Needs Improvement</SelectItem>
                    <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Demonstrated depth of knowledge and coding ability.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Communication</label>
                <Select required value={form.communication} onValueChange={v => setForm({...form, communication: v as string})}>
                  <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Exceptional</SelectItem>
                    <SelectItem value="4">4 - Strong</SelectItem>
                    <SelectItem value="3">3 - Competent</SelectItem>
                    <SelectItem value="2">2 - Needs Improvement</SelectItem>
                    <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Clarity, articulation, and active listening.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Problem Solving</label>
                <Select required value={form.problemSolving} onValueChange={v => setForm({...form, problemSolving: v as string})}>
                  <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Exceptional</SelectItem>
                    <SelectItem value="4">4 - Strong</SelectItem>
                    <SelectItem value="3">3 - Competent</SelectItem>
                    <SelectItem value="2">2 - Needs Improvement</SelectItem>
                    <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Approach to ambiguous challenges and logic.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Overall Recommendation</label>
                <Select required value={form.overall} onValueChange={v => setForm({...form, overall: v as string})}>
                  <SelectTrigger><SelectValue placeholder="Select recommendation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong Hire">Strong Hire</SelectItem>
                    <SelectItem value="Hire">Hire</SelectItem>
                    <SelectItem value="Lean Hire">Lean Hire</SelectItem>
                    <SelectItem value="No Hire">No Hire</SelectItem>
                    <SelectItem value="Strong No Hire">Strong No Hire</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Final hiring decision based on your assessment.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              required
              className="min-h-[200px]"
              placeholder="Provide specific examples to justify your ratings. What were their strengths? What were their weaknesses? Would you want to work with this person?"
              value={form.comments}
              onChange={e => setForm({...form, comments: e.target.value})}
            />
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <AlertCircle className="w-4 h-4" /> This feedback will be visible to the hiring manager.
            </div>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <><Send className="w-4 h-4" /> Submit Feedback</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
