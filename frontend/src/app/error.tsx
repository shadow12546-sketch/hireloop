"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertOctagon } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In a real app, log this to an error reporting service like Sentry
    console.error("Global Error Caught:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertOctagon className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error while trying to load this page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-destructive/80 mt-4 p-2 bg-destructive/10 rounded-md break-all">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={reset} className="w-full sm:w-auto h-11 px-8 rounded-xl">
            Try Again
          </Button>
          <Button variant="outline" render={<Link href="/" />} className="w-full sm:w-auto h-11 px-8 rounded-xl">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
