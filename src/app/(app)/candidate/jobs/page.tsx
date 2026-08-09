"use client"
import { jobService } from "@/services/jobService"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/candidate/JobCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Briefcase } from "lucide-react"

export default function CandidateJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await jobService.getJobs()
        setJobs(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Jobs</h1>
          <p className="text-muted-foreground mt-1">Find your next great opportunity.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Job title, company, or keywords" 
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-[250px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Location" className="pl-9 h-11" />
        </div>
        <Button className="h-11 px-8">Search</Button>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
