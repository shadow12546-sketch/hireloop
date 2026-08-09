"use client"

import * as React from "react"
import { Bell, Search, Sun, Moon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import Link from "next/link"

interface TopNavProps {
  onMenuOpen?: () => void
}

export function TopNav({ onMenuOpen }: TopNavProps) {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex h-16 items-center gap-3 px-4 sm:px-6 border-b bg-background/95 backdrop-blur-sm shrink-0 sticky top-0 z-30">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl md:hidden shrink-0"
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 h-9 rounded-xl bg-muted/50 border-transparent focus:border-input"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-xl"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Home */}
        <Link href="/" className="ml-1">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold hidden sm:inline-flex">
            Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
