"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Mail, Database, Globe, Moon, Save } from "lucide-react"

interface Toggle {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface SettingSection {
  title: string
  icon: React.ElementType
  settings: Toggle[]
}

export default function AdminSettings() {
  const [sections, setSections] = useState<SettingSection[]>([
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { id: "email_alerts", label: "Email Alerts", description: "Send email alerts for critical events.", enabled: true },
        { id: "sms_alerts", label: "SMS Alerts", description: "Send SMS alerts to admins on urgent issues.", enabled: false },
      ]
    },
    {
      title: "Security",
      icon: Shield,
      settings: [
        { id: "2fa", label: "Two-Factor Authentication", description: "Require 2FA for all admin accounts.", enabled: true },
        { id: "session_timeout", label: "Session Timeout", description: "Automatically log out users after 30 minutes of inactivity.", enabled: true },
        { id: "ip_whitelist", label: "IP Whitelisting", description: "Restrict admin access to specific IP ranges.", enabled: false },
      ]
    },
    {
      title: "Email & Integrations",
      icon: Mail,
      settings: [
        { id: "smtp", label: "Custom SMTP", description: "Use a custom SMTP server for system emails.", enabled: false },
        { id: "calendar_sync", label: "Calendar Integration", description: "Sync interviews with Google/Outlook Calendar.", enabled: true },
      ]
    },
    {
      title: "Data & Storage",
      icon: Database,
      settings: [
        { id: "auto_archive", label: "Auto-Archive Closed Jobs", description: "Archive jobs after 90 days of being closed.", enabled: true },
        { id: "resume_retention", label: "Resume Data Retention", description: "Auto-delete resumes after 2 years per compliance.", enabled: false },
      ]
    },
  ])

  const toggleSetting = (sectionTitle: string, settingId: string) => {
    setSections(sections.map(sec =>
      sec.title === sectionTitle
        ? { ...sec, settings: sec.settings.map(s => s.id === settingId ? { ...s, enabled: !s.enabled } : s) }
        : sec
    ))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global platform behaviors and integrations.</p>
        </div>
        <Button className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="w-5 h-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="mr-6">
                    <h4 className="font-medium">{setting.label}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{setting.description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={setting.enabled}
                    onClick={() => toggleSetting(section.title, setting.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${setting.enabled ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${setting.enabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
