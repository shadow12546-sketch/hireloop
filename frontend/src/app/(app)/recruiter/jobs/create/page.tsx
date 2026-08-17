"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Save, Send } from "lucide-react"

import { jobService } from "@/services/jobService"

export default function CreateJob() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<string | false>(false)
  const [error, setError] = useState("")

  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    workMode: "remote",
    experience: "1-3 years",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: [""],
    deadline: defaultDeadline
  })

  const addRequirement = () => {
    setForm({ ...form, requirements: [...form.requirements, ""] })
  }

  const updateRequirement = (index: number, value: string) => {
    const newReqs = [...form.requirements]
    newReqs[index] = value
    setForm({ ...form, requirements: newReqs })
  }

  const removeRequirement = (index: number) => {
    const newReqs = form.requirements.filter((_, i) => i !== index)
    setForm({ ...form, requirements: newReqs })
  }

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'publish' = 'publish') => {
    e.preventDefault()
    setSubmitting(action)
    setError("")

    if (!form.title.trim()) {
      setError("Please enter a job title.")
      setSubmitting(false)
      return
    }

    const validDeadline = form.deadline
      ? new Date(form.deadline).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const validDescription = form.description.trim().length >= 10
      ? form.description.trim()
      : `${form.title.trim()} role in ${form.department.trim() || 'Engineering'}. Detailed responsibilities and guidelines will be shared.`

    const cleanSkills = form.requirements.filter((r) => r.trim().length > 0)

    try {
      await jobService.createJob({
        title: form.title.trim(),
        location: form.location.trim() || "Remote",
        employmentType: form.type || "full-time",
        workMode: form.workMode || "remote",
        experience: form.experience.trim() || "1-3 years",
        description: validDescription,
        skills: cleanSkills,
        deadline: validDeadline,
        status: action === 'publish' ? 'OPEN' : 'OPEN',
      })
      router.push("/recruiter/jobs")
    } catch (err: any) {
      console.error("Failed to post job:", err)
      setError(err?.message || err?.data?.message || "Failed to create job posting. Please check all fields.")
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/recruiter/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground mt-1">Fill out the details to post a new job opening.</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Main details about the role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Job Title</label>
              <Input 
                required 
                placeholder="e.g. Senior React Developer" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Department</label>
                <Input 
                  required 
                  placeholder="e.g. Engineering" 
                  value={form.department} 
                  onChange={e => setForm({...form, department: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Location</label>
                <Input 
                  required 
                  placeholder="e.g. Remote, San Francisco" 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Employment Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})} 
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Work Mode</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.workMode} 
                  onChange={e => setForm({...form, workMode: e.target.value})} 
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Experience Required</label>
                <Input 
                  required 
                  placeholder="e.g. 3-5 years" 
                  value={form.experience} 
                  onChange={e => setForm({...form, experience: e.target.value})} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Job Description</label>
              <Textarea 
                required 
                placeholder="Describe the role, responsibilities, and team..." 
                className="min-h-[150px]"
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">Requirements</label>
              {form.requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={req} 
                    onChange={e => updateRequirement(i, e.target.value)} 
                    placeholder="Add a requirement..." 
                  />
                  {form.requirements.length > 1 && (
                    <Button type="button" variant="ghost" className="text-destructive px-3 shrink-0" onClick={() => removeRequirement(i)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2 gap-2" onClick={addRequirement}>
                <Plus className="w-4 h-4" /> Add Another Requirement
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Application Deadline</label>
              <Input 
                type="date"
                required 
                className="w-auto"
                value={form.deadline} 
                onChange={e => setForm({...form, deadline: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Pipeline Setup</CardTitle>
            <CardDescription>Configure the additional stages for this role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div className="space-y-1">
                <p className="font-medium text-sm leading-none">Include Skills Assessment</p>
                <p className="text-xs text-muted-foreground">Automatically assign an AI-scored assessment to shortlisted candidates.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors cursor-pointer">
                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div className="space-y-1">
                <p className="font-medium text-sm leading-none">Require Technical Interview</p>
                <p className="text-xs text-muted-foreground">Add a dedicated technical interview stage before the final round.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors cursor-pointer">
                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-background/80 backdrop-blur-sm border rounded-2xl shadow-sm">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            type="button" 
            variant="secondary"
            disabled={submitting !== false} 
            onClick={(e) => handleSubmit(e, 'draft')}
            className="gap-2 min-w-[150px]"
          >
            {submitting === 'draft' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save as Draft
              </>
            )}
          </Button>
          <Button 
            type="submit" 
            disabled={submitting !== false} 
            onClick={(e) => handleSubmit(e, 'publish')}
            className="gap-2 min-w-[150px]"
          >
            {submitting === 'publish' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Job
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
