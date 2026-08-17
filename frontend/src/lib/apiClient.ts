import { getAccessToken, clearAuthSession } from "./auth"

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api"

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  responseType?: "json" | "blob"
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, responseType = "json", ...rest } = options

  const headers = new Headers(rest.headers)

  if (!(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAccessToken()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body:
      body !== undefined
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
  })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearAuthSession()

      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login"
      }
    }

    const text = await res.text().catch(() => "")

    let message = text

    try {
      const json = JSON.parse(text)
      message = json.message || json.error || text
    } catch {
      // Keep raw response text
    }

    throw new Error(
      message || `Request failed with status ${res.status}`
    )
  }

  if (responseType === "blob") {
    return (await res.blob()) as T
  }

  if (res.status === 204) {
    return {} as T
  }

  const text = await res.text()

  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error("Invalid JSON response from server.")
  }
}

export const apiClient = {
  get: <T>(
    path: string,
    init?: RequestInit & { responseType?: "json" | "blob" }
  ) =>
    request<T>(path, {
      method: "GET",
      ...init,
    }),

  post: <T>(
    path: string,
    body: unknown,
    init?: RequestInit & { responseType?: "json" | "blob" }
  ) =>
    request<T>(path, {
      method: "POST",
      body,
      ...init,
    }),

  put: <T>(
    path: string,
    body: unknown,
    init?: RequestInit & { responseType?: "json" | "blob" }
  ) =>
    request<T>(path, {
      method: "PUT",
      body,
      ...init,
    }),

  patch: <T>(
    path: string,
    body: unknown,
    init?: RequestInit & { responseType?: "json" | "blob" }
  ) =>
    request<T>(path, {
      method: "PATCH",
      body,
      ...init,
    }),

  delete: <T>(
    path: string,
    init?: RequestInit & { responseType?: "json" | "blob" }
  ) =>
    request<T>(path, {
      method: "DELETE",
      ...init,
    }),
}