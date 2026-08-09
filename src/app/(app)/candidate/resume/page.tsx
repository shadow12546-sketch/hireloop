"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UploadCloud, FileText, Trash2, Eye, RefreshCw, CheckCircle2 } from "lucide-react"

export default function CandidateResume() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resume, setResume] = useState<{ name: string; date: string; size: string } | null>({
    name: "sachin_verma_resume.pdf",
    date: "Aug 1, 2026",
    size: "2.4 MB"
  })

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setResume({
              name: "new_resume_uploaded.pdf",
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              size: "1.8 MB"
            })
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your resume?")) {
      setResume(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Manager</h1>
        <p className="text-muted-foreground mt-1">Upload and manage your resume for applications and AI matching.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Resume</CardTitle>
          <CardDescription>This resume will be used for AI parsing and quick apply.</CardDescription>
        </CardHeader>
        <CardContent>
          {resume ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{resume.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>Uploaded: {resume.date}</span>
                    <span>•</span>
                    <span>{resume.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 text-destructive hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" /> Delete
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
          <CardDescription>Upload a new PDF or DOCX file. Max size 5MB.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isUploading ? (
            <div 
              className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer"
              onClick={simulateUpload}
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-1">Click to upload or drag and drop</h3>
              <p className="text-muted-foreground">Supported formats: PDF, DOCX, TXT</p>
            </div>
          ) : (
            <div className="border rounded-xl p-12 text-center bg-muted/10">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Processing Resume...</h3>
              <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground">{uploadProgress}% Complete</p>
              <p className="text-xs text-muted-foreground mt-4">Running AI extraction and parsing...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {resume && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">AI Parsing Successful</h4>
            <p className="text-sm opacity-90">Your resume has been successfully parsed. We've updated your profile skills and experience section based on the contents.</p>
          </div>
        </div>
      )}
    </div>
  )
}
