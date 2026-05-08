// Settings & IAM Mock API Services for ArNet Enterprise Platform
import type { 
  Organization,
  OrganizationPlan,
  TeamMember,
  RBACRole,
  Permission,
  PermissionScope,
  PermissionAction,
  PermissionMatrix,
  ApiKey,
  CreateApiKeyPayload,
  AuditLog,
  AuditLogFilters,
  ActiveSession,
  SecurityEvent,
  FeatureFlag,
  InviteMemberPayload,
  PendingInvitation,
  UpdateProfilePayload,
  UpdateOrganizationPayload,
  ChangeRolePayload,
  BulkTeamAction,
  TeamMemberFilters,
  ApiKeyFilters,
  SecuritySettings,
} from '@/types/settings'

// Simulate realistic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to generate random data
const randomDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

const randomFromArray = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]

// Mock Organization Plans
const mockPlans: OrganizationPlan[] = [
  {
    id: 'trial',
    name: 'Teste Gratuito',
    tier: 'trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Até 2 usuários', 'Suporte básico', '1 AI Agent'],
    limits: {
      maxUsers: 2,
      maxAIAgents: 1,
      maxWebhooks: 1,
      maxApiCalls: 1000,
      storageGB: 1,
      auditRetentionDays: 7,
    },
    isActive: true,
  },
  {
    id: 'business',
    name: 'Business',
    tier: 'business',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    features: ['Até 50 usuários', 'Suporte prioritário', '10 AI Agents', 'API Webhooks', 'Auditoria'],
    limits: {
      maxUsers: 50,
      maxAIAgents: 10,
      maxWebhooks: 50,
      maxApiCalls: 100000,
      storageGB: 100,
      auditRetentionDays: 90,
    },
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: ['Usuários ilimitados', 'Suporte 24/7', 'AI Agents ilimitados', 'SSO', 'Auditoria completa'],
    limits: {
      maxUsers: -1,
      maxAIAgents: -1,
      maxWebhooks: -1,
      maxApiCalls: -1,
      storageGB: 1000,
      auditRetentionDays: 365,
    },
    isActive: true,
  },
]

// Mock System Roles
const mockSystemRoles: RBACRole[] = [
  {
    id: 'owner',
    name: 'Proprietário',
    description: 'Acesso completo à organização',
    level: 'owner',
    isSystemRole: true,
    memberCount: 1,
    createdAt: new Date('2023-01-01'),
    permissions: [
      {
        id: 'owner-all',
        scope: 'organization',
        actions: ['read', 'create', 'update', 'delete', 'manage'],
      },
    ],
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Gerenciar equipe, configurações e integrações',
    level: 'admin',
    isSystemRole: true,
    memberCount: 2,
    createdAt: new Date('2023-01-01'),
    permissions: [
      {
        id: 'admin-team',
        scope: 'team',
        actions: ['read', 'create', 'update', 'delete', 'invite', 'suspend'],
      },
      {
        id: 'admin-settings',
        scope: 'settings',
        actions: ['read', 'update'],
      },
    ],
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Supervisionar operações e acessar relatórios',
    level: 'manager',
    isSystemRole: true,
    memberCount: 5,
    createdAt: new Date('2023-01-01'),
    permissions: [
      {
        id: 'manager-atendimento',
        scope: 'atendimento',
        actions: ['read', 'update', 'manage'],
      },
      {
        id: 'manager-dashboard',
        scope: 'dashboard',
        actions: ['read', 'export'],
      },
    ],
  },
  {
    id: 'agent',
    name: 'Agente',
    description: 'Atender clientes e gerenciar tickets',
    level: 'agent',
    isSystemRole: true,
    memberCount: 12,
    createdAt: new Date('2023-01-01'),
    permissions: [
      {
        id: 'agent-atendimento',
        scope: 'atendimento',
        actions: ['read', 'update'],
      },
      {
        id: 'agent-clientes',
        scope: 'clientes',
        actions: ['read', 'update'],
      },
    ],
  },
  {
    id: 'viewer',
    name: 'Visualizador',
    description: 'Acesso somente leitura',
    level: 'viewer',
    isSystemRole: true,
    memberCount: 3,
    createdAt: new Date('2023-01-01'),
    permissions: [
      {
        id: 'viewer-dashboard',
        scope: 'dashboard',
        actions: ['read'],
      },
    ],
  },
]

// Mock Team Members
const generateMockTeamMembers = (): TeamMember[] => [
  {
    id: 'user-001',
    name: 'João Silva',
    email: 'joao.silva@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[0], // Owner
    status: 'active',
    lastLoginAt: new Date(),
    mfaEnabled: true,
    permissions: ['organization'],
    invitedAt: new Date('2023-01-01'),
    invitedBy: 'system',
    joinedAt: new Date('2023-01-01'),
    lastActiveAt: new Date(),
    sessionCount: 1,
  },
  {
    id: 'user-002',
    name: 'Maria Santos',
    email: 'maria.santos@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[1], // Admin
    status: 'active',
    lastLoginAt: randomDate(1),
    mfaEnabled: true,
    permissions: ['team', 'settings'],
    invitedAt: new Date('2023-02-15'),
    invitedBy: 'user-001',
    joinedAt: new Date('2023-02-16'),
    lastActiveAt: randomDate(1),
    sessionCount: 2,
  },
  {
    id: 'user-003',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[2], // Manager
    status: 'active',
    lastLoginAt: randomDate(2),
    mfaEnabled: false,
    permissions: ['atendimento', 'dashboard'],
    invitedAt: new Date('2023-03-01'),
    invitedBy: 'user-001',
    joinedAt: new Date('2023-03-02'),
    lastActiveAt: randomDate(2),
    sessionCount: 1,
  },
  {
    id: 'user-004',
    name: 'Ana Costa',
    email: 'ana.costa@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[3], // Agent
    status: 'active',
    lastLoginAt: randomDate(3),
    mfaEnabled: false,
    permissions: ['atendimento', 'clientes'],
    invitedAt: new Date('2023-04-10'),
    invitedBy: 'user-002',
    joinedAt: new Date('2023-04-11'),
    lastActiveAt: randomDate(3),
    sessionCount: 0,
  },
  {
    id: 'user-005',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[3], // Agent
    status: 'suspended',
    lastLoginAt: randomDate(30),
    mfaEnabled: false,
    permissions: ['atendimento'],
    invitedAt: new Date('2023-05-15'),
    invitedBy: 'user-002',
    joinedAt: new Date('2023-05-16'),
    lastActiveAt: randomDate(30),
    sessionCount: 0,
  },
  {
    id: 'user-006',
    name: 'Lucia Mendes',
    email: 'lucia.mendes@arnet.com.br',
    avatarUrl: undefined,
    role: mockSystemRoles[4], // Viewer
    status: 'pending',
    mfaEnabled: false,
    permissions: ['dashboard'],
    invitedAt: new Date(),
    invitedBy: 'user-001',
    sessionCount: 0,
  },
]

// Mock Organization
const mockOrganization: Organization = {
  id: 'org-arnet-001',
  name: 'ArNet Telecom',
  slug: 'arnet-telecom',
  logoUrl: undefined,
  domain: 'arnet.com.br',
  plan: mockPlans[1], // Business
  status: 'active',
  billingEmail: 'financeiro@arnet.com.br',
  maxSeats: 50,
  usedSeats: 6,
  settings: {
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    language: 'pt-BR',
    theme: 'dark',
    security: {
      requireMFA: false,
      sessionTimeoutMinutes: 480,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        maxAge: 90,
      },
      allowedDomains: ['arnet.com.br'],
      ipRestrictions: [],
      ssoEnabled: false,
    },
    notifications: {
      email: {
        securityAlerts: true,
        billingUpdates: true,
        systemMaintenance: true,
        teamChanges: true,
        auditSummary: false,
      },
      webhook: {
        enabled: false,
      },
      inApp: {
        securityAlerts: true,
        teamActivity: true,
        systemUpdates: true,
      },
    },
    features: {
      aiStudioAdvanced: true,
      automationEngine: true,
      customWebhooks: true,
      dataExport: true,
      ssoIntegration: false,
      auditRetention: true,
      apiRateLimiting: true,
      whiteLabeling: false,
      advancedAnalytics: true,
      multiTenant: false,
    },
  },
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date(),
}

// Mock API Keys
const generateMockApiKeys = (): ApiKey[] => [
  {
    id: 'key-001',
    name: 'Produção - Webhooks',
    description: 'Chave principal para webhooks em produção',
    keyPreview: '...7a9c',
    scopes: ['webhooks', 'atendimento'],
    environment: 'production',
    status: 'active',
    lastUsedAt: new Date(),
    usageCount: 15420,
    rateLimit: 1000,
    ipRestrictions: ['192.168.1.0/24'],
    createdAt: new Date('2023-06-01'),
    createdBy: 'user-001',
  },
  {
    id: 'key-002',
    name: 'Desenvolvimento - API',
    description: 'Chave para desenvolvimento local',
    keyPreview: '...3f2d',
    scopes: ['clientes', 'dashboard'],
    environment: 'development',
    status: 'active',
    lastUsedAt: randomDate(7),
    usageCount: 892,
    ipRestrictions: [],
    createdAt: new Date('2023-08-15'),
    createdBy: 'user-002',
  },
  {
    id: 'key-003',
    name: 'Integração Legada',
    keyPreview: '...9b1e',
    scopes: ['audit'],
    environment: 'production',
    status: 'revoked',
    lastUsedAt: new Date('2023-10-15'),
    usageCount: 5234,
    expiresAt: new Date('2024-01-01'),
    ipRestrictions: [],
    createdAt: new Date('2023-02-01'),
    createdBy: 'user-001',
  },
]

// Mock Audit Logs
const generateMockAuditLogs = (): AuditLog[] => {
  const actors = ['user-001', 'user-002', 'user-003']
  const actions = ['user.login', 'user.role.change', 'apikey.create', 'settings.update']
  const ips = ['192.168.1.100', '10.0.0.50', '203.0.113.1']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    timestamp: randomDate(30),
    actor: {
      type: 'user' as const,
      id: randomFromArray(actors),
      name: 'João Silva',
      email: 'joao.silva@arnet.com.br',
    },
    action: {
      type: randomFromArray(actions) as any,
      description: 'Ação executada pelo usuário',
      category: 'authentication' as const,
    },
    resource: {
      type: 'user',
      id: `user-${i}`,
      name: 'Recurso Exemplo',
    },
    metadata: {
      changes: [
        {
          field: 'role',
          oldValue: 'agent',
          newValue: 'manager',
        },
      ],
    },
    ipAddress: randomFromArray(ips),
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    correlationId: `corr-${Date.now()}-${i}`,
    status: Math.random() > 0.1 ? 'success' : 'failure',
    severity: randomFromArray(['low', 'medium', 'high']) as any,
  }))
}

// Mock Active Sessions
const generateMockSessions = (): ActiveSession[] => [
  {
    id: 'session-001',
    userId: 'user-001',
    deviceInfo: {
      type: 'desktop',
      os: 'macOS',
      browser: 'Chrome',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    ipAddress: '192.168.1.100',
    location: {
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    },
    startedAt: new Date(),
    lastActiveAt: new Date(),
    isCurrent: true,
    isTrusted: true,
    status: 'active',
  },
  {
    id: 'session-002',
    userId: 'user-001',
    deviceInfo: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
    },
    ipAddress: '203.0.113.50',
    location: {
      country: 'Brasil',
      region: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      timezone: 'America/Sao_Paulo',
    },
    startedAt: randomDate(3),
    lastActiveAt: randomDate(1),
    isCurrent: false,
    isTrusted: false,
    status: 'active',
  },
]

// In-memory data store
let teamMembers = generateMockTeamMembers()
let apiKeys = generateMockApiKeys()
let auditLogs = generateMockAuditLogs()
let activeSessions = generateMockSessions()

// Organization & Profile Services
export async function fetchOrganization(): Promise<Organization> {
  await delay(300 + Math.random() * 200)
  return mockOrganization
}

export async function updateOrganization(updates: UpdateOrganizationPayload): Promise<Organization> {
  await delay(500 + Math.random() * 300)
  // Simulate server-side validation
  if (!updates.name || updates.name.length < 2) {
    throw new Error('Nome da organização deve ter pelo menos 2 caracteres')
  }
  
  Object.assign(mockOrganization, updates)
  mockOrganization.updatedAt = new Date()
  return mockOrganization
}

export async function fetchCurrentUser(): Promise<TeamMember> {
  await delay(200 + Math.random() * 100)
  return teamMembers[0] // Current user is always the first one (owner)
}

export async function updateProfile(updates: UpdateProfilePayload): Promise<TeamMember> {
  await delay(400 + Math.random() * 200)
  const currentUser = teamMembers[0]
  Object.assign(currentUser, updates)
  return currentUser
}

// Team Management Services
export async function fetchTeamMembers(filters?: TeamMemberFilters): Promise<TeamMember[]> {
  await delay(400 + Math.random() * 300)
  
  let filtered = [...teamMembers]
  
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(member => 
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search)
    )
  }
  
  if (filters?.role && filters.role.length > 0) {
    filtered = filtered.filter(member => filters.role!.includes(member.role.id))
  }
  
  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter(member => filters.status!.includes(member.status))
  }
  
  return filtered
}

export async function inviteTeamMember(payload: InviteMemberPayload): Promise<PendingInvitation> {
  await delay(600 + Math.random() * 400)
  
  // Simulate validation
  if (teamMembers.some(m => m.email === payload.email)) {
    throw new Error('Este email já está em uso por outro membro da equipe')
  }
  
  const role = mockSystemRoles.find(r => r.id === payload.roleId)
  if (!role) {
    throw new Error('Cargo inválido')
  }
  
  const invitation: PendingInvitation = {
    id: `inv-${Date.now()}`,
    email: payload.email,
    roleId: payload.roleId,
    roleName: role.name,
    permissions: payload.permissions || [],
    message: payload.message,
    invitedBy: 'user-001',
    invitedByName: 'João Silva',
    status: 'pending',
    expiresAt: payload.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sentAt: new Date(),
    remindersSent: 0,
    token: `token-${Date.now()}`,
  }
  
  return invitation
}

export async function changeUserRole(payload: ChangeRolePayload): Promise<TeamMember> {
  await delay(500 + Math.random() * 300)
  
  const member = teamMembers.find(m => m.id === payload.userId)
  if (!member) {
    throw new Error('Membro não encontrado')
  }
  
  const role = mockSystemRoles.find(r => r.id === payload.roleId)
  if (!role) {
    throw new Error('Cargo inválido')
  }
  
  member.role = role
  return member
}

export async function suspendTeamMember(userId: string): Promise<TeamMember> {
  await delay(500 + Math.random() * 300)
  
  const member = teamMembers.find(m => m.id === userId)
  if (!member) {
    throw new Error('Membro não encontrado')
  }
  
  member.status = 'suspended'
  return member
}

export async function removeTeamMember(userId: string): Promise<void> {
  await delay(600 + Math.random() * 400)
  
  const index = teamMembers.findIndex(m => m.id === userId)
  if (index === -1) {
    throw new Error('Membro não encontrado')
  }
  
  teamMembers.splice(index, 1)
}

// RBAC Services
export async function fetchRoles(): Promise<RBACRole[]> {
  await delay(300 + Math.random() * 200)
  return mockSystemRoles
}

export async function fetchPermissionMatrix(): Promise<PermissionMatrix[]> {
  await delay(400 + Math.random() * 300)
  
  const scopes: PermissionScope[] = [
    'organization', 'team', 'atendimento', 'clientes', 
    'ai-studio', 'automacoes', 'dashboard', 'settings'
  ]
  
  return mockSystemRoles.map(role => ({
    roleId: role.id,
    roleName: role.name,
    permissions: scopes.map(scope => ({
      scope,
      actions: ['read', 'create', 'update', 'delete'] as PermissionAction[],
      granted: role.permissions.some(p => p.scope === scope),
      inherited: false,
    })),
  }))
}

// API Keys Services
export async function fetchApiKeys(filters?: ApiKeyFilters): Promise<ApiKey[]> {
  await delay(300 + Math.random() * 200)
  
  let filtered = [...apiKeys]
  
  if (filters?.environment && filters.environment.length > 0) {
    filtered = filtered.filter(key => filters.environment!.includes(key.environment))
  }
  
  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter(key => filters.status!.includes(key.status))
  }
  
  return filtered
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<{ apiKey: ApiKey; secretKey: string }> {
  await delay(800 + Math.random() * 400)
  
  const secretKey = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  const keyPreview = `...${secretKey.slice(-4)}`
  
  const newApiKey: ApiKey = {
    id: `key-${Date.now()}`,
    name: payload.name,
    description: payload.description,
    keyPreview,
    scopes: payload.scopes,
    environment: payload.environment,
    status: 'active',
    usageCount: 0,
    rateLimit: payload.rateLimit,
    ipRestrictions: payload.ipRestrictions || [],
    expiresAt: payload.expiresAt,
    createdAt: new Date(),
    createdBy: 'user-001',
  }
  
  apiKeys.push(newApiKey)
  
  return { apiKey: newApiKey, secretKey }
}

export async function revokeApiKey(keyId: string): Promise<ApiKey> {
  await delay(500 + Math.random() * 300)
  
  const key = apiKeys.find(k => k.id === keyId)
  if (!key) {
    throw new Error('Chave não encontrada')
  }
  
  key.status = 'revoked'
  return key
}

export async function rotateApiKey(keyId: string): Promise<{ apiKey: ApiKey; secretKey: string }> {
  await delay(700 + Math.random() * 400)
  
  const key = apiKeys.find(k => k.id === keyId)
  if (!key) {
    throw new Error('Chave não encontrada')
  }
  
  const secretKey = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  key.keyPreview = `...${secretKey.slice(-4)}`
  
  return { apiKey: key, secretKey }
}

// Audit Logs Services
export async function fetchAuditLogs(filters?: AuditLogFilters): Promise<{ logs: AuditLog[]; total: number }> {
  await delay(500 + Math.random() * 300)
  
  let filtered = [...auditLogs]
  
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(log => 
      log.actor.name.toLowerCase().includes(search) ||
      log.action.description.toLowerCase().includes(search)
    )
  }
  
  if (filters?.action && filters.action.length > 0) {
    filtered = filtered.filter(log => filters.action!.includes(log.action.type))
  }
  
  if (filters?.severity && filters.severity.length > 0) {
    filtered = filtered.filter(log => filters.severity!.includes(log.severity))
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  
  return { logs: filtered, total: filtered.length }
}

// Session Management Services
export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  await delay(300 + Math.random() * 200)
  return activeSessions.filter(s => s.status === 'active')
}

export async function revokeSession(sessionId: string): Promise<void> {
  await delay(400 + Math.random() * 200)
  
  const session = activeSessions.find(s => s.id === sessionId)
  if (!session) {
    throw new Error('Sessão não encontrada')
  }
  
  session.status = 'revoked'
}

export async function revokeAllSessions(): Promise<void> {
  await delay(600 + Math.random() * 400)
  
  activeSessions.forEach(session => {
    if (!session.isCurrent) {
      session.status = 'revoked'
    }
  })
}

// Security Services
export async function updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
  await delay(500 + Math.random() * 300)
  
  Object.assign(mockOrganization.settings.security, settings)
  return mockOrganization.settings.security
}

// Bulk Operations
export async function bulkTeamAction(action: BulkTeamAction): Promise<{ success: boolean; processed: number; failed: number }> {
  await delay(1000 + Math.random() * 500)
  
  let processed = 0
  let failed = 0
  
  for (const userId of action.userIds) {
    const member = teamMembers.find(m => m.id === userId)
    if (!member) {
      failed++
      continue
    }
    
    try {
      switch (action.action) {
        case 'suspend':
          member.status = 'suspended'
          break
        case 'activate':
          member.status = 'active'
          break
        case 'remove':
          const index = teamMembers.findIndex(m => m.id === userId)
          if (index !== -1) teamMembers.splice(index, 1)
          break
        case 'change_role':
          if (action.roleId) {
            const role = mockSystemRoles.find(r => r.id === action.roleId)
            if (role) member.role = role
          }
          break
      }
      processed++
    } catch (error) {
      failed++
    }
  }
  
  return { success: true, processed, failed }
}

// Export mock data for testing
export { mockOrganization, mockSystemRoles, mockPlans }