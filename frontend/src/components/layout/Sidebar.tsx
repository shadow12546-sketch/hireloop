"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { clearAuthSession, getCurrentUser } from "@/lib/auth"
import { authService } from "@/services/authService"
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
  Search,
  Award,
  Building2,
  Kanban,
  UserCircle,
  Gift,
  LogOut,
} from "lucide-react"

const candidateNavGroups = [
  {
    label: "Overview",
    items: [
      { title: "Home", href: "/candidate", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Jobs",
    items: [
      { title: "Discover Jobs", href: "/candidate/jobs", icon: Search },
      { title: "My Applications", href: "/candidate/applications", icon: FileText },
    ],
  },
  {
    label: "Activity",
    items: [
      { title: "Interviews", href: "/candidate/interviews", icon: Calendar },
      { title: "Assessments", href: "/candidate/assessments", icon: Code2 },
      { title: "Offers", href: "/candidate/offers", icon: Gift },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", href: "/candidate/notifications", icon: Bell },
      { title: "Profile", href: "/candidate/profile", icon: UserCircle },
      { title: "Settings", href: "/candidate/settings", icon: Settings },
    ],
  },
]

const employerNavGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/recruiter", icon: LayoutDashboard, exact: true },
      { title: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Hiring",
    items: [
      { title: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
      { title: "Candidates", href: "/recruiter/candidates", icon: Users },
      { title: "Interviews", href: "/recruiter/interviews", icon: Calendar },
      { title: "Assessments", href: "/recruiter/assessments", icon: Code2 },
      { title: "Offers", href: "/recruiter/offers", icon: Award },
    ],
  },
  {
    label: "Company",
    items: [
      { title: "Company Profile", href: "/recruiter/profile", icon: Building2 },
      { title: "Notifications", href: "/recruiter/notifications", icon: Bell },
      { title: "Settings", href: "/recruiter/settings", icon: Settings },
    ],
  },
]

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const isCandidate = pathname.startsWith("/candidate")
  const navGroups = isCandidate ? candidateNavGroups : employerNavGroups


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
            <span className="text-white font-black text-sm">H</span>
          </div>
          <span className="font-extrabold text-base">
            Hire<span className="text-primary">Loop</span>
          </span>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b bg-muted/30">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
          isCandidate
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
        )}>
          {isCandidate ? <UserCircle className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
          {isCandidate ? "Candidate" : "Employer"} Portal
        </span>
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
                const active = (item as any).exact
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
        <SidebarUser />
        <LogoutButton />
      </div>
    </div>
  )
}

function SidebarUser() {
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    // Re-read from localStorage on every mount so a new login is always reflected.
    setUser(getCurrentUser())
  }, [])

  const initial = user?.name?.[0]?.toUpperCase() ?? "U"
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60 cursor-pointer transition-colors">
      <div className="h-8 w-8 rounded-full gradient-violet flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{user?.name ?? "User"}</p>
        <p className="text-xs text-muted-foreground truncate capitalize">{user?.role ?? ""}</p>
      </div>
    </div>
  )
}

function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await authService.logout()
    } catch {
      // ignore — still clear local session
    } finally {
      clearAuthSession()
      router.push("/login")
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-1 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>Log out</span>
    </button>
  )
}
