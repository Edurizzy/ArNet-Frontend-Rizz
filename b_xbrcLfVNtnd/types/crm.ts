// CRM & Billing module domain types

export type BillingStatus = 'em-dia' | 'atrasado' | 'suspenso' | 'cancelado'

export type SubscriptionStatus = 'active' | 'pending' | 'suspended' | 'cancelled'

export type ChannelType = 'whatsapp' | 'email' | 'instagram' | 'telegram' | 'web' | 'sms'

export interface OmnichannelIdentity {
  channel: ChannelType
  identifier: string
  isVerified: boolean
  linkedAt: Date
  lastUsedAt?: Date
}

export interface SubscriptionDetails {
  id: string
  planId: string
  planName: string
  speed?: string // e.g., "500MB", "1GB"
  monthlyPrice: number
  billingCycleDay: number
  status: SubscriptionStatus
  contractStart: Date
  contractEnd?: Date
  nextBillingDate: Date
  lastPaymentDate?: Date
  lastPaymentAmount?: number
}

export interface PaymentState {
  currentBalance: number
  lastPaymentDate?: Date
  lastPaymentAmount?: number
  overdueAmount: number
  overdueDays: number
  paymentMethod?: 'pix' | 'boleto' | 'cartao' | 'debito-automatico'
}

export interface CustomerMetrics {
  ltv: number
  totalTickets: number
  openTickets: number
  avgResponseTime: number // in minutes
  avgSlaCompliance: number // percentage
  lastContactAt?: Date
  createdAt: Date
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
  sentimentHistory: Array<{
    date: Date
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
}

export interface TicketHistoryPreview {
  id: string
  subject: string
  status: 'open' | 'resolved' | 'escalated'
  createdAt: Date
  resolvedAt?: Date
  channel: ChannelType
}

export interface CrmCustomer {
  id: string
  name: string
  email: string
  phone?: string
  cpfCnpj: string
  avatarUrl?: string
  type: 'pf' | 'pj' // Pessoa Física / Pessoa Jurídica
  billingStatus: BillingStatus
  subscription: SubscriptionDetails
  payment: PaymentState
  omnichannelIdentities: OmnichannelIdentity[]
  metrics: CustomerMetrics
  tags: string[]
  notes?: string
  recentTickets: TicketHistoryPreview[]
}

// Filter types
export type CustomerStatusFilter = 'all' | 'ativo' | 'inadimplente' | 'suspenso' | 'cancelado'

export interface CustomerFiltersState {
  search: string
  status: CustomerStatusFilter
  planId: string | null
  department: string | null
  sortBy: 'name' | 'createdAt' | 'ltv' | 'lastContact'
  sortOrder: 'asc' | 'desc'
}

// Pagination types
export interface PaginationState {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// Bulk operation types
export type BulkAction = 'suspend' | 'activate' | 'export' | 'tag' | 'delete'

export interface BulkOperationState {
  selectedIds: Set<string>
  isProcessing: boolean
  action: BulkAction | null
}
