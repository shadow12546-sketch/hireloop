import Link from "next/link"
import { Briefcase, MapPin, DollarSign, Clock, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  job: any
}

export function JobCard({ job }: JobCardProps) {
  if (!job) return null
  const jobId = job._id || job.id || ""
  const companyName = typeof job.company === 'object' ? job.company?.name || 'Company' : job.company || 'Company'
  const jobTitle = job.title || 'Untitled Job'
  const locationStr = job.location || 'Remote'
  const typeStr = job.employmentType || job.type || 'Full-time'
  const expStr = job.experienceLevel || job.experience || 'Mid Level'
  const salaryStr = job.salary || 'Competitive'
  const postedStr = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : job.posted || 'Recently'
  const skillsList = Array.isArray(job.skills) ? job.skills : []

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-1">{jobTitle}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <Building2 className="w-4 h-4 mr-1" />
              <span className="text-sm">{companyName}</span>
            </div>
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">{postedStr}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {locationStr}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {typeStr}
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            {expStr}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            {salaryStr}
          </div>
        </div>
        
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {skillsList.map((skill: string, idx: number) => (
              <Badge key={`${skill}-${idx}`} variant="outline" className="bg-primary/5">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" render={<Link href={`/candidate/jobs/${jobId}`} />}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
