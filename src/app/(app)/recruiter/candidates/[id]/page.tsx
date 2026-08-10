"use client"
import { candidateService } from "@/services/candidateService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, UserCircle, Download, FileText, Calendar, CheckCircle2, MessageSquare, Award, AlertCircle } from "lucide-react"

export default function CandidateProfileView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        <Button variant="link" render={<Link href="/recruiter/candidates" />} className="mt-4">
          Back to Candidates
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/recruiter/candidates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Database
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
        
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="text-sm py-1 bg-primary/5 text-primary border-primary/20">
            Status: {candidate.status}
          </Badge>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" render={<Link href="/recruiter/offers" />}>
              <Award className="w-4 h-4" /> Extend Offer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Candidate Analysis</CardTitle>
                      <CardDescription>Powered by AI resume parsing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 p-4 bg-background rounded-xl border">
                    <div className="w-20 h-20 shrink-0 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 border-4 border-primary rounded-full" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${100 - candidate.matchScore}%, 0 ${100 - candidate.matchScore}%)`, transform: 'rotate(-90deg)' }} />
                      <span className="text-2xl font-bold text-primary">{candidate.matchScore}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Strong Match</h4>
                      <p className="text-sm text-muted-foreground">This candidate strongly aligns with the core requirements of the job description. They have the required experience level and technical foundation.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-semibold text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Key Strengths
                      </h5>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                        <li>Extensive experience in the required tech stack</li>
                        <li>Demonstrated leadership in previous roles</li>
                        <li>Relevant industry background</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-semibold text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Potential Gaps
                      </h5>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                        <li>Slightly under expected years of management experience</li>
                        <li>Missing specific certification mentioned as 'nice to have'</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg text-sm border border-primary/20">
                    <strong>AI Recommendation:</strong> Move forward to technical screening. Focus interview questions on their management experience to gauge readiness for team leadership.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Candidate has {candidate.experience} of experience relevant to the role. 
                    Detailed extraction is available in the Resume tab.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>Uploaded Resume</CardTitle>
                    <CardDescription>Submitted on {new Date(candidate.appliedDate).toLocaleDateString()}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/20 border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>Resume viewer simulation</p>
                    <p className="text-sm mt-2">In production, a PDF renderer would be embedded here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluations" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <div>
                        <h4 className="font-semibold">React Fundamentals</h4>
                        <p className="text-sm text-muted-foreground">Completed on Aug 5, 2026</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">90/100</p>
                      <p className="text-xs text-muted-foreground">Top 10%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Technical Round 1</h4>
                      <Badge variant="outline">Passed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      "Extremely strong fundamentals. Communicated complex architectural decisions clearly. Highly recommended."
                    </p>
                    <p className="text-xs font-medium text-right">— Sarah (Design Lead)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">contact@candidate.com</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">+1 234 567 890</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">San Francisco, CA</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{candidate.experience}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" render={<Link href="/recruiter/interviews" />}>
                <Calendar className="w-4 h-4" /> Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" render={<Link href="/recruiter/assessments" />}>
                <FileText className="w-4 h-4" /> Assign Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
