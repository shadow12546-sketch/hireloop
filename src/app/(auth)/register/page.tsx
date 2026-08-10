"use client"

import Link from "next/link"
import { useState, Suspense, useMemo, useRef, DragEvent, ChangeEvent } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, User, Briefcase, AlertCircle, UploadCloud, File as FileIcon, X, CheckCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { authService } from "@/services/authService"

const ROLES = [
  { value: "candidate", label: "Candidate", description: "Find jobs, apply to opportunities, and manage your applications.", icon: User },
  { value: "employer", label: "Employer", description: "Post jobs, find candidates, and manage your hiring process.", icon: Briefcase },
]

interface UploadedFile {
  file: File;
  progress: number;
  error?: string;
}

function DocumentUpload({ 
  onUploadChange 
}: { 
  onUploadChange: (file: File | null) => void 
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const simulateUpload = (file: File) => {
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadedFile({ file, progress: 0, error: "File too large. Maximum size is 5MB." })
      onUploadChange(null)
      return
    }

    setUploadedFile({ file, progress: 0 })
    onUploadChange(null)

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress <= 100) {
        setUploadedFile((prev) => prev ? { ...prev, progress } : null)
      } else {
        clearInterval(interval)
        onUploadChange(file)
      }
    }, 150)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    onUploadChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3 mt-6 border-t border-border/40 pt-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Organization Verification Document</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Upload a document that helps verify your organization. (PDF, JPG, PNG)
        </p>
      </div>

      {!uploadedFile ? (
        <div
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleChange}
          />
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1 text-center">
            Drag & drop or <button type="button" onClick={() => inputRef.current?.click()} className="text-primary hover:underline font-semibold focus:outline-none">browse files</button>
          </p>
          <p className="text-xs text-muted-foreground text-center">Maximum file size: 5MB</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 border border-border/60 rounded-xl bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <FileIcon className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button type="button" onClick={removeFile} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none">
              <X className="h-4 w-4" />
            </button>
          </div>

          {uploadedFile.error ? (
            <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{uploadedFile.error}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className={uploadedFile.progress === 100 ? "text-primary" : "text-muted-foreground"}>
                  {uploadedFile.progress === 100 ? "Upload complete" : "Uploading..."}
                </span>
                <span className="text-muted-foreground">{uploadedFile.progress}%</span>
              </div>
              <Progress value={uploadedFile.progress} className="h-1.5" />
            </div>
          )}
        </div>
      )}
      
      <p className="text-[0.75rem] text-muted-foreground flex items-start gap-1.5 leading-relaxed mt-2 bg-muted/30 p-2.5 rounded-lg border border-border/50">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
        Your verification information is used only for employer verification and platform safety.
      </p>
    </div>
  )
}

function RegisterForm() {
  const params = useSearchParams()
  const defaultRole = (params.get("role") === "employer" || params.get("role") === "candidate") ? params.get("role") as string : "candidate"

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [role, setRole] = useState(defaultRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Employer fields
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [designation, setDesignation] = useState("")
  const [document, setDocument] = useState<File | null>(null)

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500"]

  const isFormValid = () => {
    if (!name || !email || !password) return false;
    if (role === "employer") {
      if (!companyName || !designation) return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (role === "employer" && !document) {
      setError("Please upload a supported verification document.")
      setLoading(false)
      return
    }

    try {
      await authService.register({
        name,
        email,
        password,
        role,
        companyName: role === "employer" ? companyName : undefined,
        designation: role === "employer" ? designation : undefined,
      })

      setIsSuccess(true)
      
      if (role === "candidate") {
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      }
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    if (role === "candidate") {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-4 py-12 text-center animate-in fade-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Account created successfully!</h2>
          <p className="text-muted-foreground">Redirecting you to the candidate portal...</p>
        </div>
      )
    } else {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-4 py-8 text-center animate-in fade-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Registration Successful</h2>
          <p className="text-muted-foreground max-w-sm mb-2">
            Your employer account has been verified successfully. You can now sign in and access your employer dashboard.
          </p>
          <div className="flex items-center justify-center w-full mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              ✓ Verified
            </div>
          </div>
          <Button onClick={() => window.location.href = "/login"} className="w-full h-11 gradient-violet border-none text-white font-bold hover:opacity-90">
            Continue to Login
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="text-[0.95rem] text-muted-foreground mt-1.5">
          How do you want to use the platform?
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 animate-in fade-in zoom-in-95">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Role Selection */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((r) => {
            const isSelected = role === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRole(r.value)
                  setError("")
                }}
                className={`relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border/60 bg-transparent hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <r.icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {r.label}
                    </span>
                  </div>
                  {isSelected && <CheckCircle className="h-4 w-4 text-primary animate-in zoom-in" />}
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {r.description}
                </span>
              </button>
            )
          })}
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Full name
            </label>
            <Input 
              id="name" 
              name="name" 
              type="text" 
              placeholder="e.g. Sachin Verma" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg bg-background"
              required 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-baseline justify-between">
              {role === "employer" ? "Work email" : "Email address"}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={role === "employer" ? "you@company.com" : "you@example.com"}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg bg-background"
              required
            />
            {role === "employer" && (
              <p className="text-[0.8rem] text-muted-foreground/80 mt-1.5">Use your organization email where possible.</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg pr-10 bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex gap-1 h-1.5 w-full">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                        passwordStrength >= level ? strengthColors[passwordStrength - 1] : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${passwordStrength > 0 ? "text-muted-foreground" : "text-transparent"}`}>
                  Strength: <span className={passwordStrength > 0 ? "text-foreground" : ""}>{strengthLabels[Math.max(0, passwordStrength - 1)]}</span>
                </p>
              </div>
            )}
          </div>

          {/* Employer Specific Fields */}
          {role === "employer" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 pt-2">
              <div className="space-y-4 mt-2 border-t border-border/40 pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">Organization Information</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm font-semibold text-foreground">
                      Company / Organization Name
                    </label>
                    <Input 
                      id="companyName" 
                      name="companyName" 
                      type="text" 
                      placeholder="e.g. Acme Corp" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-11 rounded-lg bg-background"
                      required={role === "employer"}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="designation" className="text-sm font-semibold text-foreground">
                        Your Designation
                      </label>
                      <Input 
                        id="designation" 
                        name="designation" 
                        type="text" 
                        placeholder="e.g. HR Manager, Founder" 
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="h-11 rounded-lg bg-background"
                        required={role === "employer"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="companyWebsite" className="text-sm font-semibold text-foreground">
                        Company Website <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <Input 
                        id="companyWebsite" 
                        name="companyWebsite" 
                        type="url" 
                        placeholder="https://acme.com" 
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="h-11 rounded-lg bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DocumentUpload onUploadChange={setDocument} />
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-[0.95rem] font-bold rounded-lg mt-4 transition-all active:scale-[0.98]" 
          disabled={loading || !isFormValid()}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Submitting..." : (role === "employer" ? "Submit Registration" : "Create Account")}
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-semibold">Or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-11 rounded-lg gap-2.5 font-medium border-border/60 hover:bg-muted/50" type="button">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-[0.9rem] text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-6 w-full">
        <div className="space-y-2">
          <div className="h-8 rounded bg-muted w-2/3" />
          <div className="h-4 rounded bg-muted w-1/3" />
        </div>
        <div className="h-[200px] rounded-xl bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
