import type { Message, CustomerProfile, SLAInfo } from '@/types/atendimento'
import type { Conversation } from '@/types/domain'
import { apiClient } from '@/lib/api-client'

type RequestOptions = {
  signal?: AbortSignal
}

type PaginatedResponse<T> = {
  results?: T[]
  count?: number
  has_more?: boolean
}

type TicketApi = {
  id: string
  customer_id?: string
  customer_name?: string
  customer_email?: string
  assigned_to?: string | null
  assigned_to_id?: string | null
  assigned_to_name?: string | null
  title?: string
  channel?: string
  status?: string
  priority?: string
  sla_due_at?: string | null
  metadata?: Record<string, unknown>
  message_count?: number
  created_at?: string
  updated_at?: string
}

type MessageApi = {
  id: string
  ticket_id?: string
  sender_type?: string
  direction?: string
  sender_id?: string | null
  sender_name?: string
  content?: string
  is_internal?: boolean
  external_message_id?: string | null
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

type DeliveryStatus = NonNullable<Message['metadata']>['deliveryStatus']

function normalizeArrayResponse<T>(response: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results ?? []
}

function toDate(value?: string | Date | null) {
  if (!value) return new Date()
  return value instanceof Date ? value : new Date(value)
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function mapChannel(channel?: string): Conversation['channel'] {
  if (channel === 'whatsapp' || channel === 'email' || channel === 'phone') return channel
  if (channel === 'instagram') return 'social'
  return 'chat'
}

function mapStatus(status?: string): Conversation['status'] {
  if (status === 'open' || status === 'pending' || status === 'resolved') return status
  if (status === 'closed') return 'resolved'
  return 'open'
}

function mapPriority(priority?: string): Conversation['priority'] {
  if (priority === 'low' || priority === 'medium' || priority === 'high' || priority === 'urgent') {
    return priority
  }
  return 'medium'
}

function mapMessageType(senderType?: string): Message['type'] {
  if (senderType === 'agent') return 'agent'
  if (senderType === 'ai_agent' || senderType === 'ai') return 'ai'
  if (senderType === 'system') return 'system'
  return 'customer'
}

function getMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  return metadata ? asString(metadata[key]) : undefined
}

function asDeliveryStatus(value: string | undefined): DeliveryStatus | undefined {
  if (
    value === 'sending' ||
    value === 'sent' ||
    value === 'delivered' ||
    value === 'read' ||
    value === 'failed'
  ) {
    return value
  }

  return undefined
}

function normalizeTicket(ticket: TicketApi): Conversation {
  const metadata = ticket.metadata ?? {}
  const unreadCount = asNumber(metadata.unread_count) ?? asNumber(metadata.unreadCount) ?? 0
  const lastMessage =
    asString(metadata.last_message) ??
    asString(metadata.lastMessage) ??
    asString(metadata.latest_message) ??
    ticket.title

  return {
    id: ticket.id,
    customerId: ticket.customer_id ?? ticket.id,
    customerName: ticket.customer_name ?? 'Cliente',
    channel: mapChannel(ticket.channel),
    status: mapStatus(ticket.status),
    priority: mapPriority(ticket.priority),
    assignedAgentId: ticket.assigned_to ?? ticket.assigned_to_id ?? undefined,
    subject: ticket.title,
    lastMessage,
    unreadCount,
    sentiment: asString(metadata.sentiment) as Conversation['sentiment'] | undefined,
    tags: Array.isArray(metadata.tags) ? metadata.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    startedAt: toDate(ticket.created_at),
    updatedAt: toDate(ticket.updated_at),
  }
}

function normalizeMessage(message: MessageApi, ticketId: string): Message {
  const metadata = message.metadata ?? {}
  const deliveryStatus = asDeliveryStatus(
    getMetadataString(metadata, 'delivery_status') ?? getMetadataString(metadata, 'deliveryStatus')
  )

  return {
    id: message.id,
    conversationId: message.ticket_id ?? ticketId,
    type: mapMessageType(message.sender_type),
    content: message.content ?? '',
    timestamp: toDate(message.created_at),
    senderName: message.sender_name,
    senderId: message.sender_id ?? undefined,
    isInternal: Boolean(message.is_internal),
    metadata: {
      ...metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
      correlationId: getMetadataString(metadata, 'correlation_id') ?? getMetadataString(metadata, 'correlationId'),
      correlation_id: getMetadataString(metadata, 'correlation_id') ?? getMetadataString(metadata, 'correlationId'),
      optimisticId: getMetadataString(metadata, 'optimistic_id') ?? getMetadataString(metadata, 'optimisticId'),
      optimistic_id: getMetadataString(metadata, 'optimistic_id') ?? getMetadataString(metadata, 'optimisticId'),
      updatedAt: message.updated_at,
      updated_at: message.updated_at,
    },
  }
}

export async function getAtendimentoConversations(options: RequestOptions = {}): Promise<Conversation[]> {
  const { data } = await apiClient.get<TicketApi[] | PaginatedResponse<TicketApi>>('/helpdesk/tickets/', {
    signal: options.signal,
  })

  return normalizeArrayResponse(data).map(normalizeTicket)
}

export async function getAtendimentoConversation(
  conversationId: string,
  options: RequestOptions = {}
): Promise<Conversation> {
  const { data } = await apiClient.get<TicketApi>(`/helpdesk/tickets/${conversationId}/`, {
    signal: options.signal,
  })

  return normalizeTicket(data)
}

export async function getConversationMessages(
  conversationId: string,
  options: RequestOptions = {}
): Promise<Message[]> {
  const params = new URLSearchParams({ ticket_id: conversationId, limit: '100' })
  const { data } = await apiClient.get<MessageApi[] | PaginatedResponse<MessageApi>>(
    `/helpdesk/messages/?${params.toString()}`,
    { signal: options.signal }
  )

  return normalizeArrayResponse(data).map((message) => normalizeMessage(message, conversationId))
}

export async function getCustomerProfile(
  customerId: string,
  options: RequestOptions = {}
): Promise<CustomerProfile | null> {
  try {
    const { data: customer } = await apiClient.get<{
      id: string
      name?: string
      email?: string
      phone?: string
      cpf_cnpj?: string
      metadata?: Record<string, unknown>
    }>(`/crm/customers/${customerId}/`, { signal: options.signal })

    return {
      id: customer.id,
      name: customer.name ?? 'Cliente',
      email: customer.email ?? '',
      phone: customer.phone,
      cpfCnpj: customer.cpf_cnpj,
      sentiment: asString(customer.metadata?.sentiment) as CustomerProfile['sentiment'] | undefined,
      tags: Array.isArray(customer.metadata?.tags)
        ? customer.metadata.tags.filter((tag): tag is string => typeof tag === 'string')
        : [],
    }
  } catch (error) {
    if (options.signal?.aborted) throw error
    return null
  }
}

export async function getSLAInfo(
  conversationId: string,
  options: RequestOptions = {}
): Promise<SLAInfo | null> {
  const { data: ticket } = await apiClient.get<TicketApi>(`/helpdesk/tickets/${conversationId}/`, {
    signal: options.signal,
  })

  if (!ticket.sla_due_at) return null

  const deadline = toDate(ticket.sla_due_at)
  const remainingMinutes = Math.ceil((deadline.getTime() - Date.now()) / 60_000)

  return {
    deadline,
    remainingMinutes,
    status: remainingMinutes < 0 ? 'breached' : remainingMinutes <= 15 ? 'warning' : 'on-track',
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  isInternal: boolean,
  correlationId?: string,
  options: RequestOptions = {}
): Promise<Message> {
  const { data: message } = await apiClient.post<MessageApi>('/helpdesk/messages/', {
    ticket_id: conversationId,
    sender_type: 'agent',
    direction: 'outbound',
    content,
    is_internal: isInternal,
    external_message_id: correlationId,
    metadata: {
      correlation_id: correlationId,
      delivery_status: 'sent',
    },
  }, {
    signal: options.signal,
  })

  return normalizeMessage(message, conversationId)
}
