"use client"

import { useState, useEffect, use, useRef, DragEvent, ChangeEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { applicationService } from "@/services/applicationService"
import { candidateService } from "@/services/candidateService"
import { apiClient } from "@/lib/apiClient"

import { ChevronLeft, UploadCloud, FileText, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react"

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    coverLetter: "",
  })

  // Resume state
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [selectedResumeName, setSelectedResumeName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [isDragActive, setIsDragActive] = useState(false)

  const [applyError, setApplyError] = useState("")

  // Load candidate profile on mount to pre-fill info and existing active resume
  useEffect(() => {
    async function loadCandidateProfile() {
      try {
        const res: any = await candidateService.getProfile()
        const profile = res?.data?.profile || res?.profile || res || {}
        const user = profile.user || {}

        const nameParts = (user.name || "").split(" ")
        const fName = profile.firstName || nameParts[0] || ""
        const lName = profile.lastName || nameParts.slice(1).join(" ") || ""

        setForm((prev) => ({
          ...prev,
          firstName: fName,
          lastName: lName,
          email: user.email || profile.email || "",
          phone: profile.phone || "",
        }))

        // Pre-select active resume if available
        if (profile.activeResume) {
          const activeRes = profile.activeResume
          const resId = activeRes._id || activeRes.id || activeRes
          const resName = activeRes.originalFilename || "My_Uploaded_Resume.pdf"
          if (resId) {
            setSelectedResumeId(resId)
            setSelectedResumeName(resName)
          }
        }
      } catch {
        // Fallback silently if profile is empty or unauthorized
      }
    }
    loadCandidateProfile()
  }, [])

  // File upload handler
  const processFileUpload = async (file: File) => {
    setUploadError("")
    // 1. Type validation
    const allowedExtensions = [".pdf", ".doc", ".docx"]
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    const ext = "." + file.name.split(".").pop()?.toLowerCase()

    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setUploadError("Please upload a valid PDF, DOC, or DOCX document.")
      return
    }

    // 2. Max size 5MB
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("Resume file size must be 5MB or less.")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const response = await apiClient.post<any>("/resumes/upload", formData)
      const resumeObj = response?.data?.resume || response?.resume || response?.data || response || {}
      const uploadedId = resumeObj.id || resumeObj._id

      if (!uploadedId) {
        throw new Error("Server did not return a valid resume ID.")
      }

      setSelectedResumeId(uploadedId)
      setSelectedResumeName(resumeObj.originalFilename || file.name)
    } catch (err: any) {
      console.error("Resume upload failed:", err)
      setUploadError(err?.message || "Failed to upload resume. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0])
    }
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleRemoveResume = () => {
    setSelectedResumeId("")
    setSelectedResumeName("")
    setUploadError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleStep2Next = () => {
    setUploadError("")
    if (!selectedResumeId) {
      setUploadError("Please upload or select a resume before continuing.")
      return
    }
    setStep(3)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setApplyError("")
    try {
      await applicationService.applyForJob(resolvedParams.id, selectedResumeId || undefined)
      setIsSuccess(true)
    } catch (err: any) {
      setApplyError(err?.message || "Failed to submit application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for applying. The hiring team will review your application and get back to you shortly.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" render={<Link href="/candidate/applications" />}>View Applications</Button>
          <Button render={<Link href="/candidate/jobs" />}>Find More Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <Link href={`/candidate/jobs/${resolvedParams.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Job
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply for this role</h1>
        <div className="flex gap-2 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-right">Step {step} of 3</p>
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Review and update your contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">First Name</label>
                  <Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="First name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Last Name</label>
                  <Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Last name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={() => setStep(2)}>Next Step</Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Resume & Cover Letter</CardTitle>
              <CardDescription>Upload your resume document (PDF or DOCX up to 5MB).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload Dropzone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : selectedResumeId
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-border hover:border-primary/50 bg-muted/30"
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Uploading & Processing Resume...</p>
                  </div>
                ) : selectedResumeId ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Resume Selected</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Click box or drop new file to replace</p>
                    </div>
                    <div className="mt-2 p-3 bg-background border rounded-lg flex items-center gap-3 w-fit">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-sm font-semibold truncate max-w-[260px]">{selectedResumeName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveResume()
                        }}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors ml-2"
                        title="Remove resume"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Click to upload or drag and drop</h3>
                      <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Cover Letter (Optional)</label>
                <Textarea 
                  placeholder="Introduce yourself and explain why you're a great fit..." 
                  className="min-h-[140px]"
                  value={form.coverLetter}
                  onChange={e => setForm({...form, coverLetter: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleStep2Next}>Review Application</Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review Application</CardTitle>
              <CardDescription>Please review your details before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{form.firstName} {form.lastName}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{form.email}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{form.phone || "Not specified"}</span>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Documents</h4>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-blue-500" /> {selectedResumeName || "No resume uploaded"}
                </div>
                {form.coverLetter && (
                  <div className="text-sm pt-2 border-t mt-2">
                    <span className="text-muted-foreground block mb-1">Cover Letter Included:</span>
                    <p className="line-clamp-2 italic">"{form.coverLetter}"</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 items-stretch">
              {applyError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>Back</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="min-w-[150px]">
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
