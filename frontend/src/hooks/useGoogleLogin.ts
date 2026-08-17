"use client"

import { useEffect, useCallback } from "react"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          renderButton: (element: HTMLElement, config: object) => void
          cancel: () => void
          revoke: (hint: string, done: () => void) => void
        }
      }
    }
  }
}

interface UseGoogleLoginOptions {
  onSuccess: (idToken: string) => void
  onError: (error: string) => void
}

export function useGoogleLogin({ onSuccess, onError }: UseGoogleLoginOptions) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return

    // Load GIS script if not already loaded
    if (!document.getElementById("google-gis-script")) {
      const script = document.createElement("script")
      script.id = "google-gis-script"
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [clientId])

  const signIn = useCallback(() => {
    if (!clientId) {
      onError("Google Sign-In is not configured. Please contact support.")
      return
    }

    const waitForGoogle = (attempt = 0) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string; error?: string }) => {
            if (response.credential) {
              onSuccess(response.credential)
            } else {
              onError("Google Sign-In was cancelled or failed.")
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Prompt was blocked — fall back to renderButton approach  
            onError("Google Sign-In popup was blocked. Please allow popups for this site.")
          }
        })
      } else if (attempt < 20) {
        setTimeout(() => waitForGoogle(attempt + 1), 200)
      } else {
        onError("Google Sign-In failed to load. Please try again.")
      }
    }

    waitForGoogle()
  }, [clientId, onSuccess, onError])

  return { signIn, isConfigured: Boolean(clientId) }
}
