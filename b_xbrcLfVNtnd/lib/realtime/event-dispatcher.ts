import { useActiveConversationStore } from '@/stores/atendimento-store'
import { useMessageStore } from '@/stores/useMessageStore'
import { useTicketStore } from '@/stores/useTicketStore'
import type { Message } from '@/types/atendimento'
import type { Conversation } from '@/types/domain'

type HelpdeskEventName = 'new_message' | 'ticket_updated'

interface DispatchContext {
  currentOrgId?: string | null
}

interface SocketEnvelope {
  type?: string
  event?: string
  org_id?: string
  orgId?: string
  correlation_id?: string
  correlationId?: string
  data?: unknown
  payload?: unknown
}

const isDevelopment = process.env.NODE_ENV !== 'production'

function devLog(title: string, data?: unknown) {
  if (!isDevelopment) return
  console.groupCollapsed(`[helpdesk:events] ${title}`)
  if (data !== undefined) console.log(data)
  console.groupEnd()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function getDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return new Date()
}

function getEventName(envelope: SocketEnvelope): HelpdeskEventName | null {
  const name = envelope.type ?? envelope.event
  return name === 'new_message' || name === 'ticket_updated' ? name : null
}

function getEventBody(envelope: SocketEnvelope) {
  return isRecord(envelope.data) ? envelope.data : isRecord(envelope.payload) ? envelope.payload : envelope
}

function isWrongTenant(envelope: SocketEnvelope, context: DispatchContext) {
  const payloadOrgId = envelope.org_id ?? envelope.orgId
  return Boolean(context.currentOrgId && payloadOrgId && payloadOrgId !== context.currentOrgId)
}

function normalizeMessage(body: Record<string, unknown>, envelope: SocketEnvelope): Message | null {
  const id = getString(body.id) ?? getString(body.message_id)
  const conversationId =
    getString(body.conversationId) ?? getString(body.conversation_id) ?? getString(body.ticketId) ?? getString(body.ticket_id)
  const content = getString(body.content) ?? getString(body.text) ?? getString(body.body)

  if (!id || !conversationId || !content) return null

  const messageType = getString(body.type) ?? getString(body.sender_type) ?? 'customer'
  const safeType: Message['type'] =
    messageType === 'agent' || messageType === 'ai' || messageType === 'system' ? messageType : 'customer'
  const metadata = isRecord(body.metadata) ? body.metadata : {}
  const correlationId =
    getString(body.correlation_id) ??
    getString(body.correlationId) ??
    getString(envelope.correlation_id) ??
    getString(envelope.correlationId)
  const optimisticId = getString(body.optimistic_id) ?? getString(body.optimisticId) ?? getString(body.temp_id)

  return {
    id,
    conversationId,
    type: safeType,
    content,
    timestamp: getDate(body.timestamp ?? body.created_at ?? body.createdAt),
    senderName: getString(body.senderName) ?? getString(body.sender_name),
    senderId: getString(body.senderId) ?? getString(body.sender_id),
    isInternal: Boolean(body.isInternal ?? body.is_internal),
    metadata: {
      ...metadata,
      deliveryStatus: safeType === 'agent' ? 'sent' : undefined,
      delivery_status: safeType === 'agent' ? 'sent' : undefined,
      correlationId,
      correlation_id: correlationId,
      optimisticId,
      optimistic_id: optimisticId,
    },
  }
}

function normalizeTicket(body: Record<string, unknown>): (Partial<Conversation> & { id: string }) | null {
  const id = getString(body.id) ?? getString(body.ticket_id) ?? getString(body.conversation_id)
  if (!id) return null

  return {
    id,
    customerId: getString(body.customerId) ?? getString(body.customer_id),
    customerName: getString(body.customerName) ?? getString(body.customer_name),
    channel: getString(body.channel) as Conversation['channel'] | undefined,
    status: getString(body.status) as Conversation['status'] | undefined,
    priority: getString(body.priority) as Conversation['priority'] | undefined,
    assignedAgentId: getString(body.assignedAgentId) ?? getString(body.assigned_agent_id),
    assignedAIAgentId: getString(body.assignedAIAgentId) ?? getString(body.assigned_ai_agent_id),
    subject: getString(body.subject),
    lastMessage: getString(body.lastMessage) ?? getString(body.last_message),
    unreadCount: typeof body.unreadCount === 'number' ? body.unreadCount : undefined,
    sentiment: getString(body.sentiment) as Conversation['sentiment'] | undefined,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    startedAt: body.startedAt || body.started_at ? getDate(body.startedAt ?? body.started_at) : undefined,
    updatedAt: getDate(body.updatedAt ?? body.updated_at ?? body.timestamp),
    resolvedAt: body.resolvedAt || body.resolved_at ? getDate(body.resolvedAt ?? body.resolved_at) : undefined,
  }
}

function handleNewMessage(message: Message) {
  const { selectedConversationId } = useActiveConversationStore.getState()
  const { addMessage } = useMessageStore.getState()
  const { updateTicket, markTicketUnread, clearUnread } = useTicketStore.getState()

  addMessage(message)
  updateTicket({
    id: message.conversationId,
    lastMessage: message.content,
    updatedAt: message.timestamp,
  })

  if (selectedConversationId === message.conversationId) {
    clearUnread(message.conversationId)
    return
  }

  if (message.type === 'customer') {
    markTicketUnread(message.conversationId)
  }
}

export function dispatchHelpdeskSocketEvent(rawPayload: unknown, context: DispatchContext = {}) {
  if (!isRecord(rawPayload)) {
    devLog('ignored non-object payload', rawPayload)
    return
  }

  const envelope = rawPayload as SocketEnvelope
  const eventName = getEventName(envelope)
  if (!eventName) {
    devLog('ignored unsupported event', rawPayload)
    return
  }

  if (isWrongTenant(envelope, context)) {
    devLog('ignored tenant mismatch', {
      payloadOrgId: envelope.org_id ?? envelope.orgId,
      currentOrgId: context.currentOrgId,
    })
    return
  }

  const body = getEventBody(envelope)
  const correlationId = envelope.correlation_id ?? envelope.correlationId
  if (correlationId) devLog(`correlation ${correlationId}`, rawPayload)

  if (eventName === 'new_message') {
    const message = normalizeMessage(body as Record<string, unknown>, envelope)
    if (!message) {
      devLog('ignored malformed new_message', rawPayload)
      return
    }

    handleNewMessage(message)
    return
  }

  const ticket = normalizeTicket(body as Record<string, unknown>)
  if (!ticket) {
    devLog('ignored malformed ticket_updated', rawPayload)
    return
  }

  useTicketStore.getState().updateTicket(ticket)
}
