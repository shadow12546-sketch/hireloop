"use client"
import { candidateService } from "@/services/candidateService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ChevronLeft, Download, FileText, CheckCircle2, MessageSquare, AlertCircle,
  Loader2, Lock, FileDown, User, Package, Brain, ThumbsUp, XCircle, Clock, Award
} from "lucide-react"
import { aiService } from "@/services/aiService"

const ALLOWED_DOWNLOAD_STATUSES = ["Shortlisted", "Assessment", "Interview", "Offer", "Hired"]
const DECISION_STATUSES = ["Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]

/** Derive the AI workflow stage statuses from the candidate's current status */
function getWorkflowStages(status: string) {
  const order = ["Applied", "Screening", "AI Pre-Screening", "Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]
  const idx = order.indexOf(status)
  return [
    { key: "resume",    label: "AI Resume Screening",  done: idx >= 2 },
    { key: "assess",    label: "AI Assessment",         done: idx >= 4 },
    { key: "interview", label: "AI Interview",           done: idx >= 5 },
    { key: "eval",      label: "AI Evaluation",          done: idx >= 5 },
    { key: "decision",  label: "Employer Decision",      done: idx >= 6 || status === "Rejected" },
  ]
}

export default function CandidateProfileView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [candidate, setCandidate] = useState<any>(null)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [matchError, setMatchError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingProfile, setDownloadingProfile] = useState(false)
  const [downloadingPackage, setDownloadingPackage] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  // Select / Reject decision state
  const [showSelectDialog, setShowSelectDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [decisionMade, setDecisionMade] = useState<"Selected" | "Rejected" | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await candidateService.getCandidateById(resolvedParams.id)
        setCandidate(data)
      } finally {
        setLoading(false)
      }
      
      try {
        const matchData = await aiService.getMatchScore(resolvedParams.id)
        setMatchDetails(matchData)
      } catch (err) {
        setMatchError(true)
      }
    }
    load()
  }, [resolvedParams.id])

  const canDownload = candidate ? ALLOWED_DOWNLOAD_STATUSES.includes(candidate.status) : false
  const canDecide   = candidate ? DECISION_STATUSES.includes(candidate.status) : false
  const alreadyDecided = decisionMade || (candidate?.status === "Hired") || (candidate?.status === "Rejected")

  async function handleSelect() {
    setDeciding(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      setDecisionMade("Selected")
      setCandidate((prev: any) => ({ ...prev, status: "Hired" }))
    } finally {
      setDeciding(false)
      setShowSelectDialog(false)
    }
  }

  async function handleReject() {
    setDeciding(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      setDecisionMade("Rejected")
      setCandidate((prev: any) => ({ ...prev, status: "Rejected" }))
    } finally {
      setDeciding(false)
      setShowRejectDialog(false)
    }
  }

  async function handleDownloadResume() {
    if (downloadingResume) return
    setDownloadError(null)
    setDownloadingResume(true)
    try {
      await candidateService.downloadResume(resolvedParams.id, candidate.name)
    } catch {
      setDownloadError("Unable to download the resume. Please try again.")
    } finally {
      setDownloadingResume(false)
    }
  }


  async function handleDownloadProfile() {
    if (downloadingProfile) return
    setDownloadError(null)
    setDownloadingProfile(true)
    try {
      await candidateService.downloadCandidateProfile(resolvedParams.id, candidate)
    } catch {
      setDownloadError("Unable to download the candidate profile. Please try again.")
    } finally {
      setDownloadingProfile(false)
    }
  }

  async function handleDownloadPackage() {
    if (downloadingPackage) return
    setDownloadError(null)
    setDownloadingPackage(true)
    try {
      await candidateService.downloadCandidatePackage(resolvedParams.id, candidate.name)
    } catch {
      setDownloadError("Unable to download the candidate package. Please try again.")
    } finally {
      setDownloadingPackage(false)
    }
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
        <Button variant="link" render={<Link href="/recruiter/candidates" />} className="mt-4">
          Back to Candidates
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Link href="/recruiter/candidates" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Candidates
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full gradient-violet text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
              {candidate.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{candidate.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{candidate.role}</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <Badge variant="secondary" className="font-medium bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {candidate.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button variant="outline" className="flex-1 md:flex-none gap-2 shadow-sm">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
            {canDownload ? (
              <Button
                variant="outline"
                className="flex-1 md:flex-none gap-2 shadow-sm border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                onClick={() => { setDownloadError(null); setShowDownloadModal(true) }}
              >
                <Download className="w-4 h-4" /> Download Data
              </Button>
            ) : (
              <Button variant="outline" disabled title="Available after candidate is shortlisted"
                className="flex-1 md:flex-none gap-2 shadow-sm opacity-50 cursor-not-allowed">
                <Lock className="w-3.5 h-3.5" /> Download Data
              </Button>
            )}
            {alreadyDecided ? (
              <Badge
                variant="secondary"
                className={`px-4 py-2 text-sm font-semibold ${
                  decisionMade === "Selected" || candidate?.status === "Hired"
                    ? "bg-green-500/15 text-green-700 dark:text-green-400"
                    : "bg-red-500/15 text-red-700 dark:text-red-400"
                }`}
              >
                {decisionMade === "Selected" || candidate?.status === "Hired" ? "✓ Selected" : "✗ Rejected"}
              </Badge>
            ) : (
              <>
                <Button
                  className="flex-1 md:flex-none gap-2 shadow-sm bg-green-600 hover:bg-green-700 text-white"
                  disabled={!canDecide}
                  onClick={() => setShowSelectDialog(true)}
                >
                  <ThumbsUp className="w-4 h-4" /> Select Candidate
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none gap-2 shadow-sm border-red-300 text-red-600 hover:bg-red-500/5 hover:border-red-400"
                  disabled={!canDecide}
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="profile" className="flex flex-col w-full">
            <TabsList className="flex w-full justify-start gap-8 border-b border-border/60 bg-transparent p-0 rounded-none h-auto overflow-x-auto overflow-y-hidden scrollbar-none">
              <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:text-foreground">Profile</TabsTrigger>
              <TabsTrigger value="resume" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:text-foreground">Resume</TabsTrigger>
              <TabsTrigger value="evaluations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:text-foreground">Evaluations</TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:text-foreground">Feedback</TabsTrigger>
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
                <CardContent className="space-y-8">
                  {matchError ? (
                    <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 bg-red-500/5 rounded-xl border border-red-500/10 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-8 h-8" />
                      <div>
                        <h4 className="font-semibold">AI temporarily unavailable</h4>
                        <p className="text-sm opacity-90 mt-1">Please retry loading the candidate match details.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 text-foreground">Retry</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8 p-6 bg-background rounded-xl border">
                        <div className="flex flex-col items-center justify-center space-y-3 shrink-0">
                          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 border-4 border-primary rounded-full" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${100 - (matchDetails?.matchScore || candidate.matchScore)}%, 0 ${100 - (matchDetails?.matchScore || candidate.matchScore)}%)`, transform: 'rotate(-90deg)' }} />
                            <span className="text-3xl font-bold text-primary">{matchDetails?.matchScore || candidate.matchScore}%</span>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Match</span>
                        </div>
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-1">
                          {matchDetails?.breakdown ? (
                            <>
                              <div className="space-y-2"><div className="flex justify-between text-sm font-medium"><span>Skills</span><span>{matchDetails.breakdown.skillMatch}%</span></div><Progress value={matchDetails.breakdown.skillMatch} className="h-2" /></div>
                              <div className="space-y-2"><div className="flex justify-between text-sm font-medium"><span>Experience</span><span>{matchDetails.breakdown.experienceMatch}%</span></div><Progress value={matchDetails.breakdown.experienceMatch} className="h-2" /></div>
                              <div className="space-y-2"><div className="flex justify-between text-sm font-medium"><span>Education</span><span>{matchDetails.breakdown.educationMatch}%</span></div><Progress value={matchDetails.breakdown.educationMatch} className="h-2" /></div>
                              <div className="space-y-2"><div className="flex justify-between text-sm font-medium"><span>Projects</span><span>{matchDetails.breakdown.projectMatch}%</span></div><Progress value={matchDetails.breakdown.projectMatch} className="h-2" /></div>
                            </>
                          ) : (
                            <div className="col-span-1 sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing breakdown...</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-3 bg-green-500/5 border border-green-500/10 p-5 rounded-xl">
                          <h5 className="font-semibold text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" /> Key Strengths
                          </h5>
                          {matchDetails?.strengths ? (
                            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4 marker:text-green-500">
                              {matchDetails.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          ) : (
                            <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</div>
                          )}
                        </div>
                        <div className="space-y-3 bg-red-500/5 border border-red-500/10 p-5 rounded-xl">
                          <h5 className="font-semibold text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" /> Missing Skills
                          </h5>
                          {matchDetails?.missingSkills ? (
                            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4 marker:text-red-500">
                              {matchDetails.missingSkills.map((m: string, i: number) => <li key={i}>{m}</li>)}
                            </ul>
                          ) : (
                            <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</div>
                          )}
                        </div>
                        <div className="space-y-3 bg-amber-500/5 border border-amber-500/10 p-5 rounded-xl">
                          <h5 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" /> Potential Gaps
                          </h5>
                          {matchDetails?.weakAreas ? (
                            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4 marker:text-amber-500">
                              {matchDetails.weakAreas.map((w: string, i: number) => <li key={i}>{w}</li>)}
                            </ul>
                          ) : (
                            <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-5 bg-primary/10 rounded-xl text-sm border border-primary/20">
                        <strong className="text-primary block mb-1 text-base">AI Recommendation</strong> 
                        <span className="text-muted-foreground leading-relaxed">
                          {matchDetails?.recommendation || "Loading recommendation..."}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</div>
                      <div className="text-sm font-medium text-foreground">{candidate.email || "contact@candidate.com"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</div>
                      <div className="text-sm font-medium text-foreground">{candidate.phone || "+1 234 567 890"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</div>
                      <div className="text-sm font-medium text-foreground">{candidate.location || "San Francisco, CA"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</div>
                      <div className="text-sm font-medium text-foreground">{candidate.experience}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</div>
                      <div className="text-sm font-medium text-foreground">{candidate.skills ? candidate.skills.join(", ") : "React, TypeScript, Next.js, Node.js"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Education</div>
                      <div className="text-sm font-medium text-foreground">{candidate.education || "B.S. Computer Science"}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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

        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          {/* Quick Details */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center border-b border-border/50 pb-2.5">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{candidate.email || "contact@candidate.com"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2.5">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{candidate.phone || "+1 234 567 890"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2.5">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{candidate.location || "San Francisco, CA"}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{candidate.experience}</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Recruitment Workflow Status */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">AI Recruitment Process</CardTitle>
              </div>
              <CardDescription className="text-xs">Automated evaluation by HireLoop AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {getWorkflowStages(candidate.status).map((stage, i) => (
                <div key={stage.key} className="flex items-center gap-3">
                  {stage.key === "decision" ? (
                    stage.done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                    )
                  ) : stage.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={`text-sm ${
                    stage.done ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>{stage.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Employer Final Decision */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Employer Decision</CardTitle>
              <CardDescription className="text-xs">
                AI recommendation:{" "}
                <span className="font-semibold text-foreground">
                  {matchDetails?.recommendation ? "Strong Candidate" : "Pending evaluation"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alreadyDecided ? (
                <div className={`text-center py-3 px-4 rounded-xl font-semibold text-sm ${
                  decisionMade === "Selected" || candidate.status === "Hired"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}>
                  {decisionMade === "Selected" || candidate.status === "Hired"
                    ? "✓ Candidate Selected"
                    : "✗ Candidate Rejected"}
                </div>
              ) : (
                <>
                  <Button
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    disabled={!canDecide}
                    onClick={() => setShowSelectDialog(true)}
                  >
                    <ThumbsUp className="w-4 h-4" /> Select Candidate
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-red-300 text-red-600 hover:bg-red-500/5 hover:border-red-400 shadow-sm"
                    disabled={!canDecide}
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4" /> Reject Candidate
                  </Button>
                  {!canDecide && (
                    <p className="text-xs text-muted-foreground text-center">
                      Available after AI evaluation is complete.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ SELECT CANDIDATE CONFIRMATION ============ */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              Select Candidate?
            </DialogTitle>
            <DialogDescription>
              You are about to select{" "}
              <span className="font-semibold text-foreground">{candidate.name}</span>{" "}
              for the position of{" "}
              <span className="font-semibold text-foreground">{candidate.role}</span>.
              This will move them to <strong>Hired</strong> status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSelectDialog(false)} disabled={deciding}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={handleSelect}
              disabled={deciding}
            >
              {deciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              {deciding ? "Selecting..." : "Confirm Selection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ REJECT CANDIDATE CONFIRMATION ============ */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              Reject Candidate?
            </DialogTitle>
            <DialogDescription>
              This candidate will be marked as <strong>Rejected</strong>.{" "}
              <span className="font-semibold text-foreground">{candidate.name}</span>{" "}
              will no longer be considered for this position.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={deciding}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-500/5 gap-2"
              onClick={handleReject}
              disabled={deciding}
            >
              {deciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {deciding ? "Rejecting..." : "Reject Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DOWNLOAD CANDIDATE DATA MODAL ============ */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="w-4 h-4 text-primary" />
              </div>
              Download Candidate Data
            </DialogTitle>
            <DialogDescription>
              Download documents and profile information for{" "}
              <span className="font-medium text-foreground">{candidate.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* Error Alert */}
            {downloadError && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{downloadError}</p>
                  <button
                    className="underline underline-offset-2 text-xs mt-1 hover:no-underline"
                    onClick={() => setDownloadError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Resume */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Resume</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF/DOCX submitted by candidate</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0 ml-3"
                disabled={downloadingResume || downloadingPackage}
                onClick={handleDownloadResume}
              >
                {downloadingResume ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Download</>
                )}
              </Button>
            </div>

            {/* Candidate Profile */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Candidate Profile</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Personal + professional information</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0 ml-3"
                disabled={downloadingProfile || downloadingPackage}
                onClick={handleDownloadProfile}
              >
                {downloadingProfile ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Download</>
                )}
              </Button>
            </div>

            {/* Uploaded Documents — Empty state */}
            <div className="p-4 border border-border rounded-xl bg-muted/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Uploaded Documents</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Certificates, portfolio, cover letter</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pl-11 italic">No additional documents uploaded.</p>
            </div>

            {/* Complete Package */}
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Complete Package</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Resume + profile + permitted documents</p>
                </div>
              </div>
              <Button
                size="sm"
                className="gap-1.5 shrink-0 ml-3"
                disabled={downloadingPackage || downloadingResume || downloadingProfile}
                onClick={handleDownloadPackage}
              >
                {downloadingPackage ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Packaging...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Download All</>
                )}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
            Downloads are subject to employer authorization. All accesses are logged for compliance.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
