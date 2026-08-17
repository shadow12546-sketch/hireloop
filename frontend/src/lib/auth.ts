/**
 * auth.ts — Central token store for HireLoop frontend.
 *
 * The backend returns { accessToken, refreshToken, user } on login/register/googleAuth.
 * This module persists them in localStorage and exposes helpers used by apiClient
 * and any page that needs the current user.
 */

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const USER_KEY = "currentUser"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  [key: string]: unknown
}

/** Save tokens + user object after a successful auth response. */
export function saveAuthSession(data: {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
}) {
  if (typeof window === "undefined") return
  if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
  if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

/** Clear all auth data (logout). */
export function clearAuthSession() {
  if (typeof window === "undefined") return
  // Remove the user-scoped profile cache before wiping the user ID.
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      const user = JSON.parse(raw) as AuthUser
      if (user?.id) {
        localStorage.removeItem(`candidate_profile_cache_${user.id}`)
      }
    }
  } catch {
    // If parsing fails just skip — the cache will naturally be unused
    // because the new user will have a different scoped key.
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Get the stored access token. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** Get the stored refresh token. */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** Get the current user from localStorage. Returns null if not logged in. */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

/** Returns true if there is an active session (access token present). */
export function isLoggedIn(): boolean {
  return Boolean(getAccessToken())
}

/**
 * Extracts the auth session payload from a backend response.
 * The backend wraps data inside { success, data: { user, accessToken, refreshToken } }.
 */
export function extractAndSaveSession(response: any) {
  // Handle both shapes: response.data.{ user, accessToken } or response.{ user, accessToken }
  const payload = response?.data ?? response
  saveAuthSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  })
  return payload
}
