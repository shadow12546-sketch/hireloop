"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Code2,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react"

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/recruiter", icon: LayoutDashboard, exact: true },
      { title: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { title: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
      { title: "Candidates", href: "/recruiter/candidates", icon: Users },
      { title: "Applications", href: "/recruiter/applications", icon: FileText },
      { title: "Interviews", href: "/recruiter/interviews", icon: Calendar },
      { title: "Assessments", href: "/recruiter/assessments", icon: Code2 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", href: "/recruiter/notifications", icon: Bell },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen border-r bg-card w-64 shrink-0",
        className
      )}
      {...props}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 gradient-violet rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="font-extrabold text-base">
            Dev<span className="text-primary">Fusion</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                // Use exact match for Dashboard to avoid /recruiter/* matching
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "gradient-violet text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="flex-1">{item.title}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-white/70" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t">
        <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60 cursor-pointer transition-colors">
          <div className="h-8 w-8 rounded-full gradient-violet flex items-center justify-center text-white font-bold text-sm shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Sachin Verma</p>
            <p className="text-xs text-muted-foreground truncate">Recruiter</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>
    </div>
  )
}
