"use client"

import { useState, useEffect } from "react"
import { employerService } from "@/services/employerService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Globe, MapPin, Users, Loader2, CheckCircle2, AlertCircle,
  Camera, Pencil, Save, X, ShieldCheck, ExternalLink
} from "lucide-react"

const INDUSTRY_OPTIONS = [
  "Technology", "Software", "Finance", "Healthcare", "Education",
  "E-commerce", "Media", "Consulting", "Manufacturing", "Other"
]

const SIZE_OPTIONS = [
  "1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"
]

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    employerService.getCompanyProfile().then((data) => {
      setProfile(data)
      setForm(data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await employerService.updateCompanyProfile(form)
      setProfile(form)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isVerified = profile?.verificationStatus === "verified"

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your public employer profile. Candidates can see this on job postings.
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gap-2 shrink-0">
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); setForm(profile) }} className="gap-1.5">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      {/* Verification Status Banner */}
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${
        isVerified
          ? "border-green-500/30 bg-green-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      }`}>
        {isVerified
          ? <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          : <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        }
        <div className="flex-1">
          <p className={`font-semibold text-sm ${isVerified ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {isVerified ? "Verified Employer" : "Verification Pending"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isVerified
              ? "Your organization is verified. A verification badge is displayed on your job postings."
              : "Your organization verification is under review. Job posting features will be enabled after approval."
            }
          </p>
        </div>
        {!isVerified && (
          <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-500/30 text-xs">
            {profile?.verificationStatus?.replace("_", " ")}
          </Badge>
        )}
      </div>

      {/* Logo & Identity Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo placeholder */}
            <div className="relative group">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-primary font-black text-3xl shrink-0">
                {(form.name || "A").charAt(0)}
              </div>
              {editing && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Name</label>
                {editing ? (
                  <Input
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10"
                    placeholder="e.g. Acme Corp"
                  />
                ) : (
                  <p className="text-xl font-bold">{profile?.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</label>
                  {editing ? (
                    <select
                      value={form.industry || ""}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.industry || "—"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Size</label>
                  {editing ? (
                    <select
                      value={form.size || ""}
                      onChange={(e) => setForm({ ...form, size: e.target.value })}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select size</option>
                      {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o} employees</option>)}
                    </select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.size ? `${profile.size} employees` : "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base">Company Details</CardTitle>
          <CardDescription>This information appears on all your job postings.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Website */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Globe className="h-4 w-4 text-muted-foreground" /> Website
            </label>
            {editing ? (
              <Input
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourcompany.com"
                type="url"
                className="h-10"
              />
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{profile?.website || "—"}</p>
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Location
            </label>
            {editing ? (
              <Input
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
                className="h-10"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile?.location || "—"}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-muted-foreground" /> About the Company
            </label>
            {editing ? (
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your company, mission, and culture..."
                className="resize-none min-h-[120px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.description || "No description provided."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidate-visible preview */}
      {!editing && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex items-start gap-3">
            <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Visible to candidates</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Company name, website, location, description, and your verification status are shown to candidates on your job postings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
