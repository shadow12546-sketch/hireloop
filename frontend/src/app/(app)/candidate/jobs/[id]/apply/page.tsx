"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { ChevronLeft, UploadCloud, FileText, CheckCircle2 } from "lucide-react"

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [form, setForm] = useState({
    firstName: "Sachin",
    lastName: "Verma",
    email: "sachin@example.com",
    phone: "+1 234 567 890",
    coverLetter: "",
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate submission delay
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setIsSuccess(true)
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
                  <Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Last Name</label>
                  <Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
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
              <CardDescription>Upload your documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="font-medium mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-muted-foreground">PDF, DOCX up to 5MB</p>
                <div className="mt-4 p-3 bg-background border rounded-lg flex items-center gap-3 w-fit mx-auto">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">sachin_verma_resume.pdf</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Cover Letter (Optional)</label>
                <Textarea 
                  placeholder="Introduce yourself and explain why you're a great fit..." 
                  className="min-h-[150px]"
                  value={form.coverLetter}
                  onChange={e => setForm({...form, coverLetter: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Review</Button>
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
                  <span className="font-medium">{form.phone}</span>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Documents</h4>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-blue-500" /> sachin_verma_resume.pdf
                </div>
                {form.coverLetter && (
                  <div className="text-sm pt-2 border-t mt-2">
                    <span className="text-muted-foreground block mb-1">Cover Letter Included:</span>
                    <p className="line-clamp-2 italic">"{form.coverLetter}"</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="min-w-[150px]">
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
