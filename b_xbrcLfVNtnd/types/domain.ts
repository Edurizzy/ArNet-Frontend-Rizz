// Domain entities for ArNet Enterprise SaaS Platform

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  avatarUrl?: string
  department?: string
  lastActiveAt: Date
  createdAt: Date
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  segment: 'enterprise' | 'mid-market' | 'small-business' | 'individual'
  status: 'active' | 'inactive' | 'churned' | 'prospect'
  healthScore: number // 0-100
  totalRevenue: number
  lastInteractionAt?: Date
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  channel: 'chat' | 'email' | 'whatsapp' | 'phone' | 'social'
  status: 'open' | 'pending' | 'resolved' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedAgentId?: string
  assignedAIAgentId?: string
  subject?: string
  lastMessage?: string
  unreadCount: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  tags: string[]
  startedAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface AIAgent {
  id: string
  name: string
  type: 'assistant' | 'classifier' | 'summarizer' | 'translator' | 'custom'
  status: 'active' | 'inactive' | 'training' | 'error'
  model: string
  description?: string
  capabilities: string[]
  conversationsHandled: number
  avgResponseTime: number // in milliseconds
  satisfactionScore: number // 0-100
  lastActiveAt?: Date
  createdAt: Date
  config?: Record<string, unknown>
}

// Navigation types
export type NavigationRoute = 'dashboard' | 'atendimento' | 'clientes' | 'ai-studio'

export interface NavigationItem {
  id: NavigationRoute
  label: string
  icon: string
  badge?: number
}

// System status types
export interface SystemStatus {
  websocket: 'connected' | 'connecting' | 'disconnected' | 'error'
  aiAgentsActive: number
  aiAgentsTotal: number
  lastSync: Date
}

// Loading and async states
export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
