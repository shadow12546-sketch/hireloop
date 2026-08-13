"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      /**
       * FRONTEND STUB: Replace with real authService.forgotPassword(email) call.
       */
      console.log("Reset password for:", email)
      await new Promise((r) => setTimeout(r, 1000))
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we will send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>
    </div>
  )
}
