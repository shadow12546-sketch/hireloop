"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { aiService } from "@/services/aiService"
import {
  CheckCircle2,
  Eye,
  FileText,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

export default function CandidateResume() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [resume, setResume] = useState<{
    name: string
    date: string
    size: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOC/DOCX file.")
      e.target.value = ""
      return
    }

    // Validate file size: 5 MB
    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      alert("Resume size must be less than 5 MB.")
      e.target.value = ""
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          return 85
        }

        return prev + 10
      })
    }, 500)

    try {
      const parsedData = await aiService.parseResume(file)

      clearInterval(interval)
      setUploadProgress(100)

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "parsed_resume_data",
          JSON.stringify(parsedData)
        )
      }

      setResume({
        name: file.name,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      })

      setTimeout(() => {
        router.push(
          "/candidate/profile?action=review_parsed_resume"
        )
      }, 1000)
    } catch (error) {
      clearInterval(interval)

      console.error("Resume parsing failed:", error)

      setIsUploading(false)
      setUploadProgress(0)

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload and parse resume. Please try again."
      )
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = () => {
    if (!resume) {
      return
    }

    if (confirm("Are you sure you want to delete your resume?")) {
      setResume(null)
    }
  }

  const handlePreview = () => {
    alert(
      "Resume preview will be available after the resume is stored in the backend."
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Resume Manager
        </h1>

        <p className="text-muted-foreground mt-1">
          Upload and manage your resume for applications and AI matching.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Resume</CardTitle>

          <CardDescription>
            This resume will be used for AI parsing and quick apply.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {resume ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="font-semibold text-sm">
                    {resume.name}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>
                      Uploaded: {resume.date}
                    </span>

                    <span>•</span>

                    <span>{resume.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-2"
                  onClick={handlePreview}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-2 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No resume uploaded.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Resume</CardTitle>

          <CardDescription>
            Upload a new PDF or DOCX file. Max size 5MB.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isUploading ? (
            <label
              htmlFor="resume-upload"
              className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer block"
            >
              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
              />

              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-medium mb-1">
                Click to upload or drag and drop
              </h3>

              <p className="text-muted-foreground">
                Supported formats: PDF, DOC, DOCX
              </p>

              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 5 MB
              </p>
            </label>
          ) : (
            <div className="border rounded-xl p-12 text-center bg-muted/10">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />

              <h3 className="text-lg font-medium mb-2">
                Processing Resume...
              </h3>

              <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {uploadProgress}% Complete
              </p>

              <p className="text-xs text-muted-foreground mt-4">
                Running AI extraction and parsing...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {resume && !isUploading && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <h4 className="font-semibold text-sm mb-1">
              AI Parsing Successful
            </h4>

            <p className="text-sm opacity-90">
              Your resume has been successfully parsed. We&apos;ve
              updated your profile skills and experience section based
              on the contents.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
