"use client"

import { useState, useEffect, useMemo } from "react"
import { jobService } from "@/services/jobService"
import { JobCard } from "@/components/candidate/JobCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Briefcase, SlidersHorizontal, X, Loader2 } from "lucide-react"

const WORK_MODES = ["Remote", "Hybrid", "On-site"]
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"]
const EXPERIENCE_LEVELS = ["0–1 years", "1–3 years", "3–5 years", "5+ years"]

export default function CandidateJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    workMode: [] as string[],
    jobType: [] as string[],
    experience: [] as string[],
  })

  useEffect(() => {
    jobService.getJobs().then(setJobs).finally(() => setLoading(false))
  }, [])

  const activeFilterCount =
    filters.workMode.length + filters.jobType.length + filters.experience.length

  const toggleFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
  }

  const clearAllFilters = () => {
    setFilters({ workMode: [], jobType: [], experience: [] })
    setSearchTerm("")
    setLocation("")
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchLocation =
        !location || job.location.toLowerCase().includes(location.toLowerCase())
      const matchMode =
        filters.workMode.length === 0 || filters.workMode.some(m => job.location?.includes(m) || job.type?.includes(m))
      const matchType =
        filters.jobType.length === 0 || filters.jobType.includes(job.type)
      return matchSearch && matchLocation && matchMode && matchType
    })
  }, [jobs, searchTerm, location, filters])

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading ? "Loading opportunities..." : `${filteredJobs.length} opportunities found`}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Job title, company, or skills"
                className="pl-9 h-11 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative md:w-[220px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="pl-9 h-11 bg-background"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="h-11 gap-2 shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/60 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Work Mode */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Mode</p>
                  <div className="flex flex-wrap gap-2">
                    {WORK_MODES.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleFilter("workMode", m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          filters.workMode.includes(m)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Type</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleFilter("jobType", t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          filters.jobType.includes(t)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map((e) => (
                      <button
                        key={e}
                        onClick={() => toggleFilter("experience", e)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          filters.experience.includes(e)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...filters.workMode, ...filters.jobType, ...filters.experience].map((f) => (
            <Badge
              key={f}
              variant="secondary"
              className="gap-1.5 pr-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => {
                const key = filters.workMode.includes(f) ? "workMode"
                  : filters.jobType.includes(f) ? "jobType" : "experience"
                toggleFilter(key, f)
              }}
            >
              {f}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-1 mb-4">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={clearAllFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
