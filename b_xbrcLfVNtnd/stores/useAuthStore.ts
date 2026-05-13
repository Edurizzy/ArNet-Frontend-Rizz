'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AuthStatus = 'idle' | 'hydrating' | 'authenticated' | 'anonymous' | 'refreshing'

export interface AuthUser {
  id: string
  email: string
  name: string
  organizationId: string
  role: string
}

interface AuthPayload {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  authStatus: AuthStatus
  setAuth: (payload: AuthPayload, options?: { broadcast?: boolean }) => void
  clearAuth: (options?: { broadcast?: boolean }) => void
  hydrateAuth: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

const AUTH_STORAGE_KEY = 'arnet-auth'
const AUTH_CHANNEL_NAME = 'arnet-auth-sync'

type AuthBroadcastMessage =
  | { type: 'auth:set'; payload: AuthPayload }
  | { type: 'auth:clear' }

let authChannel: BroadcastChannel | null = null
let crossTabSyncStarted = false

function getAuthChannel() {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null
  authChannel ??= new BroadcastChannel(AUTH_CHANNEL_NAME)
  return authChannel
}

function broadcastAuth(message: AuthBroadcastMessage) {
  getAuthChannel()?.postMessage(message)
}

export const useAuthStore = create<AuthState>()(
  persist<
    AuthState,
    [],
    [],
    Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'isAuthenticated'>
  >(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      authStatus: 'idle',

      setAuth: (payload, options = { broadcast: true }) => {
        set({
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          isAuthenticated: true,
          isHydrated: true,
          authStatus: 'authenticated',
        })

        if (options.broadcast) broadcastAuth({ type: 'auth:set', payload })
      },

      clearAuth: (options = { broadcast: true }) => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrated: true,
          authStatus: 'anonymous',
        })

        if (options.broadcast) broadcastAuth({ type: 'auth:clear' })
      },

      hydrateAuth: async (): Promise<void> => {
        if (get().isHydrated) return

        set({ authStatus: 'hydrating' })
        await Promise.resolve()

        const { accessToken, refreshToken, user } = get()
        const hasSession = Boolean(accessToken && refreshToken && user)

        set({
          isAuthenticated: hasSession,
          isHydrated: true,
          authStatus: hasSession ? 'authenticated' : 'anonymous',
        })
      },

      refreshAccessToken: async (): Promise<string | null> => {
        const { refreshAccessTokenWithLock } = await import('@/lib/api-client')
        return refreshAccessTokenWithLock()
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export function initAuthCrossTabSync() {
  if (crossTabSyncStarted || typeof window === 'undefined') return
  crossTabSyncStarted = true

  getAuthChannel()?.addEventListener('message', (event: MessageEvent<AuthBroadcastMessage>) => {
    if (event.data.type === 'auth:set') {
      useAuthStore.getState().setAuth(event.data.payload, { broadcast: false })
      return
    }

    useAuthStore.getState().clearAuth({ broadcast: false })
  })

  window.addEventListener('storage', (event) => {
    if (event.key !== AUTH_STORAGE_KEY) return

    if (!event.newValue) {
      useAuthStore.getState().clearAuth({ broadcast: false })
      return
    }

    void useAuthStore.getState().hydrateAuth()
  })
}
