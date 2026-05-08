// IAM, RBAC & Settings Domain Types for ArNet Enterprise Platform

// Organization & Plans
export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  domain?: string
  plan: OrganizationPlan
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  billingEmail: string
  maxSeats: number
  usedSeats: number
  settings: OrganizationSettings
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationPlan {
  id: string
  name: string
  tier: 'trial' | 'startup' | 'business' | 'enterprise'
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    maxUsers: number
    maxAIAgents: number
    maxWebhooks: number
    maxApiCalls: number
    storageGB: number
    auditRetentionDays: number
  }
  isActive: boolean
}

export interface OrganizationSettings {
  timezone: string
  dateFormat: string
  language: 'pt-BR' | 'en-US'
  theme: 'dark' | 'light' | 'system'
  security: SecuritySettings
  notifications: NotificationSettings
  features: FeatureFlags
}

export interface SecuritySettings {
  requireMFA: boolean
  sessionTimeoutMinutes: number
  passwordPolicy: PasswordPolicy
  allowedDomains: string[]
  ipRestrictions: string[]
  ssoEnabled: boolean
  ssoProvider?: string
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // days
}

export interface NotificationSettings {
  email: EmailNotificationSettings
  webhook: WebhookNotificationSettings
  inApp: InAppNotificationSettings
}

export interface EmailNotificationSettings {
  securityAlerts: boolean
  billingUpdates: boolean
  systemMaintenance: boolean
  teamChanges: boolean
  auditSummary: boolean
}

export interface WebhookNotificationSettings {
  enabled: boolean
  url?: string
  events: string[]
}

export interface InAppNotificationSettings {
  securityAlerts: boolean
  teamActivity: boolean
  systemUpdates: boolean
}

// Team Members & RBAC
export interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: RBACRole
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  lastLoginAt?: Date
  mfaEnabled: boolean
  permissions: PermissionScope[]
  invitedAt: Date
  invitedBy: string
  joinedAt?: Date
  lastActiveAt?: Date
  sessionCount: number
}

export interface RBACRole {
  id: string
  name: string
  description?: string
  level: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer' | 'custom'
  isSystemRole: boolean
  permissions: Permission[]
  memberCount: number
  createdAt: Date
  updatedAt?: Date
}

export interface Permission {
  id: string
  scope: PermissionScope
  actions: PermissionAction[]
  conditions?: PermissionCondition[]
}

export type PermissionScope = 
  | 'organization'
  | 'team'
  | 'atendimento'
  | 'clientes'
  | 'ai-studio'
  | 'automacoes' 
  | 'dashboard'
  | 'settings'
  | 'billing'
  | 'audit'
  | 'api-keys'
  | 'webhooks'

export type PermissionAction = 
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'invite'
  | 'suspend'
  | 'restore'

export interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in'
  value: string | string[]
}

export interface PermissionMatrix {
  roleId: string
  roleName: string
  permissions: {
    scope: PermissionScope
    actions: PermissionAction[]
    granted: boolean
    inherited: boolean
  }[]
}

// API Keys Management
export interface ApiKey {
  id: string
  name: string
  description?: string
  keyPreview: string // Last 4 chars, masked
  scopes: PermissionScope[]
  environment: 'production' | 'staging' | 'development'
  status: 'active' | 'revoked' | 'expired'
  lastUsedAt?: Date
  usageCount: number
  rateLimit?: number
  ipRestrictions: string[]
  expiresAt?: Date
  createdAt: Date
  createdBy: string
}

export interface CreateApiKeyPayload {
  name: string
  description?: string
  scopes: PermissionScope[]
  environment: 'production' | 'staging' | 'development'
  expiresAt?: Date
  rateLimit?: number
  ipRestrictions?: string[]
}

// Audit Logs & Security
export interface AuditLog {
  id: string
  timestamp: Date
  actor: AuditActor
  action: AuditAction
  resource: AuditResource
  metadata: AuditMetadata
  ipAddress: string
  userAgent?: string
  correlationId?: string
  status: 'success' | 'failure' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditActor {
  type: 'user' | 'api-key' | 'system' | 'webhook'
  id: string
  name: string
  email?: string
}

export interface AuditAction {
  type: AuditActionType
  description: string
  category: AuditCategory
}

export type AuditActionType =
  | 'user.login'
  | 'user.logout'
  | 'user.invite'
  | 'user.suspend'
  | 'user.role.change'
  | 'apikey.create'
  | 'apikey.revoke'
  | 'apikey.rotate'
  | 'organization.update'
  | 'settings.update'
  | 'billing.update'
  | 'security.mfa.enable'
  | 'security.mfa.disable'
  | 'webhook.create'
  | 'webhook.delete'
  | 'data.export'
  | 'session.revoke'

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'data'
  | 'security'
  | 'configuration'
  | 'billing'
  | 'integration'

export interface AuditResource {
  type: string
  id: string
  name?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export interface AuditMetadata {
  changes?: AuditChange[]
  reason?: string
  additional?: Record<string, unknown>
}

export interface AuditChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

// Active Sessions Management
export interface ActiveSession {
  id: string
  userId: string
  deviceInfo: DeviceInfo
  ipAddress: string
  location?: GeoLocation
  startedAt: Date
  lastActiveAt: Date
  isCurrent: boolean
  isTrusted: boolean
  status: 'active' | 'expired' | 'revoked'
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'api'
  os?: string
  browser?: string
  userAgent: string
}

export interface GeoLocation {
  country: string
  region?: string
  city?: string
  timezone: string
}

// Feature Flags System
export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  type: 'boolean' | 'string' | 'number' | 'json'
  value: unknown
  defaultValue: unknown
  environment: 'production' | 'staging' | 'development'
  status: 'active' | 'inactive' | 'deprecated'
  conditions?: FeatureFlagCondition[]
  rolloutPercentage?: number
  createdAt: Date
  updatedAt?: Date
  updatedBy?: string
}

export interface FeatureFlagCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains'
  value: string | string[]
}

export interface FeatureFlags {
  aiStudioAdvanced: boolean
  automationEngine: boolean
  customWebhooks: boolean
  dataExport: boolean
  ssoIntegration: boolean
  auditRetention: boolean
  apiRateLimiting: boolean
  whiteLabeling: boolean
  advancedAnalytics: boolean
  multiTenant: boolean
}

// Security Events
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  actor?: AuditActor
  resource?: AuditResource
  metadata: Record<string, unknown>
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  ipAddress?: string
}

export type SecurityEventType =
  | 'suspicious_login'
  | 'failed_login_attempts'
  | 'unauthorized_access'
  | 'privilege_escalation'
  | 'data_breach_attempt'
  | 'api_abuse'
  | 'session_hijacking'
  | 'malicious_activity'

// Invitations & Onboarding
export interface InviteMemberPayload {
  email: string
  roleId: string
  permissions?: PermissionScope[]
  message?: string
  expiresAt?: Date
}

export interface PendingInvitation {
  id: string
  email: string
  roleId: string
  roleName: string
  permissions: PermissionScope[]
  message?: string
  invitedBy: string
  invitedByName: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: Date
  sentAt: Date
  remindersSent: number
  token: string
}

// Settings Navigation & UI State
export interface SettingsNavSection {
  id: string
  label: string
  items: SettingsNavItem[]
}

export interface SettingsNavItem {
  id: SettingsPageId
  label: string
  icon: string
  description?: string
  requiresPermission?: PermissionScope[]
  requiresPlan?: OrganizationPlan['tier'][]
  badge?: string | number
}

export type SettingsPageId = 
  | 'profile'
  | 'preferences' 
  | 'sessions'
  | 'organization'
  | 'team'
  | 'billing'
  | 'feature-flags'
  | 'api-keys'
  | 'webhooks'
  | 'audit-logs'
  | 'security'
  | 'danger-zone'

// Form & Validation Types
export interface UpdateProfilePayload {
  name: string
  email: string
  avatarUrl?: string
  timezone: string
  language: string
}

export interface UpdateOrganizationPayload {
  name: string
  slug: string
  logoUrl?: string
  domain?: string
  billingEmail: string
  settings: Partial<OrganizationSettings>
}

export interface ChangeRolePayload {
  userId: string
  roleId: string
  reason?: string
}

export interface BulkTeamAction {
  userIds: string[]
  action: 'suspend' | 'activate' | 'remove' | 'change_role'
  roleId?: string
  reason?: string
}

// Loading & Async States (following existing patterns)
export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Search & Filters
export interface AuditLogFilters {
  actor?: string
  action?: AuditActionType[]
  category?: AuditCategory[]
  severity?: AuditLog['severity'][]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface TeamMemberFilters {
  role?: string[]
  status?: TeamMember['status'][]
  search?: string
  lastActive?: 'week' | 'month' | 'quarter'
}

export interface ApiKeyFilters {
  environment?: ApiKey['environment'][]
  status?: ApiKey['status'][]
  scope?: PermissionScope[]
  search?: string
}