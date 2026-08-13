/**
 * API Client — Single source of truth for all HTTP calls.
 *
 * DEPENDENCY: Requires NEXT_PUBLIC_API_URL to be set in .env.local.
 * When NEXT_PUBLIC_USE_MOCK=true (or API_URL is empty), all service
 * files fall back to their local mock data automatically.
 *
 * DO NOT instantiate fetch directly in components or pages.
 * Always go through a service, which uses this client.
 *
 * Architecture:
 *   Component / Page
 *     └── useXxx hook  (optional, for complex state)
 *           └── xxxService.ts
 *                 └── apiClient  ← you are here
 *                       └── Backend REST API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""
export const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true" || !API_URL

// ─── Request helpers ──────────────────────────────────────────────────────────

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error")
    throw new Error(`API ${res.status}: ${text}`)
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}

// ─── Exported API client ──────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "GET", ...init }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body, ...init }),

  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PUT", body, ...init }),

  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PATCH", body, ...init }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...init }),
}
