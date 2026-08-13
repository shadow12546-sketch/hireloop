"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function TakeAssessment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Timer state (mocking 60 mins)
  const [timeLeft, setTimeLeft] = useState(3600)
  
  const [answers, setAnswers] = useState({
    q1: "",
    q2: ""
  })

  useEffect(() => {
    let interval: any
    if (started && !submitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit()
    }
    return () => clearInterval(interval)
  }, [started, submitted, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate submission delay
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Assessment Submitted!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your answers have been securely saved and sent to the hiring team. You will be notified of the results.
        </p>
        <Button render={<Link href="/candidate/assessments" />}>Return to Assessments</Button>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Frontend Technical Assessment</CardTitle>
            <p className="text-muted-foreground mt-2">Acme Corp • Senior React Developer</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex justify-center gap-8 py-4 border-y">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Time Limit</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> 60 Minutes
                </p>
              </div>
              <div className="text-center border-l pl-8">
                <p className="text-sm text-muted-foreground mb-1">Questions</p>
                <p className="text-xl font-bold">2 Technical Tasks</p>
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p><strong>Important Instructions:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Once you start, the timer cannot be paused.</li>
                  <li>Do not refresh the page or you may lose your progress.</li>
                  <li>Ensure you have a stable internet connection.</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center pb-8">
            <Button size="lg" className="px-12 text-lg" onClick={() => setStarted(true)}>
              Start Assessment Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="sticky top-4 z-10 bg-background/95 backdrop-blur border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold">Frontend Technical Assessment</h2>
          <p className="text-xs text-muted-foreground">Acme Corp</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question 1: React Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Explain the differences between `useMemo` and `useCallback`. Provide a realistic scenario where failing to use them would cause a significant performance issue, and how applying them solves it.
          </p>
          <Textarea 
            placeholder="Write your answer here..." 
            className="min-h-[200px] font-mono text-sm"
            value={answers.q1}
            onChange={(e) => setAnswers({...answers, q1: e.target.value})}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question 2: State Management Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            How would you architect the state for a complex e-commerce checkout flow involving multiple steps (cart review, shipping, payment, confirmation) using modern React tools?
          </p>
          <Textarea 
            placeholder="Write your architecture design here..." 
            className="min-h-[200px] font-mono text-sm"
            value={answers.q2}
            onChange={(e) => setAnswers({...answers, q2: e.target.value})}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSubmit} disabled={submitting} className="min-w-[200px]">
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (
            "Submit Assessment"
          )}
        </Button>
      </div>
    </div>
  )
}
