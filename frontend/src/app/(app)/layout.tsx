"use client"

import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { MobileNav } from "@/components/layout/MobileNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
