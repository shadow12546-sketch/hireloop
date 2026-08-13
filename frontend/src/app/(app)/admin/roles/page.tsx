"use client"
import { authService } from "@/services/authService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Plus, Settings } from "lucide-react"

export default function AdminRoles() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await authService.getRoles()
        setRoles(data)
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Configure role-based access control across the platform.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map(role => (
          <Card key={role.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <Badge variant="secondary">{role.users} Users</Badge>
              </div>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end mt-4">
              <Button variant="outline" className="w-full gap-2">
                <Settings className="w-4 h-4" /> Edit Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
