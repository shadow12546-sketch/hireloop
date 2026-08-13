"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2, Shield, Bell, Lock, User, Building2, AlertTriangle } from "lucide-react"

export default function EmployerSettingsPage() {
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    newApplication: true,
    interviewResponse: true,
    offerAccepted: true,
    offerRejected: true,
    assessmentComplete: true,
    weeklyDigest: false,
  })

  const [accountForm, setAccountForm] = useState({
    name: "Sachin Verma",
    email: "sachin@acme.com",
    designation: "Founder",
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
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and notification preferences.</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Account Information</CardTitle>
          </div>
          <CardDescription>Update your personal details for this employer account.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Designation</label>
              <Input
                value={accountForm.designation}
                onChange={(e) => setAccountForm({ ...accountForm, designation: e.target.value })}
                placeholder="e.g. HR Manager"
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Work Email</label>
            <Input
              value={accountForm.email}
              onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
              type="email"
              className="h-10"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSection("account")} disabled={saving === "account"} className="gap-2 h-9">
              {saving === "account" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved === "account" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {saved === "account" ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Choose which events trigger email notifications.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[
            { key: "newApplication", label: "New application received", desc: "When a candidate applies to your job" },
            { key: "interviewResponse", label: "Interview response", desc: "When a candidate accepts or declines an interview" },
            { key: "offerAccepted", label: "Offer accepted", desc: "When a candidate accepts your offer" },
            { key: "offerRejected", label: "Offer rejected", desc: "When a candidate declines your offer" },
            { key: "assessmentComplete", label: "Assessment completed", desc: "When a candidate completes an assigned assessment" },
            { key: "weeklyDigest", label: "Weekly hiring digest", desc: "A weekly summary of your hiring activity" },
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
            <CardTitle className="text-base">Password & Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Current Password</label>
              <Input type="password" placeholder="Enter current password" className="h-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">New Password</label>
                <Input type="password" placeholder="New password" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                <Input type="password" placeholder="Confirm password" className="h-10" />
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

      {/* Verification Status */}
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Verification & Trust</CardTitle>
          </div>
          <CardDescription>Manage your organization verification status.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Pending Verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your organization verification is under admin review. Status is determined by the backend team.
              </p>
            </div>
            <a href="/recruiter/verification" className="shrink-0">
              <Button size="sm" variant="outline" className="h-8 text-xs">View Status</Button>
            </a>
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
              <p className="text-sm font-semibold text-foreground">Deactivate Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently deactivate your employer account. This action cannot be undone.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 border-red-500/30 text-red-600 hover:bg-red-500/10 h-9 text-sm">
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
