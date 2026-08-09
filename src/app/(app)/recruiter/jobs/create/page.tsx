"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Save, Send } from "lucide-react"

export default function CreateJob() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    experience: "",
    salary: "",
    description: "",
    requirements: [""],
    deadline: ""
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    router.push("/recruiter/jobs")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/recruiter/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground mt-1">Fill out the details to post a new job opening.</p>
      </div>

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
                <label className="text-sm font-medium leading-none">Work Mode / Type</label>
                <Input 
                  required 
                  placeholder="e.g. Full-time" 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})} 
                />
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
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Salary Range</label>
                <Input 
                  placeholder="e.g. $120k - $150k" 
                  value={form.salary} 
                  onChange={e => setForm({...form, salary: e.target.value})} 
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

        <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-background/80 backdrop-blur-sm border rounded-2xl shadow-sm">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting} className="gap-2 min-w-[150px]">
            {submitting ? (
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
