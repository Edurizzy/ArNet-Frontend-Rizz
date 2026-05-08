'use client'

import { create } from 'zustand'
import type { 
  Organization,
  TeamMember,
  RBACRole,
  PermissionMatrix,
  ApiKey,
  AuditLog,
  AuditLogFilters,
  ActiveSession,
  SecurityEvent,
  FeatureFlag,
  PendingInvitation,
  TeamMemberFilters,
  ApiKeyFilters,
  SettingsPageId,
  AsyncState,
  BulkTeamAction,
} from '@/types/settings'

// Settings Navigation Store
interface SettingsNavigationState {
  currentPage: SettingsPageId
  sidebarOpen: boolean
  setCurrentPage: (page: SettingsPageId) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useSettingsNavigationStore = create<SettingsNavigationState>((set) => ({
  currentPage: 'profile',
  sidebarOpen: true,
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// Organization & Profile Store
interface OrganizationState {
  organization: AsyncState<Organization>
  currentUser: AsyncState<TeamMember>
  
  // Actions
  fetchOrganization: () => Promise<void>
  updateOrganization: (updates: any) => Promise<void>
  fetchCurrentUser: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  
  // Reset
  reset: () => void
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organization: { status: 'idle' },
  currentUser: { status: 'idle' },
  
  fetchOrganization: async () => {
    set({ organization: { status: 'loading' } })
    try {
      const { fetchOrganization } = await import('@/services/settings-api')
      const data = await fetchOrganization()
      set({ organization: { status: 'success', data } })
    } catch (error) {
      set({ organization: { status: 'error', error: String(error) } })
    }
  },
  
  updateOrganization: async (updates) => {
    const currentState = get().organization
    if (currentState.status !== 'success') return
    
    set({ organization: { status: 'loading' } })
    try {
      const { updateOrganization } = await import('@/services/settings-api')
      const data = await updateOrganization(updates)
      set({ organization: { status: 'success', data } })
    } catch (error) {
      set({ organization: { status: 'error', error: String(error) } })
    }
  },
  
  fetchCurrentUser: async () => {
    set({ currentUser: { status: 'loading' } })
    try {
      const { fetchCurrentUser } = await import('@/services/settings-api')
      const data = await fetchCurrentUser()
      set({ currentUser: { status: 'success', data } })
    } catch (error) {
      set({ currentUser: { status: 'error', error: String(error) } })
    }
  },
  
  updateProfile: async (updates) => {
    const currentState = get().currentUser
    if (currentState.status !== 'success') return
    
    set({ currentUser: { status: 'loading' } })
    try {
      const { updateProfile } = await import('@/services/settings-api')
      const data = await updateProfile(updates)
      set({ currentUser: { status: 'success', data } })
    } catch (error) {
      set({ currentUser: { status: 'error', error: String(error) } })
    }
  },
  
  reset: () => set({
    organization: { status: 'idle' },
    currentUser: { status: 'idle' },
  }),
}))

// Team Members Store
interface TeamMembersState {
  members: AsyncState<TeamMember[]>
  filters: TeamMemberFilters
  selectedMemberIds: Set<string>
  inviteDialogOpen: boolean
  bulkActionInProgress: BulkTeamAction | null
  pendingInvitations: PendingInvitation[]
  
  // Actions
  fetchMembers: () => Promise<void>
  inviteMember: (payload: any) => Promise<void>
  changeRole: (userId: string, roleId: string, reason?: string) => Promise<void>
  suspendMember: (userId: string) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  bulkAction: (action: BulkTeamAction) => Promise<void>
  
  // Filters
  setFilters: (filters: Partial<TeamMemberFilters>) => void
  resetFilters: () => void
  
  // Selection
  toggleSelection: (memberId: string) => void
  selectAll: () => void
  clearSelection: () => void
  
  // UI State
  setInviteDialogOpen: (open: boolean) => void
  
  // Reset
  reset: () => void
}

const defaultTeamFilters: TeamMemberFilters = {
  search: '',
}

export const useTeamMembersStore = create<TeamMembersState>((set, get) => ({
  members: { status: 'idle' },
  filters: defaultTeamFilters,
  selectedMemberIds: new Set(),
  inviteDialogOpen: false,
  bulkActionInProgress: null,
  pendingInvitations: [],
  
  fetchMembers: async () => {
    set({ members: { status: 'loading' } })
    try {
      const { fetchTeamMembers } = await import('@/services/settings-api')
      const data = await fetchTeamMembers(get().filters)
      set({ members: { status: 'success', data } })
    } catch (error) {
      set({ members: { status: 'error', error: String(error) } })
    }
  },
  
  inviteMember: async (payload) => {
    try {
      const { inviteTeamMember } = await import('@/services/settings-api')
      const invitation = await inviteTeamMember(payload)
      set((state) => ({
        pendingInvitations: [...state.pendingInvitations, invitation],
        inviteDialogOpen: false,
      }))
      // Refresh members list
      get().fetchMembers()
    } catch (error) {
      throw error // Re-throw to be handled by form
    }
  },
  
  changeRole: async (userId, roleId, reason) => {
    try {
      const { changeUserRole } = await import('@/services/settings-api')
      await changeUserRole({ userId, roleId, reason })
      // Refresh members list
      get().fetchMembers()
    } catch (error) {
      throw error
    }
  },
  
  suspendMember: async (userId) => {
    try {
      const { suspendTeamMember } = await import('@/services/settings-api')
      await suspendTeamMember(userId)
      get().fetchMembers()
    } catch (error) {
      throw error
    }
  },
  
  removeMember: async (userId) => {
    try {
      const { removeTeamMember } = await import('@/services/settings-api')
      await removeTeamMember(userId)
      get().fetchMembers()
      // Remove from selection if selected
      set((state) => {
        const newSet = new Set(state.selectedMemberIds)
        newSet.delete(userId)
        return { selectedMemberIds: newSet }
      })
    } catch (error) {
      throw error
    }
  },
  
  bulkAction: async (action) => {
    set({ bulkActionInProgress: action })
    try {
      const { bulkTeamAction } = await import('@/services/settings-api')
      await bulkTeamAction(action)
      get().fetchMembers()
      set({ selectedMemberIds: new Set(), bulkActionInProgress: null })
    } catch (error) {
      set({ bulkActionInProgress: null })
      throw error
    }
  },
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({ filters: defaultTeamFilters }),
  
  toggleSelection: (memberId) => set((state) => {
    const newSet = new Set(state.selectedMemberIds)
    if (newSet.has(memberId)) {
      newSet.delete(memberId)
    } else {
      newSet.add(memberId)
    }
    return { selectedMemberIds: newSet }
  }),
  
  selectAll: () => set((state) => {
    if (state.members.status === 'success') {
      const allIds = state.members.data.map(m => m.id)
      return { selectedMemberIds: new Set(allIds) }
    }
    return {}
  }),
  
  clearSelection: () => set({ selectedMemberIds: new Set() }),
  
  setInviteDialogOpen: (inviteDialogOpen) => set({ inviteDialogOpen }),
  
  reset: () => set({
    members: { status: 'idle' },
    filters: defaultTeamFilters,
    selectedMemberIds: new Set(),
    inviteDialogOpen: false,
    bulkActionInProgress: null,
    pendingInvitations: [],
  }),
}))

// Role Management Store
interface RoleManagementState {
  roles: AsyncState<RBACRole[]>
  permissionMatrix: AsyncState<PermissionMatrix[]>
  
  // Actions
  fetchRoles: () => Promise<void>
  fetchPermissionMatrix: () => Promise<void>
  
  // Reset
  reset: () => void
}

export const useRoleManagementStore = create<RoleManagementState>((set) => ({
  roles: { status: 'idle' },
  permissionMatrix: { status: 'idle' },
  
  fetchRoles: async () => {
    set({ roles: { status: 'loading' } })
    try {
      const { fetchRoles } = await import('@/services/settings-api')
      const data = await fetchRoles()
      set({ roles: { status: 'success', data } })
    } catch (error) {
      set({ roles: { status: 'error', error: String(error) } })
    }
  },
  
  fetchPermissionMatrix: async () => {
    set({ permissionMatrix: { status: 'loading' } })
    try {
      const { fetchPermissionMatrix } = await import('@/services/settings-api')
      const data = await fetchPermissionMatrix()
      set({ permissionMatrix: { status: 'success', data } })
    } catch (error) {
      set({ permissionMatrix: { status: 'error', error: String(error) } })
    }
  },
  
  reset: () => set({
    roles: { status: 'idle' },
    permissionMatrix: { status: 'idle' },
  }),
}))

// API Keys Store
interface ApiKeysState {
  apiKeys: AsyncState<ApiKey[]>
  filters: ApiKeyFilters
  createDialogOpen: boolean
  selectedKeyIds: Set<string>
  revealedKeys: Set<string>
  
  // Actions
  fetchApiKeys: () => Promise<void>
  createApiKey: (payload: any) => Promise<{ apiKey: ApiKey; secretKey: string }>
  revokeApiKey: (keyId: string) => Promise<void>
  rotateApiKey: (keyId: string) => Promise<{ apiKey: ApiKey; secretKey: string }>
  
  // Filters
  setFilters: (filters: Partial<ApiKeyFilters>) => void
  resetFilters: () => void
  
  // UI State
  setCreateDialogOpen: (open: boolean) => void
  toggleKeyRevealed: (keyId: string) => void
  
  // Selection
  toggleSelection: (keyId: string) => void
  clearSelection: () => void
  
  // Reset
  reset: () => void
}

const defaultApiKeyFilters: ApiKeyFilters = {}

export const useApiKeysStore = create<ApiKeysState>((set, get) => ({
  apiKeys: { status: 'idle' },
  filters: defaultApiKeyFilters,
  createDialogOpen: false,
  selectedKeyIds: new Set(),
  revealedKeys: new Set(),
  
  fetchApiKeys: async () => {
    set({ apiKeys: { status: 'loading' } })
    try {
      const { fetchApiKeys } = await import('@/services/settings-api')
      const data = await fetchApiKeys(get().filters)
      set({ apiKeys: { status: 'success', data } })
    } catch (error) {
      set({ apiKeys: { status: 'error', error: String(error) } })
    }
  },
  
  createApiKey: async (payload) => {
    try {
      const { createApiKey } = await import('@/services/settings-api')
      const result = await createApiKey(payload)
      get().fetchApiKeys() // Refresh list
      set({ createDialogOpen: false })
      return result
    } catch (error) {
      throw error
    }
  },
  
  revokeApiKey: async (keyId) => {
    try {
      const { revokeApiKey } = await import('@/services/settings-api')
      await revokeApiKey(keyId)
      get().fetchApiKeys()
      // Remove from selection if selected
      set((state) => {
        const newSet = new Set(state.selectedKeyIds)
        newSet.delete(keyId)
        return { selectedKeyIds: newSet }
      })
    } catch (error) {
      throw error
    }
  },
  
  rotateApiKey: async (keyId) => {
    try {
      const { rotateApiKey } = await import('@/services/settings-api')
      const result = await rotateApiKey(keyId)
      get().fetchApiKeys()
      return result
    } catch (error) {
      throw error
    }
  },
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({ filters: defaultApiKeyFilters }),
  
  setCreateDialogOpen: (createDialogOpen) => set({ createDialogOpen }),
  
  toggleKeyRevealed: (keyId) => set((state) => {
    const newSet = new Set(state.revealedKeys)
    if (newSet.has(keyId)) {
      newSet.delete(keyId)
    } else {
      newSet.add(keyId)
    }
    return { revealedKeys: newSet }
  }),
  
  toggleSelection: (keyId) => set((state) => {
    const newSet = new Set(state.selectedKeyIds)
    if (newSet.has(keyId)) {
      newSet.delete(keyId)
    } else {
      newSet.add(keyId)
    }
    return { selectedKeyIds: newSet }
  }),
  
  clearSelection: () => set({ selectedKeyIds: new Set() }),
  
  reset: () => set({
    apiKeys: { status: 'idle' },
    filters: defaultApiKeyFilters,
    createDialogOpen: false,
    selectedKeyIds: new Set(),
    revealedKeys: new Set(),
  }),
}))

// Audit Logs Store
interface AuditLogsState {
  auditLogs: AsyncState<{ logs: AuditLog[]; total: number }>
  filters: AuditLogFilters
  selectedLogIds: Set<string>
  expandedLogs: Set<string>
  
  // Actions
  fetchAuditLogs: () => Promise<void>
  
  // Filters
  setFilters: (filters: Partial<AuditLogFilters>) => void
  resetFilters: () => void
  
  // UI State
  toggleLogExpanded: (logId: string) => void
  
  // Selection
  toggleSelection: (logId: string) => void
  clearSelection: () => void
  
  // Reset
  reset: () => void
}

const defaultAuditFilters: AuditLogFilters = {}

export const useAuditLogsStore = create<AuditLogsState>((set, get) => ({
  auditLogs: { status: 'idle' },
  filters: defaultAuditFilters,
  selectedLogIds: new Set(),
  expandedLogs: new Set(),
  
  fetchAuditLogs: async () => {
    set({ auditLogs: { status: 'loading' } })
    try {
      const { fetchAuditLogs } = await import('@/services/settings-api')
      const data = await fetchAuditLogs(get().filters)
      set({ auditLogs: { status: 'success', data } })
    } catch (error) {
      set({ auditLogs: { status: 'error', error: String(error) } })
    }
  },
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({ filters: defaultAuditFilters }),
  
  toggleLogExpanded: (logId) => set((state) => {
    const newSet = new Set(state.expandedLogs)
    if (newSet.has(logId)) {
      newSet.delete(logId)
    } else {
      newSet.add(logId)
    }
    return { expandedLogs: newSet }
  }),
  
  toggleSelection: (logId) => set((state) => {
    const newSet = new Set(state.selectedLogIds)
    if (newSet.has(logId)) {
      newSet.delete(logId)
    } else {
      newSet.add(logId)
    }
    return { selectedLogIds: newSet }
  }),
  
  clearSelection: () => set({ selectedLogIds: new Set() }),
  
  reset: () => set({
    auditLogs: { status: 'idle' },
    filters: defaultAuditFilters,
    selectedLogIds: new Set(),
    expandedLogs: new Set(),
  }),
}))

// Session Management Store
interface SessionManagementState {
  activeSessions: AsyncState<ActiveSession[]>
  selectedSessionIds: Set<string>
  revokeInProgress: Set<string>
  
  // Actions
  fetchActiveSessions: () => Promise<void>
  revokeSession: (sessionId: string) => Promise<void>
  revokeAllSessions: () => Promise<void>
  
  // Selection
  toggleSelection: (sessionId: string) => void
  clearSelection: () => void
  
  // Reset
  reset: () => void
}

export const useSessionManagementStore = create<SessionManagementState>((set, get) => ({
  activeSessions: { status: 'idle' },
  selectedSessionIds: new Set(),
  revokeInProgress: new Set(),
  
  fetchActiveSessions: async () => {
    set({ activeSessions: { status: 'loading' } })
    try {
      const { fetchActiveSessions } = await import('@/services/settings-api')
      const data = await fetchActiveSessions()
      set({ activeSessions: { status: 'success', data } })
    } catch (error) {
      set({ activeSessions: { status: 'error', error: String(error) } })
    }
  },
  
  revokeSession: async (sessionId) => {
    set((state) => ({
      revokeInProgress: new Set([...state.revokeInProgress, sessionId])
    }))
    try {
      const { revokeSession } = await import('@/services/settings-api')
      await revokeSession(sessionId)
      get().fetchActiveSessions()
    } catch (error) {
      throw error
    } finally {
      set((state) => {
        const newSet = new Set(state.revokeInProgress)
        newSet.delete(sessionId)
        return { revokeInProgress: newSet }
      })
    }
  },
  
  revokeAllSessions: async () => {
    try {
      const { revokeAllSessions } = await import('@/services/settings-api')
      await revokeAllSessions()
      get().fetchActiveSessions()
    } catch (error) {
      throw error
    }
  },
  
  toggleSelection: (sessionId) => set((state) => {
    const newSet = new Set(state.selectedSessionIds)
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId)
    } else {
      newSet.add(sessionId)
    }
    return { selectedSessionIds: newSet }
  }),
  
  clearSelection: () => set({ selectedSessionIds: new Set() }),
  
  reset: () => set({
    activeSessions: { status: 'idle' },
    selectedSessionIds: new Set(),
    revokeInProgress: new Set(),
  }),
}))

// Security Events Store (for future use)
interface SecurityEventsState {
  securityEvents: AsyncState<SecurityEvent[]>
  selectedEventIds: Set<string>
  
  // Actions
  fetchSecurityEvents: () => Promise<void>
  
  // Selection
  toggleSelection: (eventId: string) => void
  clearSelection: () => void
  
  // Reset
  reset: () => void
}

export const useSecurityEventsStore = create<SecurityEventsState>((set) => ({
  securityEvents: { status: 'idle' },
  selectedEventIds: new Set(),
  
  fetchSecurityEvents: async () => {
    set({ securityEvents: { status: 'loading' } })
    try {
      // TODO: Implement when backend is ready
      const mockEvents: SecurityEvent[] = []
      set({ securityEvents: { status: 'success', data: mockEvents } })
    } catch (error) {
      set({ securityEvents: { status: 'error', error: String(error) } })
    }
  },
  
  toggleSelection: (eventId) => set((state) => {
    const newSet = new Set(state.selectedEventIds)
    if (newSet.has(eventId)) {
      newSet.delete(eventId)
    } else {
      newSet.add(eventId)
    }
    return { selectedEventIds: newSet }
  }),
  
  clearSelection: () => set({ selectedEventIds: new Set() }),
  
  reset: () => set({
    securityEvents: { status: 'idle' },
    selectedEventIds: new Set(),
  }),
}))

// Master Settings Store Reset (for cleanup)
export const useSettingsStoreReset = () => {
  const resetNavigation = useSettingsNavigationStore(state => state.setSidebarOpen)
  const resetOrganization = useOrganizationStore(state => state.reset)
  const resetTeamMembers = useTeamMembersStore(state => state.reset)
  const resetRoleManagement = useRoleManagementStore(state => state.reset)
  const resetApiKeys = useApiKeysStore(state => state.reset)
  const resetAuditLogs = useAuditLogsStore(state => state.reset)
  const resetSessionManagement = useSessionManagementStore(state => state.reset)
  const resetSecurityEvents = useSecurityEventsStore(state => state.reset)
  
  return () => {
    resetOrganization()
    resetTeamMembers()
    resetRoleManagement()
    resetApiKeys()
    resetAuditLogs()
    resetSessionManagement()
    resetSecurityEvents()
    resetNavigation(true) // Reset sidebar to open
  }
}