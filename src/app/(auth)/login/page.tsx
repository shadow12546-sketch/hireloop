"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/authService"

export default function LoginPage() {
  const [role, setRole] = useState<"candidate" | "employer">("candidate")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const form = e.currentTarget
    const email = form.email.value
    const password = form.password.value

    setError("")
    setLoading(true)
    try {
      // In mock mode: if this email has no stored role yet (registered before the fix),
      // save the UI-selected role now so it's picked up by the login mock.
      const existingStored = typeof window !== "undefined"
        ? localStorage.getItem(`mock_user_role_${email}`)
        : null
      if (!existingStored && typeof window !== "undefined") {
        const inferredRole = role === "employer" ? "Employer" : "Candidate"
        localStorage.setItem(`mock_user_role_${email}`, inferredRole)
      }

      const response = await authService.login({ email, password })
      const isActualEmployer = response.user?.role === "Recruiter" || response.user?.role === "Employer" || email.includes("@company.com");
      
      if (role === "employer" && !isActualEmployer) {
        setError("This account is registered as a Candidate. Please select Candidate to continue.")
        setLoading(false)
        return
      }

      if (role === "candidate" && isActualEmployer) {
        setError("This account is registered as an Employer. Please select Employer to continue.")
        setLoading(false)
        return
      }

      if (isActualEmployer) {
        router.push("/recruiter")
      } else {
        router.push("/candidate")
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError("")
    setLoading(true)
    try {
      // Mocking Google login with authService for now
      const response = await authService.login({ email: "google@mock.com", password: "mock" })
      const isActualEmployer = response.user?.role === "Recruiter" || response.user?.role === "Employer";

      if (role === "employer" && !isActualEmployer) {
        setError("This account is registered as a Candidate. Please select Candidate to continue.")
        setLoading(false)
        return
      }

      if (role === "candidate" && isActualEmployer) {
        setError("This account is registered as an Employer. Please select Employer to continue.")
        setLoading(false)
        return
      }

      if (isActualEmployer) {
        router.push("/recruiter")
      } else {
        router.push("/candidate")
      }
    } catch {
      setError("Google login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Welcome back 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to continue to HireLoop
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-3">
          <label className="text-sm font-semibold">Sign in as</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`h-11 rounded-xl text-sm font-bold border transition-colors ${
                role === "candidate"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`h-11 rounded-xl text-sm font-bold border transition-colors ${
                role === "employer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              Employer
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold">Email address</label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required className="h-11 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot?</Link>
          </div>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" required className="h-11 rounded-xl pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 rounded-xl gradient-violet border-none text-white font-bold text-sm hover:opacity-90" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or continue with</span></div>
      </div>

      <Button variant="outline" className="w-full h-11 rounded-xl gap-2 font-semibold" type="button" onClick={handleGoogleLogin} disabled={loading}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to HireLoop?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">Create account</Link>
      </p>
    </div>
  )
}
