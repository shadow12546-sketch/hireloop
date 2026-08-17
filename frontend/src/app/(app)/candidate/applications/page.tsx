"use client"
import { applicationService } from "@/services/applicationService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Building2, Calendar, ChevronRight } from "lucide-react"
import { ApplicationTimeline } from "@/components/candidate/ApplicationTimeline"

export default function CandidateApplications() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res: any = await applicationService.getApplications()
        const appsList = Array.isArray(res) ? res : res?.data?.applications || res?.applications || res?.data || []
        setApps(Array.isArray(appsList) ? appsList : [])
      } catch {
        setApps([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const appsArray = Array.isArray(apps) ? apps : []

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of jobs you've applied for.</p>
      </div>

      {appsArray.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No applications yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">Start exploring jobs and apply.</p>
          <Button render={<Link href="/candidate/jobs" />}>Find Jobs</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {appsArray.map((app, index) => {
            const companyName = typeof app.job?.company === 'object' ? app.job.company.name : app.company?.name || app.company || 'Company'
            const jobTitle = app.job?.title || app.jobTitle || 'Job Role'
            const appliedDateStr = app.appliedAt || app.appliedDate ? new Date(app.appliedAt || app.appliedDate).toLocaleDateString() : 'Recently'
            const appId = app._id || app.id || index

            return (
              <Card key={appId} className="overflow-hidden hover:border-primary/50 transition-colors group">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0">
                          {companyName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{jobTitle}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center text-foreground font-medium">
                              <Building2 className="w-4 h-4 mr-1" /> {companyName}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" /> Applied {appliedDateStr}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-sm py-1">
                          Status: {app.status || 'APPLIED'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform" render={<Link href={`/candidate/applications/${appId}`} />}>
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 border-t p-4 px-6">
                    <ApplicationTimeline 
                      stages={['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer']} 
                      currentStageIndex={['APPLIED', 'SCREENING', 'SHORTLISTED', 'AI_INTERVIEW', 'OFFER', 'HIRED'].indexOf((app.status || 'APPLIED').toUpperCase()) !== -1 ? ['APPLIED', 'SCREENING', 'SHORTLISTED', 'AI_INTERVIEW', 'OFFER', 'HIRED'].indexOf((app.status || 'APPLIED').toUpperCase()) : 0} 
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
