"use client"

import { useState, useEffect, use, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Code2, ArrowLeft } from "lucide-react"
import { assessmentService } from "@/services/assessmentService"

export default function TakeAssessment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const attemptId = resolvedParams.id
  const router = useRouter()

  const [attempt, setAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Load Assessment Attempt from backend
  const loadAttempt = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await assessmentService.getAssessmentById(attemptId)
      if (!data) {
        setLoadError("Assessment attempt not found.")
        return
      }
      setAttempt(data)

      // Initialize answers from existing responses if present
      if (Array.isArray(data.responses) && data.responses.length > 0) {
        const initialAnswers: Record<string, string> = {}
        data.responses.forEach((r: any) => {
          if (r.questionId) {
            initialAnswers[r.questionId] = r.answer || ""
          }
        })
        setAnswers(initialAnswers)
      }
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load assessment. Please verify your connection.")
    } finally {
      setLoading(false)
    }
  }, [attemptId])

  useEffect(() => {
    loadAttempt()
  }, [loadAttempt])

  // Timer logic based on startedAt + durationMinutes
  useEffect(() => {
    if (!attempt || (attempt.status || "").toUpperCase() !== "IN_PROGRESS") {
      setTimeLeft(null)
      return
    }

    const durationMinutes = attempt.assessment?.durationMinutes || 60
    const durationMs = durationMinutes * 60 * 1000
    const startedTime = attempt.startedAt ? new Date(attempt.startedAt).getTime() : Date.now()
    const endTime = startedTime + durationMs

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && !submitting && (attempt.status || "").toUpperCase() === "IN_PROGRESS") {
        handleAutoSubmit()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [attempt])

  const handleStart = async () => {
    try {
      setStarting(true)
      setStartError(null)
      const updatedAttempt = await assessmentService.startAssessment(attemptId)
      setAttempt(updatedAttempt)
    } catch (err: any) {
      setStartError(err?.message || "Failed to start assessment. Please try again.")
    } finally {
      setStarting(false)
    }
  }

  const handleSubmit = async () => {
    if (!attempt) return
    try {
      setSubmitting(true)
      setSubmitError(null)
      const questions = attempt.assessment?.questions || []
      const responsePayload = questions.map((q: any) => {
        const qId = q._id || q.id
        return {
          questionId: qId,
          answer: answers[qId] || "",
        }
      })

      const updatedAttempt = await assessmentService.submitAssessment(attemptId, {
        responses: responsePayload,
      })
      setAttempt(updatedAttempt)
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit assessment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    await handleSubmit()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading assessment...</p>
      </div>
    )
  }

  // Error state
  if (loadError || !attempt) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Failed to Load Assessment</h1>
        <p className="text-muted-foreground">{loadError || "Assessment not found or access denied."}</p>
        <Button render={<Link href="/candidate/assessments" />}>Back to Assessments</Button>
      </div>
    )
  }

  const assessment = attempt.assessment || {}
  const questions = assessment.questions || []
  const status = (attempt.status || "").toUpperCase()

  // Submitted / Evaluated State
  if (status === "SUBMITTED" || status === "EVALUATED") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-in zoom-in duration-500 space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold">Assessment Submitted!</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your answers have been securely recorded. The evaluation results are saved below.
        </p>

        {attempt.score !== undefined && attempt.maxScore !== undefined && (
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl max-w-sm mx-auto">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Your Score</p>
            <p className="text-4xl font-black text-primary">
              {attempt.score} <span className="text-xl font-normal text-muted-foreground">/ {attempt.maxScore}</span>
            </p>
          </div>
        )}

        <div className="pt-4">
          <Button render={<Link href="/candidate/assessments" />}>Return to Assessments</Button>
        </div>
      </div>
    )
  }

  // Expired State
  if (status === "EXPIRED") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Assessment Expired</h1>
        <p className="text-muted-foreground">The deadline to complete this assessment has passed.</p>
        <Button render={<Link href="/candidate/assessments" />} variant="outline">
          Back to Assessments
        </Button>
      </div>
    )
  }

  // Assigned / Instructions State
  if (status === "ASSIGNED") {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <Link href="/candidate/assessments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
        </Link>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <Badge variant="outline" className="w-fit mx-auto mb-2 bg-primary/10 text-primary border-primary/20">
              Assigned Assessment
            </Badge>
            <CardTitle className="text-3xl">{assessment.title || "Technical Assessment"}</CardTitle>
            {assessment.description && <p className="text-muted-foreground mt-2">{assessment.description}</p>}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4 py-4 border-y text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time Limit</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> {assessment.durationMinutes || 60} Minutes
                </p>
              </div>
              <div className="border-l">
                <p className="text-sm text-muted-foreground mb-1">Questions</p>
                <p className="text-xl font-bold">{questions.length} Questions</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p>
                  <strong>Important Instructions:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Once you click Start, the assessment status changes to IN_PROGRESS.</li>
                  <li>The timer runs server-calculated from your start time and will auto-submit at 00:00.</li>
                  <li>Refreshing the page will NOT reset your timer.</li>
                </ul>
              </div>
            </div>

            {startError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{startError}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center pb-8">
            <Button size="lg" className="px-12 text-lg" onClick={handleStart} disabled={starting}>
              {starting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Starting...
                </div>
              ) : (
                "Start Assessment Now"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Active / IN_PROGRESS Assessment State
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Sticky Header with Timer */}
      <div className="sticky top-4 z-10 bg-background/95 backdrop-blur border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">{assessment.title || "Technical Assessment"}</h2>
          <p className="text-xs text-muted-foreground">{questions.length} Questions</p>
        </div>
        {timeLeft !== null && (
          <div
            className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${
              timeLeft < 300 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-primary/10 text-primary"
            }`}
          >
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Render Questions */}
      <div className="space-y-6">
        {questions.map((q: any, index: number) => {
          const qId = q._id || q.id
          const qType = q.type || "short_answer"
          const currentAnswer = answers[qId] || ""

          return (
            <Card key={qId} className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-sm">
                      Question {index + 1}
                    </span>
                    <Badge variant="outline" className="text-xs font-normal capitalize">
                      {qType.replace("_", " ")} ({q.points || 1} pt{q.points !== 1 ? "s" : ""})
                    </Badge>
                  </CardTitle>
                </div>
                <p className="text-base leading-relaxed text-foreground mt-2 font-medium">
                  {q.questionText || q.prompt || q.question}
                </p>
              </CardHeader>

              <CardContent className="pt-2">
                {/* MCQ Question */}
                {qType === "MCQ" && (
                  <div className="space-y-2">
                    {Array.isArray(q.options) && q.options.length > 0 ? (
                      q.options.map((option: string, optIdx: number) => {
                        const isSelected = currentAnswer === option
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5 text-primary font-medium"
                                : "hover:border-primary/50 hover:bg-muted/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qId}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => setAnswers({ ...answers, [qId]: option })}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        )
                      })
                    ) : (
                      <Input
                        placeholder="Enter option answer..."
                        value={currentAnswer}
                        onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
                      />
                    )}
                  </div>
                )}

                {/* Short Answer Question */}
                {qType === "short_answer" && (
                  <Textarea
                    placeholder="Write your answer here..."
                    className="min-h-[140px] text-sm"
                    value={currentAnswer}
                    onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
                  />
                )}

                {/* Coding Question */}
                {qType === "coding" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted p-2 rounded-t-md border border-b-0">
                      <Code2 className="w-4 h-4 text-primary" /> Code Solution
                    </div>
                    <Textarea
                      placeholder="// Write code here..."
                      className="min-h-[220px] font-mono text-sm bg-slate-950 text-slate-100 rounded-t-none border-slate-800 focus-visible:ring-slate-700"
                      value={currentAnswer}
                      onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {submitError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit Button Footer */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSubmit} disabled={submitting} className="min-w-[220px] shadow-md">
          {submitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
            </div>
          ) : (
            "Submit Assessment"
          )}
        </Button>
      </div>
    </div>
  )
}
