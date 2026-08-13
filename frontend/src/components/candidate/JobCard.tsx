import Link from "next/link"
import { Briefcase, MapPin, DollarSign, Clock, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
    experience: string
    salary: string
    posted: string
    skills: string[]
  }
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <Building2 className="w-4 h-4 mr-1" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">{job.posted}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {job.type}
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            {job.experience}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            {job.salary}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {job.skills.map(skill => (
            <Badge key={skill} variant="outline" className="bg-primary/5">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" render={<Link href={`/candidate/jobs/${job.id}`} />}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
