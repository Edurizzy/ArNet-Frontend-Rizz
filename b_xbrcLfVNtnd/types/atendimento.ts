// Atendimento module domain types

export interface Message {
  id: string
  conversationId: string
  type: 'customer' | 'ai' | 'agent' | 'system'
  content: string
  timestamp: Date
  senderName?: string
  senderId?: string
  isInternal?: boolean // Internal notes, not visible to customer
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  aiConfidence?: 'high' | 'medium' | 'low'
  aiModel?: string
  automationSource?: string
  handoffReason?: string
  handoffFrom?: string
  handoffTo?: string
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  delivery_status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  correlationId?: string
  correlation_id?: string
  optimisticId?: string
  optimistic_id?: string
  error?: string
}

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone?: string
  cpfCnpj?: string
  avatarUrl?: string
  subscription?: SubscriptionInfo
  sentiment?: 'positive' | 'neutral' | 'negative' | 'irritated'
  tags: string[]
  notes?: string
}

export interface SubscriptionInfo {
  planName: string
  status: 'active' | 'pending' | 'suspended' | 'cancelled'
  monthlyValue?: number
  nextBillingDate?: Date
}

export interface SLAInfo {
  deadline: Date
  remainingMinutes: number
  status: 'on-track' | 'warning' | 'breached'
}

export type TicketStatusFilter = 'all' | 'waiting' | 'with-ai' | 'in-progress'

export interface TicketQueueFilters {
  status: TicketStatusFilter
  searchQuery: string
}
