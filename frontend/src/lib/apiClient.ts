const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

export const IS_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" || !API_URL

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...rest } = options

  const headers = new Headers(rest.headers)

  // Do not set Content-Type manually for FormData.
  // The browser automatically sets multipart/form-data with the boundary.
  if (!(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  // Add access token for authenticated backend routes
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token")

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
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
    const text = await res.text().catch(() => "Unknown error")
    throw new Error(`API ${res.status}: ${text}`)
  }

  if (res.status === 204) {
    return {} as T
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, {
      method: "GET",
      ...init,
    }),

  post: <T>(
    path: string,
    body: unknown,
    init?: RequestInit
  ) =>
    request<T>(path, {
      method: "POST",
      body,
      ...init,
    }),

  put: <T>(
    path: string,
    body: unknown,
    init?: RequestInit
  ) =>
    request<T>(path, {
      method: "PUT",
      body,
      ...init,
    }),

  patch: <T>(
    path: string,
    body: unknown,
    init?: RequestInit
  ) =>
    request<T>(path, {
      method: "PATCH",
      body,
      ...init,
    }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, {
      method: "DELETE",
      ...init,
    }),
}
