"use client"
import { authService } from "@/services/authService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, UserCheck, UserX } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await authService.getUsers()
        setUsers(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform users and their roles.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="text-lg">All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{user.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(user.created).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {user.status === 'Active' ? (
                          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <UserCheck className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <UserX className="w-4 h-4" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
