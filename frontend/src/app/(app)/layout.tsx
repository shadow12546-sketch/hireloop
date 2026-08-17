"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { MobileNav } from "@/components/layout/MobileNav"
import { isLoggedIn, getCurrentUser } from "@/lib/auth"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login")
      return
    }

    const user = getCurrentUser()
    const userRole = (user?.role || "").toLowerCase()
    const isEmployerRole = userRole === "employer" || userRole === "recruiter"

    if (pathname.startsWith("/recruiter") && !isEmployerRole) {
      router.push("/candidate")
      return
    }

    if (pathname.startsWith("/candidate") && isEmployerRole) {
      router.push("/recruiter")
      return
    }

    setAuthorized(true)
  }, [pathname, router])

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex w-64 shrink-0" />

        {/* Mobile drawer */}
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Main content */}
        <div className="flex flex-col flex-1 w-full min-w-0">
          <TopNav onMenuOpen={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
