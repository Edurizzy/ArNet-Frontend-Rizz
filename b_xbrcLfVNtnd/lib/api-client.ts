'use client'

import { useAuthStore, type AuthUser } from '@/stores/useAuthStore'

type ApiRequestConfig = RequestInit & {
  _retry?: boolean
}

type ApiResponse<T> = {
  data: T
  status: number
}

interface LoginResponse {
  user: {
    id: string
    email: string
    name?: string
    full_name?: string
    display_name?: string
    organization_id?: string
    organizationId?: string
    role?: string
  }
  access: string
  refresh: string
}

interface RefreshResponse {
  access: string
}

class ApiClientError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:8000/api/v1'

let refreshPromise: Promise<string | null> | null = null

function normalizeUser(user: LoginResponse['user']): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.full_name ?? user.display_name ?? user.email,
    organizationId: user.organization_id ?? user.organizationId ?? '',
    role: user.role ?? 'member',
  }
}

function isAuthEndpoint(path: string) {
  return path.includes('/iam/login/') || path.includes('/iam/token/refresh/') || path.includes('/iam/refresh/')
}

function buildHeaders(config: ApiRequestConfig, withAuth: boolean) {
  const headers = new Headers(config.headers)

  headers.set('Accept', 'application/json')
  if (!(config.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = useAuthStore.getState().accessToken
  if (withAuth && token) headers.set('Authorization', `Bearer ${token}`)

  return headers
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/login') return
  window.location.assign('/login')
}

async function handleAuthFailure() {
  useAuthStore.getState().clearAuth()
  const { helpdeskSocket } = await import('@/lib/realtime/helpdesk-socket')
  helpdeskSocket.forceDisconnect()
  redirectToLogin()
}

async function request<T>(path: string, config: ApiRequestConfig = {}, withAuth = true): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...config,
    headers: buildHeaders(config, withAuth),
  })
  const data = await parseResponse(response)

  if (response.ok) {
    return { data: data as T, status: response.status }
  }

  if (withAuth && response.status === 401 && !config._retry && !isAuthEndpoint(path)) {
    const nextAccessToken = await refreshAccessTokenWithLock()
    if (!nextAccessToken) {
      await handleAuthFailure()
      throw new ApiClientError(response.status, data)
    }

    return request<T>(path, { ...config, _retry: true }, withAuth)
  }

  throw new ApiClientError(response.status, data)
}

export const apiClient = {
  get: <T>(path: string, config: ApiRequestConfig = {}) => request<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config: ApiRequestConfig = {}) =>
    request<T>(path, {
      ...config,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  patch: <T>(path: string, body?: unknown, config: ApiRequestConfig = {}) =>
    request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  delete: <T>(path: string, config: ApiRequestConfig = {}) => request<T>(path, { ...config, method: 'DELETE' }),
}

export const publicApiClient = {
  post: <T>(path: string, body?: unknown, config: ApiRequestConfig = {}) =>
    request<T>(
      path,
      {
        ...config,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
      },
      false
    ),
}

export async function loginWithCredentials(email: string, password: string) {
  const response = await publicApiClient.post<LoginResponse>('/iam/login/', {
    email,
    password,
  })
  const payload = {
    user: normalizeUser(response.data.user),
    accessToken: response.data.access,
    refreshToken: response.data.refresh,
  }

  useAuthStore.getState().setAuth(payload)
  return payload.user
}

export async function refreshAccessTokenWithLock(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  const refreshToken: string | null = useAuthStore.getState().refreshToken
  if (!refreshToken) return null

  refreshPromise = publicApiClient
    .post<RefreshResponse>('/iam/token/refresh/', { refresh: refreshToken })
    .then((response) => {
      const current = useAuthStore.getState()
      if (!current.user || !current.refreshToken) return null

      current.setAuth({
        user: current.user,
        accessToken: response.data.access,
        refreshToken: current.refreshToken,
      })

      return response.data.access
    })
    .catch(async () => {
      await handleAuthFailure()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}
