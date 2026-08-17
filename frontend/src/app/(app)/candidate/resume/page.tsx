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
import { candidateService } from "@/services/candidateService"

import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface ResumeState {
  id: string
  name: string
  date: string
  size: string
}

export default function CandidateResume() {
  const router = useRouter()

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const [resume, setResume] =
    useState<ResumeState | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [isUploading, setIsUploading] =
    useState(false)

  const [uploadProgress, setUploadProgress] =
    useState(0)

  const [deleting, setDeleting] =
    useState(false)

  const loadResume = async () => {
    try {
      setLoading(true)

      const response =
        await candidateService.getProfile()

      const profile =
        response?.data?.profile

      const activeResume =
        profile?.activeResume

      if (!activeResume) {
        setResume(null)
        return
      }

      const id =
        activeResume._id ||
        activeResume.id

      if (!id) {
        setResume(null)
        return
      }

      setResume({
        id,
        name:
          activeResume.originalFilename ||
          "Resume",
        date: activeResume.uploadedAt
          ? new Date(
              activeResume.uploadedAt
            ).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )
          : "Unknown",
        size:
          typeof activeResume.fileSize ===
          "number"
            ? `${(
                activeResume.fileSize /
                (1024 * 1024)
              ).toFixed(2)} MB`
            : "Unknown",
      })
    } catch (error) {
      console.error(
        "Failed to load resume:",
        error
      )

      setResume(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResume()
  }, [])

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase()

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
    ]

    if (
      !allowedTypes.includes(file.type) &&
      !(
        extension &&
        allowedExtensions.includes(
          extension
        )
      )
    ) {
      alert(
        "Please upload a PDF, DOC, or DOCX file."
      )

      e.target.value = ""
      return
    }

    // Backend blueprint allows 10 MB.
    const maxSize =
      10 * 1024 * 1024

    if (file.size > maxSize) {
      alert(
        "Resume size must be less than 10 MB."
      )

      e.target.value = ""
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    const interval = setInterval(() => {
      setUploadProgress((previous) => {
        if (previous >= 85) {
          return 85
        }

        return previous + 10
      })
    }, 500)

    try {
      const parsedData =
        await aiService.parseResume(
          file
        )

      clearInterval(interval)

      setUploadProgress(100)

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "parsed_resume_data",
          JSON.stringify(parsedData)
        )
      }

      const resumeResponse =
        await candidateService.getProfile()

      const activeResume =
        resumeResponse?.data?.profile
          ?.activeResume

      if (activeResume) {
        const resumeId =
          activeResume._id ||
          activeResume.id

        setResume({
          id: resumeId,
          name:
            activeResume.originalFilename ||
            file.name,
          date: activeResume.uploadedAt
            ? new Date(
                activeResume.uploadedAt
              ).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )
            : new Date().toLocaleDateString(
                "en-US"
              ),
          size:
            typeof activeResume.fileSize ===
            "number"
              ? `${(
                  activeResume.fileSize /
                  (1024 * 1024)
                ).toFixed(2)} MB`
              : `${(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)} MB`,
        })
      }

      setTimeout(() => {
        router.push(
          "/candidate/profile?action=review_parsed_resume"
        )
      }, 500)
    } catch (error) {
      clearInterval(interval)

      console.error(
        "Resume upload/parsing failed:",
        error
      )

      setUploadProgress(0)

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload and parse resume. Please try again."
      )
    } finally {
      setIsUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!resume?.id) return

    const confirmed = confirm(
      "Are you sure you want to delete your resume?"
    )

    if (!confirmed) return

    try {
      setDeleting(true)

      await candidateService.deleteResume(
        resume.id
      )

      setResume(null)

      alert(
        "Resume deleted successfully."
      )
    } catch (error) {
      console.error(
        "Failed to delete resume:",
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete resume."
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!resume?.id) return
    try {
      await candidateService.downloadResume(resume.id, resume.name)
    } catch (error) {
      console.error("Failed to download resume:", error)
      alert("Unable to download resume.")
    }
  }

  const handlePreview = async () => {
    if (!resume?.id) return

    try {
      await candidateService.downloadResume(resume.id, resume.name)
    } catch (error) {
      console.error("Failed to preview resume:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Unable to preview resume."
      )
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Resume Manager
        </h1>

        <p className="text-muted-foreground mt-1">
          Upload and manage your resume for
          applications and AI matching.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Current Resume
          </CardTitle>

          <CardDescription>
            This resume will be used for AI
            parsing and quick apply.
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
                      Uploaded:{" "}
                      {resume.date}
                    </span>

                    <span>•</span>

                    <span>
                      {resume.size}
                    </span>
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
                  className="w-full sm:w-auto gap-2"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  className="w-full sm:w-auto gap-2 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
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
          <CardTitle>
            Upload New Resume
          </CardTitle>

          <CardDescription>
            Upload a new PDF, DOC, or DOCX
            file. Max size 10MB.
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
                accept=".pdf,.doc,.docx"
                onChange={
                  handleFileUpload
                }
              />

              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-medium mb-1">
                Click to upload or drag and drop
              </h3>

              <p className="text-muted-foreground">
                Supported formats: PDF,
                DOC, DOCX
              </p>

              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 10 MB
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
                {uploadProgress}%
                Complete
              </p>

              <p className="text-xs text-muted-foreground mt-4">
                Uploading and running AI
                extraction...
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
              Your resume has been uploaded
              and parsed. Review the extracted
              information before saving your
              profile.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Preview needs authentication because
 * GET /api/resumes/:id is protected.
 */
async function fetchResumeBlob(
  resumeId: string
): Promise<Blob> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "accessToken"
        )
      : null

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5000/api"
    }/resumes/${resumeId}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  )

  if (!response.ok) {
    throw new Error(
      "Unable to load resume preview."
    )
  }

  return response.blob()
}