"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2, Bell, Lock, User, AlertTriangle, Eye, EyeOff } from "lucide-react"

export default function CandidateSettingsPage() {
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    applicationStatus: true,
    interviewScheduled: true,
    offerReceived: true,
    assessmentAssigned: true,
    jobRecommendations: false,
  })

  const saveSection = async (section: string) => {
    setSaving(section)
    await new Promise(r => setTimeout(r, 800))
    setSaving(null)
    setSaved(section)
    setTimeout(() => setSaved(null), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Account Information</CardTitle>
          </div>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <Input defaultValue="Sachin Verma" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <Input defaultValue="sachin@gmail.com" type="email" className="h-10" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSection("account")} disabled={saving === "account"} className="gap-2 h-9">
              {saving === "account" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved === "account" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {saved === "account" ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Control which email notifications you receive.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[
            { key: "applicationStatus", label: "Application status updates", desc: "When your application moves to a new stage" },
            { key: "interviewScheduled", label: "Interview scheduled", desc: "When an employer schedules an interview" },
            { key: "offerReceived", label: "Offer received", desc: "When you receive a job offer" },
            { key: "assessmentAssigned", label: "Assessment assigned", desc: "When an employer assigns a skills test" },
            { key: "jobRecommendations", label: "Job recommendations", desc: "Weekly personalized job suggestions" },
          ].map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={notifications[item.key as keyof typeof notifications]}
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  notifications[item.key as keyof typeof notifications] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ${
                  notifications[item.key as keyof typeof notifications] ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={() => saveSection("notifications")} disabled={saving === "notifications"} className="gap-2 h-9">
              {saving === "notifications" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved === "notifications" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {saved === "notifications" ? "Saved" : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Current Password</label>
              <Input type="password" placeholder="Enter current password" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">New Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="New password" className="h-10 pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSection("password")} disabled={saving === "password"} variant="outline" className="gap-2 h-9">
              {saving === "password" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader className="border-b border-red-500/20 bg-red-500/5 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your candidate account and all application data.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 border-red-500/30 text-red-600 hover:bg-red-500/10 h-9 text-sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
