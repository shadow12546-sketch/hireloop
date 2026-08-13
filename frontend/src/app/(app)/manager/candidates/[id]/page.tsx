"use client"
import { candidateService } from "@/services/candidateService"
import { applicationService } from "@/services/applicationService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, CheckCircle2, XCircle, ChevronRight, FileText, Award, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ManagerCandidateReview({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await candidateService.getCandidateById(resolvedParams.id)
        setCandidate(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  const handleDecision = async (action: string) => {
    setSubmitting(true)
    await applicationService.updateApplicationStatus(resolvedParams.id, action, notes)
    setSubmitting(false)
    router.push("/manager")
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Candidate Not Found</h2>
        <Button variant="link" render={<Link href="/manager" />} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/manager" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {candidate.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
              <p className="text-lg text-muted-foreground">{candidate.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="feedback">Interview Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold">{candidate.matchScore}%</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">AI Match Score</h4>
                      <p className="text-sm text-muted-foreground">High alignment with job requirements.</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 bg-green-500/10 text-green-600 rounded-full shrink-0">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Assessment</h4>
                      <p className="text-sm text-muted-foreground">{candidate.assessment.score}/100 • {candidate.assessment.status}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="bg-muted/20 rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground min-h-[500px]">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>Resume Viewer</p>
                    <p className="text-sm mt-2">{candidate.resumeLink}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-6 space-y-4">
              {candidate.feedback.map((fb: any, i: number) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{fb.round} Round</CardTitle>
                        <CardDescription>Interviewer: {fb.interviewer}</CardDescription>
                      </div>
                      <Badge className={fb.rating.includes('Strong') ? 'bg-green-600' : 'bg-primary'}>
                        {fb.rating}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground shrink-0" />
                      <p className="text-sm text-foreground/90 italic">"{fb.comments}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/50 shadow-md">
            <CardHeader>
              <CardTitle>Hiring Decision</CardTitle>
              <CardDescription>Record your final decision for this candidate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Notes (Optional)</label>
                <Textarea 
                  placeholder="Leave a note for the recruiting team..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <div className="p-4 bg-muted/30 border-t space-y-3">
              <Button 
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" 
                disabled={submitting}
                onClick={() => handleDecision('Approve')}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve for Offer
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  disabled={submitting}
                  onClick={() => handleDecision('Next Stage')}
                >
                  <ChevronRight className="w-4 h-4 mr-1" /> Next Stage
                </Button>
                <Button 
                  variant="outline" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={submitting}
                  onClick={() => handleDecision('Reject')}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
