"use client"
import { authService } from "@/services/authService"
import { analyticsService } from "@/services/analyticsService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Building2, Briefcase, Activity, ShieldCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 w-8 rounded-lg bg-muted" />
          </div>
          <div className="h-8 bg-muted rounded w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashboardData, auditLogs] = await Promise.all([
          analyticsService.getKpis(),
          authService.getAuditLogs()
        ])
        setData(dashboardData)
        setLogs(auditLogs.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!loading && (!data || !logs)) {
    throw new Error("Failed to load admin dashboard data.")
  }

  const kpis = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", link: "/admin/users" },
    { label: "Active Companies", value: data?.activeCompanies, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10", link: "/admin/companies" },
    { label: "Active Jobs", value: data?.activeJobs, icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", link: "/admin/jobs" },
    { label: "System Health", value: data?.systemHealth, icon: Activity, color: "text-green-500", bg: "bg-green-500/10", link: "/admin/settings" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="page-title">System Administration</h1>
        <p className="page-subtitle">Manage platform configuration, users, and monitor health.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
            <Link key={i} href={kpi.link}>
              <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer group">
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                      {kpi.label}
                    </p>
                    <div className={`p-2 rounded-lg shrink-0 ${kpi.bg}`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{kpi.value ?? "—"}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Audit log */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>Latest actions performed on the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/admin/audit" />}>View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/60 dark:bg-muted/40 border-y">
                  <tr>
                    <th className="th-cell">User</th>
                    <th className="th-cell">Action</th>
                    <th className="th-cell">Entity</th>
                    <th className="th-cell text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        {[...Array(4)].map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 rounded skeleton-shimmer" style={{ width: `${65 + (j * 12) % 30}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : logs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="td-cell font-medium">{log.user}</td>
                      <td className="td-cell">
                        <Badge variant="secondary" className="font-normal">{log.action}</Badge>
                      </td>
                      <td className="td-cell text-muted-foreground">{log.entity}</td>
                      <td className="td-cell text-right text-xs text-muted-foreground">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg animate-pulse space-y-1.5">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : logs.map(log => (
                <div key={log.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{log.user}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal text-xs">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground">{log.entity}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Quick Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/admin/users", icon: Users, label: "User Management" },
              { href: "/admin/roles", icon: ShieldCheck, label: "Roles & Permissions" },
              { href: "/admin/companies", icon: Building2, label: "Company Management" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
