"use client"

import { useEffect, useState } from "react"
import { employerService, type VerificationStatus } from "@/services/employerService"
import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronRight, Building2, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: React.ElementType
  color: string
  bg: string
  border: string
  label: string
  description: string
}> = {
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "Pending Verification",
    description: "Your verification request has been submitted and is under review. We'll notify you once the review is complete.",
  },
  verified: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Verification Approved",
    description: "Your organization has been verified. You now have full access to employer features.",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Verification Rejected",
    description: "We were unable to verify your organization with the provided information. Please review the feedback and resubmit.",
  },
  needs_more_info: {
    icon: AlertCircle,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "Additional Information Required",
    description: "Our team needs more information to complete verification. Please provide the requested details.",
  },
}

export default function EmployerVerificationPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employerService.getVerificationStatus().then((res) => {
      setStatus(res.status)
      setMessage(res.message ?? null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!status) return null

  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex p-4 rounded-2xl ${config.bg} ${config.border} border mb-2`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{config.label}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          {message ?? config.description}
        </p>
      </div>

      {/* Status card */}
      <Card className={`border ${config.border}`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Verification Status</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
            {[
              { step: "Registration submitted", done: true },
              { step: "Document received", done: status !== "pending" },
              { step: "Under admin review", done: status === "verified" || status === "rejected" || status === "needs_more_info" },
              { step: "Verification complete", done: status === "verified" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-primary text-primary-foreground" : "border-2 border-border"}`}>
                  {s.done && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span className={`text-sm ${s.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What happens next */}
      {status === "pending" && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Our team will review your organization documents.",
                "Verification typically takes 1–2 business days.",
                "You will receive an email notification once the review is complete.",
                "After verification, you can start posting jobs and accessing all employer features.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {status === "verified" && (
          <Button className="w-full h-11" render={<Link href="/recruiter" />}>Go to Employer Dashboard</Button>
        )}
        {status === "needs_more_info" && (
          <Button className="w-full h-11" render={<Link href="/recruiter/verification/update" />}>Provide Additional Information</Button>
        )}
        {status === "rejected" && (
          <Button className="w-full h-11" render={<Link href="/register?role=employer" />}>Re-apply for Verification</Button>
        )}
        <a href="mailto:support@devfusion.io" className="w-full">
          <Button variant="outline" className="w-full h-10 gap-2">
            <Mail className="h-4 w-4" /> Contact Support
          </Button>
        </a>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Your verification information is used only for employer verification and platform safety.
      </p>
    </div>
  )
}
