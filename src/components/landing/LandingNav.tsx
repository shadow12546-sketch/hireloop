"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  {
    label: "Opportunities",
    sub: ["Jobs", "Internships"],
  },
  {
    label: "For Recruiters",
    sub: ["Post a Job", "Talent Search", "Assessment Tool"],
  },
  { label: "Leaderboard", href: "/#" },
  { label: "Blog", href: "/#" },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/95 dark:bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 gradient-violet rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">H</span>
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">
            Hire<span className="text-primary">Loop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) =>
            l.sub ? (
              <div key={l.label} className="group relative">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors">
                  {l.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border bg-white dark:bg-card shadow-xl p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                  {l.sub.map((s) => (
                    <Link
                      key={s}
                      href="/#"
                      className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={l.label}
                href={l.href!}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="shrink-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-medium">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="gradient-violet border-none text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Sign Up Free
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden border-t bg-background overflow-hidden transition-all duration-200",
          open ? "max-h-80" : "max-h-0 border-none"
        )}
      >
        <div className="p-4 space-y-1">
          {navLinks.map((l) => (
            <div key={l.label}>
              <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                {l.label}
              </p>
              {l.sub?.map((s) => (
                <Link
                  key={s}
                  href="/#"
                  onClick={() => setOpen(false)}
                  className="block px-6 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {s}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-2 border-t flex gap-2">
            <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">Log In</Button>
            </Link>
            <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
              <Button className="w-full gradient-violet border-none text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
