"use client"
import { candidateService } from "@/services/candidateService"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Save, UploadCloud, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CandidateProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedParsedData, setHasUnsavedParsedData] = useState(false)
  
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    async function load() {
      try {
        let data = await candidateService.getProfile()
        
        // Merge parsed data if available
        if (typeof window !== "undefined") {
          const parsedDataStr = sessionStorage.getItem("parsed_resume_data")
          if (parsedDataStr) {
            const parsedData = JSON.parse(parsedDataStr)
            
            data = {
              ...data,
              firstName: parsedData.name?.split(" ")[0] || data.firstName,
              lastName: parsedData.name?.split(" ").slice(1).join(" ") || data.lastName,
              email: parsedData.email || data.email,
              phone: parsedData.phone || data.phone,
              skills: Array.from(new Set([...data.skills, ...(parsedData.skills || [])])),
              experience: parsedData.experience && parsedData.experience.length > 0 
                ? parsedData.experience.map((exp: any, i: number) => ({ id: `new_exp_${i}`, ...exp }))
                : data.experience
            }
            
            setHasUnsavedParsedData(true)
            sessionStorage.removeItem("parsed_resume_data")
          }
        }

        setProfile(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Simulate API save
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setHasUnsavedParsedData(false)
    alert("Profile saved successfully!")
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skillToRemove) })
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information, resume, and preferences.</p>
      </div>

      {hasUnsavedParsedData && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Please Review AI Parsed Data</h4>
            <p className="text-sm opacity-90">Your resume was successfully parsed. The fields below have been auto-filled. Please review and confirm the details before saving.</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <h3 className="font-semibold mb-2">Profile Completion</h3>
              <div className="flex items-center gap-4">
                <Progress value={profile.completionScore} className="h-3 flex-1" />
                <span className="font-bold text-primary">{profile.completionScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Add more details to your experience to reach 100%.
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col gap-2">
              <Button className="w-full gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload New Resume
              </Button>
              <Button variant="outline" className="w-full">
                Preview Public Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional Title</label>
              <Input value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn</label>
              <Input value={profile.links.linkedin} onChange={(e) => setProfile({...profile, links: {...profile.links, linkedin: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub</label>
              <Input value={profile.links.github} onChange={(e) => setProfile({...profile, links: {...profile.links, github: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Personal Website</label>
              <Input value={profile.links.portfolio} onChange={(e) => setProfile({...profile, links: {...profile.links, portfolio: e.target.value}})} />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="Add a skill..." 
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive text-muted-foreground transition-colors">
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Experience</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.experience.map((exp: any, i: number) => (
              <div key={exp.id} className="p-4 border rounded-xl bg-card relative group">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input defaultValue={exp.role} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input defaultValue={exp.company} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input defaultValue={exp.start} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input defaultValue={exp.end} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea defaultValue={exp.description} className="min-h-[100px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-background/80 backdrop-blur-sm border rounded-2xl shadow-sm">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
