import { unstable_batchedUpdates } from 'react-dom'
import { useActiveConversationStore } from '@/stores/atendimento-store'
import { useMessageStore } from '@/stores/useMessageStore'
import { useTicketStore } from '@/stores/useTicketStore'
import type { Message } from '@/types/atendimento'
import type { Conversation } from '@/types/domain'

type HelpdeskEventName = 'new_message' | 'ticket_updated'
type TicketPatch = Partial<Conversation> & { id: string; eventTimestamp?: Date | string }

interface DispatchContext {
  currentOrgId?: string | null
}

interface SocketEnvelope {
  type?: string
  event?: string
  event_version?: number
  timestamp?: string
  event_timestamp?: string | null
  organization_id?: string
  org_id?: string
  orgId?: string
  correlation_id?: string
  correlationId?: string
  provider?: string | null
  data?: unknown
  payload?: unknown
}

const isDevelopment = process.env.NODE_ENV !== 'production'
const pendingEvents: Array<{ payload: unknown; context: DispatchContext }> = []
let flushScheduled = false

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

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
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

function getPayloadOrgId(envelope: SocketEnvelope) {
  return envelope.organization_id ?? envelope.org_id ?? envelope.orgId
}

function isWrongTenant(envelope: SocketEnvelope, context: DispatchContext) {
  const payloadOrgId = getPayloadOrgId(envelope)
  return Boolean(context.currentOrgId && payloadOrgId && payloadOrgId !== context.currentOrgId)
}

function mapMessageType(senderType?: string): Message['type'] {
  if (senderType === 'agent') return 'agent'
  if (senderType === 'ai_agent' || senderType === 'ai') return 'ai'
  if (senderType === 'system') return 'system'
  return 'customer'
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

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  return getString(metadata[key])
}

type UiDeliveryStatus = NonNullable<Message['metadata']>['deliveryStatus']

function mapBackendDeliveryToUi(raw: string | undefined): UiDeliveryStatus | undefined {
  if (!raw) return undefined
  const v = raw.trim().toLowerCase()
  if (v === 'queued' || v === 'pending' || v === 'sending') return 'sending'
  if (v === 'sent' || v === 'delivered' || v === 'read' || v === 'failed') return v as UiDeliveryStatus
  return undefined
}

function resolveSocketDeliveryStatus(
  messageBody: Record<string, unknown>,
  metadata: Record<string, unknown>,
  safeType: Message['type']
): UiDeliveryStatus | undefined {
  const fromTop = mapBackendDeliveryToUi(getString(messageBody.delivery_status) ?? undefined)
  if (fromTop) return fromTop
  const fromMeta = mapBackendDeliveryToUi(
    getMetadataString(metadata, 'delivery_status') ?? getMetadataString(metadata, 'deliveryStatus')
  )
  if (fromMeta) return fromMeta
  if (safeType === 'agent') return 'sent'
  return undefined
}

function normalizeMessage(body: Record<string, unknown>, envelope: SocketEnvelope): Message | null {
  const messageBody = isRecord(body.message) ? body.message : body
  const ticketBody = isRecord(body.ticket) ? body.ticket : body
  const metadata = isRecord(messageBody.metadata) ? messageBody.metadata : {}
  const id = getString(messageBody.id) ?? getString(messageBody.message_id)
  const conversationId =
    getString(messageBody.ticket_id) ??
    getString(messageBody.conversation_id) ??
    getString(ticketBody.id) ??
    getString(ticketBody.ticket_id)
  const content = getString(messageBody.content) ?? getString(messageBody.text) ?? getString(messageBody.body)

  if (!id || !conversationId || !content) return null

  const safeType = mapMessageType(getString(messageBody.sender_type) ?? getString(messageBody.type))
  const correlationId =
    getString(envelope.correlation_id) ??
    getString(envelope.correlationId) ??
    getString(messageBody.correlation_id) ??
    getString(messageBody.correlationId) ??
    getMetadataString(metadata, 'correlation_id') ??
    getMetadataString(metadata, 'correlationId')
  const optimisticId =
    getString(messageBody.optimistic_id) ??
    getString(messageBody.optimisticId) ??
    getString(messageBody.temp_id) ??
    getMetadataString(metadata, 'optimistic_id') ??
    getMetadataString(metadata, 'optimisticId')
  const createdAt = getString(messageBody.created_at) ?? getString(messageBody.createdAt)
  const updatedAt = getString(messageBody.updated_at) ?? getString(messageBody.updatedAt)
  const eventTimestamp = envelope.event_timestamp ?? envelope.timestamp
  const deliveryStatus = resolveSocketDeliveryStatus(messageBody, metadata, safeType)
  const providerMessageId =
    getString(messageBody.provider_message_id) ??
    getString(messageBody.providerMessageId) ??
    getMetadataString(metadata, 'provider_message_id') ??
    getMetadataString(metadata, 'providerMessageId')

  return {
    id,
    conversationId,
    type: safeType,
    content,
    timestamp: getDate(createdAt ?? eventTimestamp),
    senderName: getString(messageBody.sender_name) ?? getString(messageBody.senderName),
    senderId: getString(messageBody.sender_id) ?? getString(messageBody.senderId),
    isInternal: Boolean(messageBody.is_internal ?? messageBody.isInternal),
    metadata: {
      ...metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
      correlationId,
      correlation_id: correlationId,
      optimisticId,
      optimistic_id: optimisticId,
      ...(providerMessageId
        ? { providerMessageId, provider_message_id: providerMessageId }
        : {}),
      createdAt,
      created_at: createdAt,
      updatedAt,
      updated_at: updatedAt,
      eventTimestamp: eventTimestamp ?? undefined,
      event_timestamp: eventTimestamp ?? undefined,
    },
  }
}

function normalizeTicket(body: Record<string, unknown>, envelope: SocketEnvelope): TicketPatch | null {
  const ticketBody = isRecord(body.ticket) ? body.ticket : body
  const messageBody = isRecord(body.message) ? body.message : undefined
  const metadata = isRecord(ticketBody.metadata) ? ticketBody.metadata : {}
  const id = getString(ticketBody.id) ?? getString(ticketBody.ticket_id) ?? getString(messageBody?.ticket_id)

  if (!id) return null

  const updatedAt = getString(ticketBody.updated_at) ?? getString(ticketBody.updatedAt) ?? envelope.event_timestamp ?? envelope.timestamp
  const createdAt = getString(ticketBody.created_at) ?? getString(ticketBody.createdAt)
  const lastMessage =
    getString(ticketBody.last_message) ??
    getString(ticketBody.lastMessage) ??
    getString(metadata.last_message) ??
    getString(metadata.lastMessage) ??
    getString(messageBody?.content)

  const unreadCount = getNumber(ticketBody.unread_count) ?? getNumber(ticketBody.unreadCount)
  const customerId = getString(ticketBody.customer_id)

  return {
    id,
    ...(customerId ? { customerId } : {}),
    customerName: getString(ticketBody.customer_name) ?? getString(metadata.customer_name) ?? 'Cliente',
    channel: mapChannel(getString(ticketBody.channel)),
    status: mapStatus(getString(ticketBody.status)),
    priority: mapPriority(getString(ticketBody.priority)),
    assignedAgentId: getString(ticketBody.assigned_to_id) ?? getString(ticketBody.assignedAgentId),
    subject: getString(ticketBody.title) ?? getString(ticketBody.subject) ?? 'Atendimento receptivo',
    lastMessage,
    unreadCount,
    sentiment: getString(metadata.sentiment) as Conversation['sentiment'] | undefined,
    tags: Array.isArray(metadata.tags) ? metadata.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    startedAt: getDate(createdAt ?? updatedAt),
    updatedAt: getDate(updatedAt),
    eventTimestamp: envelope.event_timestamp ?? envelope.timestamp,
  }
}

function handleNewMessage(message: Message, ticket: TicketPatch | null) {
  const selectedConversationId = useActiveConversationStore.getState().selectedConversationId
  const messageStore = useMessageStore.getState()
  const ticketStore = useTicketStore.getState()

  if (ticket) ticketStore.updateTicket(ticket)
  messageStore.addMessage(message)

  ticketStore.updateTicket({
    id: message.conversationId,
    lastMessage: message.content,
    updatedAt: message.timestamp,
    eventTimestamp: message.metadata?.eventTimestamp ?? message.metadata?.event_timestamp,
  })

  if (selectedConversationId === message.conversationId) {
    ticketStore.clearUnread(message.conversationId)
    return
  }

  if (message.type === 'customer') {
    ticketStore.markTicketUnread(message.conversationId)
  }
}

function dispatchNow(rawPayload: unknown, context: DispatchContext = {}) {
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
      payloadOrgId: getPayloadOrgId(envelope),
      currentOrgId: context.currentOrgId,
      correlationId: envelope.correlation_id ?? envelope.correlationId,
    })
    return
  }

  const body = getEventBody(envelope)
  if (!isRecord(body)) {
    devLog('ignored malformed event body', rawPayload)
    return
  }

  const correlationId = envelope.correlation_id ?? envelope.correlationId
  if (correlationId) devLog(`correlation ${correlationId}`, rawPayload)

  if (eventName === 'new_message') {
    const message = normalizeMessage(body, envelope)
    if (!message) {
      devLog('ignored malformed new_message', rawPayload)
      return
    }

    handleNewMessage(message, normalizeTicket(body, envelope))
    return
  }

  const ticket = normalizeTicket(body, envelope)
  if (!ticket) {
    devLog('ignored malformed ticket_updated', rawPayload)
    return
  }

  useTicketStore.getState().updateTicket({
    ...ticket,
    eventTimestamp: envelope.event_timestamp ?? envelope.timestamp,
  })

  const selectedId = useActiveConversationStore.getState().selectedConversationId
  if (selectedId === ticket.id) {
    const current = useActiveConversationStore.getState().conversation
    if (current) {
      const { eventTimestamp, ...incoming } = ticket
    void eventTimestamp
      useActiveConversationStore.getState().setConversation({
        ...current,
        ...incoming,
      })
    }
  }
}

function flushEvents() {
  flushScheduled = false
  const events = pendingEvents.splice(0, pendingEvents.length)

  unstable_batchedUpdates(() => {
    events.forEach(({ payload, context }) => dispatchNow(payload, context))
  })
}

export function dispatchHelpdeskSocketEvent(rawPayload: unknown, context: DispatchContext = {}) {
  pendingEvents.push({ payload: rawPayload, context })

  if (flushScheduled) return
  flushScheduled = true
  window.setTimeout(flushEvents, 16)
}
