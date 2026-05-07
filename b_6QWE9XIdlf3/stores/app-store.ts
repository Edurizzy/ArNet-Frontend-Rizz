'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NavigationRoute, SystemStatus, User } from '@/types/domain'

// Layout state store with persistence
interface LayoutState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'arnet-layout',
    }
  )
)

// Navigation state store
interface NavigationState {
  currentRoute: NavigationRoute
  setCurrentRoute: (route: NavigationRoute) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentRoute: 'dashboard',
  setCurrentRoute: (route) => set({ currentRoute: route }),
}))

// System status store (prepared for WebSocket updates)
interface SystemStatusState {
  status: SystemStatus | null
  isConnecting: boolean
  setStatus: (status: SystemStatus) => void
  setConnecting: (connecting: boolean) => void
}

export const useSystemStatusStore = create<SystemStatusState>((set) => ({
  status: null,
  isConnecting: true,
  setStatus: (status) => set({ status, isConnecting: false }),
  setConnecting: (isConnecting) => set({ isConnecting }),
}))

// User session store (prepared for future auth)
interface SessionState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// Command palette state (prepared for future keyboard shortcuts)
interface CommandPaletteState {
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
