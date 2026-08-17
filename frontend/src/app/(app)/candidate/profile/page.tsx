"use client"

import { candidateService } from "@/services/candidateService"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

import {
  AlertCircle,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"

interface Experience {
  id?: string
  _id?: string

  title?: string
  company?: string

  startDate?: string
  endDate?: string

  isCurrent?: boolean

  description?: string
}

interface Education {
  id?: string
  _id?: string

  institution?: string
  degree?: string
  fieldOfStudy?: string

  startYear?: number | string
  endYear?: number | string
}

interface ProfileState {
  firstName: string
  lastName: string

  title: string
  email: string
  phone: string
  location: string
  bio: string

  skills: string[]

  experience: Experience[]
  education: Education[]

  links: {
    linkedin: string
    github: string
    portfolio: string
  }

  completionScore: number
}

function splitName(name = "") {
  const parts = name.trim().split(/\s+/)

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  }
}

function normalizeExperience(
  experience: any[]
): Experience[] {
  return experience.map(
    (exp, index) => ({
      id:
        exp._id ||
        exp.id ||
        `exp-${index}`,

      title:
        exp.title ||
        exp.role ||
        "",

      company:
        exp.company ||
        "",

      startDate:
        exp.startDate ||
        exp.start ||
        "",

      endDate:
        exp.endDate ||
        exp.end ||
        "",

      isCurrent:
        Boolean(exp.isCurrent),

      description:
        exp.description ||
        "",
    })
  )
}

function normalizeEducation(
  education: any[]
): Education[] {
  return education.map(
    (edu, index) => ({
      id:
        edu._id ||
        edu.id ||
        `edu-${index}`,

      institution:
        edu.institution ||
        "",

      degree:
        edu.degree ||
        "",

      fieldOfStudy:
        edu.fieldOfStudy ||
        "",

      startYear:
        edu.startYear ||
        "",

      endYear:
        edu.endYear ||
        "",
    })
  )
}
function calculateProfileCompletion(profile: any) {
  if (!profile) return 0

  const fields = [
    profile.firstName,
    profile.lastName,
    profile.title,
    profile.email,
    profile.phone,
    profile.location,
    profile.bio,
    profile.skills?.length > 0,
    profile.experience?.length > 0,
    profile.education?.length > 0,
    profile.links?.linkedin,
    profile.links?.github,
    profile.links?.portfolio,
  ]

  const completed = fields.filter((field) => {
    if (typeof field === "boolean") return field
    return field && String(field).trim().length > 0
  }).length

  return Math.round((completed / fields.length) * 100)
}

export default function CandidateProfile() {
  const router = useRouter()

  const [profile, setProfile] =
    useState<ProfileState | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [hasUnsavedParsedData, setHasUnsavedParsedData] =
    useState(false)

  const [newSkill, setNewSkill] =
    useState("")

  useEffect(() => {
    async function loadProfile() {
      // Build a user-scoped cache key so Account A and Account B can never
      // read each other's cached profile data.
      const currentUser = getCurrentUser()
      const userId = currentUser?.id
      const cacheKey = userId ? `candidate_profile_cache_${userId}` : null

      try {
        const response = await candidateService.getProfile()
        const rawProfile = response?.data?.profile || response?.profile || response?.data || response || {}
        const userObj = rawProfile.user && typeof rawProfile.user === "object" ? rawProfile.user : {}

        const userName = userObj.name || currentUser?.name || ""
        const userEmail = userObj.email || currentUser?.email || ""
        const nameData = splitName(userName)

        // Read user-scoped cache for persistence across section switches & reopens.
        // Only used when the API returns empty/missing fields — NOT as a primary source.
        let cachedData: Partial<ProfileState> = {}
        if (typeof window !== "undefined" && cacheKey) {
          try {
            const localCache = localStorage.getItem(cacheKey)
            if (localCache) cachedData = JSON.parse(localCache)
          } catch {}
        }

        let data: ProfileState = {
          firstName: rawProfile.firstName || cachedData.firstName || nameData.firstName || "",
          lastName: rawProfile.lastName || cachedData.lastName || nameData.lastName || "",
          title: rawProfile.title || cachedData.title || "",
          email: userEmail || cachedData.email || "",
          phone: rawProfile.phone || cachedData.phone || "",
          location: rawProfile.location || cachedData.location || "",
          bio: rawProfile.bio || cachedData.bio || "",
          skills: Array.isArray(rawProfile.skills) && rawProfile.skills.length > 0
            ? rawProfile.skills
            : (Array.isArray(cachedData.skills) ? cachedData.skills : []),
          experience: Array.isArray(rawProfile.experience) && rawProfile.experience.length > 0
            ? normalizeExperience(rawProfile.experience)
            : (Array.isArray(cachedData.experience) ? normalizeExperience(cachedData.experience) : []),
          education: Array.isArray(rawProfile.education) && rawProfile.education.length > 0
            ? normalizeEducation(rawProfile.education)
            : (Array.isArray(cachedData.education) ? normalizeEducation(cachedData.education) : []),
          links: {
            linkedin: rawProfile.links?.linkedin || rawProfile.linkedinUrl || cachedData.links?.linkedin || "",
            github: rawProfile.links?.github || rawProfile.githubUrl || cachedData.links?.github || "",
            portfolio: rawProfile.links?.portfolio || rawProfile.portfolioUrl || cachedData.links?.portfolio || "",
          },
          completionScore: rawProfile.completionScore || cachedData.completionScore || 0,
        }

        /**
         * AI parsed resume data
         */
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("parsed_resume_data")
          if (stored) {
            try {
              const parsedData = JSON.parse(stored)
              const parsedName = splitName(parsedData.name || "")

              data = {
                ...data,
                firstName: parsedName.firstName || data.firstName,
                lastName: parsedName.lastName || data.lastName,
                email: parsedData.email || data.email,
                phone: parsedData.phone || data.phone,
                location: parsedData.location || data.location,
                skills: Array.from(
                  new Set([
                    ...data.skills,
                    ...(Array.isArray(parsedData.skills) ? parsedData.skills : []),
                  ])
                ),
                experience: Array.isArray(parsedData.experience) && parsedData.experience.length
                  ? normalizeExperience(parsedData.experience)
                  : data.experience,
                education: Array.isArray(parsedData.education) && parsedData.education.length
                  ? normalizeEducation(parsedData.education)
                  : data.education,
                links: {
                  linkedin: parsedData.linkedinUrl || data.links.linkedin,
                  github: parsedData.githubUrl || data.links.github,
                  portfolio: parsedData.portfolioUrl || data.links.portfolio,
                },
              }
              setHasUnsavedParsedData(true)
            } catch {}
          }
        }

        setProfile(data)
        // Persist under the user-scoped key only.
        if (typeof window !== "undefined" && cacheKey) {
          localStorage.setItem(cacheKey, JSON.stringify(data))
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
        // On API failure, fall back to the user-scoped cache only.
        // Never use another user's cache.
        let cachedData: Partial<ProfileState> = {}
        if (typeof window !== "undefined" && cacheKey) {
          try {
            const localCache = localStorage.getItem(cacheKey)
            if (localCache) cachedData = JSON.parse(localCache)
          } catch {}
        }
        const nameData = splitName(currentUser?.name || "")
        setProfile({
          firstName: cachedData.firstName || nameData.firstName || "",
          lastName: cachedData.lastName || nameData.lastName || "",
          title: cachedData.title || "",
          email: cachedData.email || currentUser?.email || "",
          phone: cachedData.phone || "",
          location: cachedData.location || "",
          bio: cachedData.bio || "",
          skills: cachedData.skills || [],
          experience: cachedData.experience || [],
          education: cachedData.education || [],
          links: cachedData.links || { linkedin: "", github: "", portfolio: "" },
          completionScore: cachedData.completionScore || 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    if (!profile) return

    try {
      setSaving(true)

      await candidateService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills,
        experience: profile.experience.map(
          ({ id, _id, ...experience }: any) => experience
        ),
        education: profile.education.map(
          ({ id, _id, ...education }: any) => education
        ),
        links: profile.links,
      })

      setHasUnsavedParsedData(false)

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("parsed_resume_data")
        // Save under the user-scoped cache key.
        const userId = getCurrentUser()?.id
        if (userId) {
          localStorage.setItem(`candidate_profile_cache_${userId}`, JSON.stringify(profile))
        }
      }

      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Failed to save profile:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save profile."
      )
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (!skill || !profile) return

    const lowerSkill = skill.toLowerCase()
    if (profile.skills.some((s) => s.toLowerCase() === lowerSkill)) {
      setNewSkill("")
      return
    }

    setProfile({
      ...profile,
      skills: [...profile.skills, skill],
    })
    setNewSkill("")
  }

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return

    setProfile({
      ...profile,
      skills: profile.skills.filter(
        (skill) => skill.toLowerCase() !== skillToRemove.toLowerCase()
      ),
    })
  }

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any
  ) => {
    if (!profile) return

    const experience = [
      ...profile.experience,
    ]

    experience[index] = {
      ...experience[index],
      [field]: value,
    }

    setProfile({
      ...profile,
      experience,
    })
  }

  const removeExperience = (
    index: number
  ) => {
    if (!profile) return

    setProfile({
      ...profile,

      experience:
        profile.experience.filter(
          (_, i) => i !== index
        ),
    })
  }

  const addExperience = () => {
    if (!profile) return

    setProfile({
      ...profile,

      experience: [
        ...profile.experience,
        {
          id: `new-${Date.now()}`,
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: "",
        },
      ],
    })
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Your Profile
        </h1>

        <p className="text-muted-foreground mt-1">
          Manage your personal information,
          resume, and preferences.
        </p>
      </div>

      {hasUnsavedParsedData && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <h4 className="font-semibold text-sm mb-1">
              Please Review AI Parsed Data
            </h4>

            <p className="text-sm opacity-90">
              Your resume was successfully
              parsed. Review the auto-filled
              information before saving.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <h3 className="font-semibold mb-2">
                Profile Completion
              </h3>

              <div className="flex items-center gap-4">
                <Progress
                  value={
                    calculateProfileCompletion(profile)
                  }
                  className="h-3 flex-1"
                />

                <span className="font-bold text-primary">
                  {calculateProfileCompletion(profile)}%
                </span>
              </div>
            </div>

            <Button
              className="gap-2"
              onClick={() =>
                router.push(
                  "/candidate/resume"
                )
              }
            >
              <UploadCloud className="w-4 h-4" />
              Upload New Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Personal Information
            </CardTitle>

            <CardDescription>
              Your basic contact details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  First Name
                </label>

                <Input
                  value={
                    profile.firstName
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      firstName:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Last Name
                </label>

                <Input
                  value={
                    profile.lastName
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      lastName:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Professional Title
              </label>

              <Input
                value={
                  profile.title
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    title:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email
                </label>

                <Input
                  type="email"
                  value={
                    profile.email
                  }
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Phone
                </label>

                <Input
                  value={
                    profile.phone
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Location
              </label>

              <Input
                value={
                  profile.location
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bio
              </label>

              <Textarea
                value={
                  profile.bio
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio:
                      e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Portfolio & Links
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="LinkedIn URL"
              value={
                profile.links.linkedin
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: {
                    ...profile.links,
                    linkedin:
                      e.target.value,
                  },
                })
              }
            />

            <Input
              placeholder="GitHub URL"
              value={
                profile.links.github
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: {
                    ...profile.links,
                    github:
                      e.target.value,
                  },
                })
              }
            />

            <Input
              placeholder="Portfolio URL"
              value={
                profile.links.portfolio
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  links: {
                    ...profile.links,
                    portfolio:
                      e.target.value,
                  },
                })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Skills
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a skill..."
                value={
                  newSkill
                }
                onChange={(e) =>
                  setNewSkill(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />

              <Button
                type="button"
                variant="secondary"
                onClick={addSkill}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge
                  key={`${skill}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-3"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive text-xs font-bold"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Experience
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={
                addExperience
              }
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {profile.experience.length ===
              0 && (
              <p className="text-sm text-muted-foreground">
                No experience added yet.
              </p>
            )}

            {profile.experience.map((exp, index) => (
              <div
                key={exp.id || exp._id || `exp-${index}`}
                className="p-4 border rounded-xl"
              >
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        removeExperience(
                          index
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Job Title"
                      value={
                        exp.title || ""
                      }
                      onChange={(e) =>
                        updateExperience(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      placeholder="Company"
                      value={
                        exp.company ||
                        ""
                      }
                      onChange={(e) =>
                        updateExperience(
                          index,
                          "company",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      placeholder="Start Date"
                      value={
                        exp.startDate ||
                        ""
                      }
                      onChange={(e) =>
                        updateExperience(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      placeholder="End Date"
                      value={
                        exp.endDate ||
                        ""
                      }
                      disabled={
                        exp.isCurrent
                      }
                      onChange={(e) =>
                        updateExperience(
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                    />

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={
                          Boolean(
                            exp.isCurrent
                          )
                        }
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "isCurrent",
                            e.target
                              .checked
                          )
                        }
                      />
                      Currently working here
                    </label>
                  </div>

                  <Textarea
                    className="mt-4 min-h-[100px]"
                    placeholder="Description"
                    value={
                      exp.description ||
                      ""
                    }
                    onChange={(e) =>
                      updateExperience(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end sticky bottom-4 p-4 bg-background/80 backdrop-blur-sm border rounded-2xl shadow-sm">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 min-w-[140px]"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
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