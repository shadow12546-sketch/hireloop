"use client"
import { jobService } from "@/services/jobService"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Briefcase, DollarSign, Clock, Building2, ChevronLeft, Send } from "lucide-react"

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res: any = await jobService.getJobById(resolvedParams.id)
        const jobObj = res?.data?.job || res?.job || res?.data || res
        setJob(jobObj)
      } catch {
        setJob(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <Button variant="link" render={<Link href="/candidate/jobs" />} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    )
  }

  const jobId = job._id || job.id || resolvedParams.id
  const companyName = typeof job.company === 'object' ? job.company?.name || 'Company' : job.company || 'Company'
  const jobTitle = job.title || 'Untitled Job'
  const locationStr = job.location || 'Remote'
  const typeStr = job.employmentType || job.type || 'Full-time'
  const expStr = job.experienceLevel || job.experience || 'Mid Level'
  const salaryStr = job.salary || 'Competitive'
  const postedStr = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : job.posted || 'Recently'
  const requirementsList = Array.isArray(job.requirements) ? job.requirements : []
  const skillsList = Array.isArray(job.skills) ? job.skills : []

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/candidate/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>

      <div className="bg-card border rounded-3xl p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{jobTitle}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center text-foreground font-medium">
              <Building2 className="w-4 h-4 mr-2" /> {companyName}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {locationStr}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> {postedStr}
            </span>
          </div>
        </div>

        <Button size="lg" className="shrink-0 gap-2" render={<Link href={`/candidate/jobs/${jobId}/apply`} />}>
          Apply Now <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4">Job Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </section>

          {requirementsList.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4">Requirements</h3>
              <ul className="space-y-2">
                {requirementsList.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-2">Job Overview</h3>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Salary</p>
                  <p className="text-sm text-muted-foreground">{salaryStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">{expStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Employment Type</p>
                  <p className="text-sm text-muted-foreground">{job.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
