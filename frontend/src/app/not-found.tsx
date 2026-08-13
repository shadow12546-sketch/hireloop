import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinOff } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
          <MapPinOff className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        <div className="pt-4">
          <Button render={<Link href="/" />} className="h-11 px-8 rounded-xl">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
