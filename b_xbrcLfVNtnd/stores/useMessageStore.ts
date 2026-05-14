'use client'

import { create } from 'zustand'
import type { Message } from '@/types/atendimento'

export type MessageDeliveryStatus = NonNullable<Message['metadata']>['deliveryStatus']

export type MutationSource = 'optimistic' | 'realtime' | 'rest' | 'hydration'

export type OptimisticMessageInput = {
  content: string
  correlationId: string
  isInternal: boolean
  optimisticId?: string
  senderName?: string
  senderId?: string
  timestamp?: Date
}

interface MessageState {
  messagesById: Record<string, Message>
  messagesByTicketId: Record<string, string[]>
  correlationIndex: Record<string, string>
  optimisticIndex: Record<string, string>
  providerIndex: Record<string, string>
  addOptimisticMessage: (ticketId: string, input: OptimisticMessageInput) => void
  addMessage: (message: Message) => void
  replaceOptimisticMessage: (tempIdOrCorrelationId: string, message: Message) => void
  markMessageFailed: (messageIdOrCorrelationId: string, error?: string) => void
  resetOutboundToSending: (correlationId: string) => void
  hydrateMessages: (ticketId: string, messages: Message[]) => void
}

const isDevelopment = process.env.NODE_ENV !== 'production'

function devLog(title: string, data?: unknown) {
  if (!isDevelopment) return
  console.groupCollapsed(`[helpdesk:messages] ${title}`)
  if (data !== undefined) console.log(data)
  console.groupEnd()
}

function normalizeDate(value: Date | string | number | undefined): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return new Date()
}

function getDeliveryStatus(message: Message): MessageDeliveryStatus | undefined {
  return message.metadata?.deliveryStatus ?? message.metadata?.delivery_status
}

function getCorrelationId(message: Message): string | undefined {
  return message.metadata?.correlationId ?? message.metadata?.correlation_id
}

function getOptimisticId(message: Message): string | undefined {
  return message.metadata?.optimisticId ?? message.metadata?.optimistic_id
}

function getProviderMessageId(message: Message): string | undefined {
  return message.metadata?.providerMessageId ?? message.metadata?.provider_message_id
}

function getEventTime(message: Message): number {
  const raw =
    message.metadata?.updatedAt ??
    message.metadata?.updated_at ??
    message.metadata?.eventTimestamp ??
    message.metadata?.event_timestamp ??
    message.metadata?.createdAt ??
    message.metadata?.created_at

  return raw ? normalizeDate(raw).getTime() : normalizeDate(message.timestamp).getTime()
}

function normalizeMessage(message: Message): Message {
  const deliveryStatus = getDeliveryStatus(message)
  const timestamp = normalizeDate(message.timestamp)

  return {
    ...message,
    timestamp,
    metadata: {
      ...message.metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
    },
  }
}

function deliveryRank(status: MessageDeliveryStatus | undefined): number {
  if (!status) return 0
  switch (status) {
    case 'sending':
      return 1
    case 'sent':
      return 2
    case 'delivered':
      return 3
    case 'read':
      return 4
    case 'failed':
      return 0
    default:
      return 0
  }
}

/**
 * Monotonic delivery: success chain sending < sent < delivered < read;
 * failed is terminal from in-flight but never overwrites read/delivered.
 * Failed row can move forward again after user retry (sending…).
 */
function pickMonotonicDelivery(
  existing: MessageDeliveryStatus | undefined,
  incoming: MessageDeliveryStatus | undefined
): MessageDeliveryStatus | undefined {
  if (incoming === undefined) return existing
  if (existing === undefined) return incoming

  if (incoming === 'failed') {
    if (existing === 'read' || existing === 'delivered') return existing
    return 'failed'
  }

  if (existing === 'failed') {
    if (incoming === 'sending' || incoming === 'sent' || incoming === 'delivered' || incoming === 'read') {
      return incoming
    }
    return existing
  }

  return deliveryRank(incoming) >= deliveryRank(existing) ? incoming : existing
}

function addUniqueId(ids: string[] | undefined, id: string) {
  if (!ids) return [id]
  if (ids.includes(id)) return ids
  return [...ids, id]
}

function removeId(ids: string[] | undefined, id: string) {
  if (!ids?.includes(id)) return ids ?? []
  return ids.filter((existingId) => existingId !== id)
}

function sortMessageIds(ids: string[], messagesById: Record<string, Message>) {
  const position = new Map(ids.map((id, index) => [id, index]))

  return [...ids].sort((leftId, rightId) => {
    const left = messagesById[leftId]
    const right = messagesById[rightId]
    if (!left || !right) return 0

    const timestampDelta = left.timestamp.getTime() - right.timestamp.getTime()
    if (timestampDelta !== 0) return timestampDelta
    return (position.get(leftId) ?? 0) - (position.get(rightId) ?? 0)
  })
}

function areIdsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function findExistingId(message: Message, state: MessageState): string | undefined {
  if (state.messagesById[message.id]) return message.id

  const correlationId = getCorrelationId(message)
  if (correlationId && state.correlationIndex[correlationId]) {
    return state.correlationIndex[correlationId]
  }

  const optimisticId = getOptimisticId(message)
  if (optimisticId && state.optimisticIndex[optimisticId]) {
    return state.optimisticIndex[optimisticId]
  }

  const providerId = getProviderMessageId(message)
  if (providerId && state.providerIndex[providerId]) {
    return state.providerIndex[providerId]
  }

  return undefined
}

function buildIndexesForMessage(
  message: Message,
  messageId: string,
  correlationIndex: Record<string, string>,
  optimisticIndex: Record<string, string>,
  providerIndex: Record<string, string>
) {
  const correlationId = getCorrelationId(message)
  const optimisticId = getOptimisticId(message)
  const providerId = getProviderMessageId(message)

  if (correlationId) correlationIndex[correlationId] = messageId
  if (optimisticId) optimisticIndex[optimisticId] = messageId
  if (providerId) providerIndex[providerId] = messageId
}

function shouldIgnoreStalePayload(existing: Message, incoming: Message) {
  const existingTime = getEventTime(existing)
  const incomingTime = getEventTime(incoming)
  const existingDelivery = getDeliveryStatus(existing)
  const incomingDelivery = getDeliveryStatus(incoming)
  const picked = pickMonotonicDelivery(existingDelivery, incomingDelivery)
  const advancesDelivery = deliveryRank(picked) > deliveryRank(existingDelivery)

  if (incomingTime < existingTime && !advancesDelivery) {
    devLog('out-of-order message ignored', {
      id: existing.id,
      incomingTime,
      existingTime,
    })
    return true
  }
  return false
}

function mergeMessage(existing: Message, incoming: Message): Message {
  if (shouldIgnoreStalePayload(existing, incoming)) {
    return existing
  }

  const incomingNewerOrEqual = getEventTime(incoming) >= getEventTime(existing)
  const existingDelivery = getDeliveryStatus(existing)
  const incomingDelivery = getDeliveryStatus(incoming)
  const deliveryStatus = pickMonotonicDelivery(existingDelivery, incomingDelivery)

  const mergedProvider = incomingNewerOrEqual
    ? getProviderMessageId(incoming) ?? getProviderMessageId(existing)
    : getProviderMessageId(existing) ?? getProviderMessageId(incoming)

  const mergedCorrelation = getCorrelationId(incoming) ?? getCorrelationId(existing)

  const canonicalId =
    getDeliveryStatus(existing) === 'sending' && incoming.id !== existing.id ? incoming.id : existing.id

  const next: Message = normalizeMessage({
    ...existing,
    ...incoming,
    id: canonicalId,
    content: incomingNewerOrEqual ? incoming.content : existing.content,
    timestamp: incomingNewerOrEqual ? normalizeDate(incoming.timestamp) : existing.timestamp,
    metadata: {
      ...existing.metadata,
      ...incoming.metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
      ...(mergedCorrelation
        ? { correlationId: mergedCorrelation, correlation_id: mergedCorrelation }
        : {}),
      ...(mergedProvider
        ? { providerMessageId: mergedProvider, provider_message_id: mergedProvider }
        : {}),
    },
  })

  const nextDelivery = getDeliveryStatus(next)
  if (
    next.id === existing.id &&
    next.content === existing.content &&
    next.timestamp.getTime() === existing.timestamp.getTime() &&
    nextDelivery === existingDelivery &&
    mergedProvider === getProviderMessageId(existing)
  ) {
    return existing
  }

  return next
}

type UpsertSlice = Pick<
  MessageState,
  'messagesById' | 'messagesByTicketId' | 'correlationIndex' | 'optimisticIndex' | 'providerIndex'
>

function upsertMessage(state: MessageState, incomingMessage: Message, source: MutationSource): UpsertSlice {
  const message = normalizeMessage(incomingMessage)
  const existingId = findExistingId(message, state)
  const messagesById = { ...state.messagesById }
  const messagesByTicketId = { ...state.messagesByTicketId }
  const correlationIndex = { ...state.correlationIndex }
  const optimisticIndex = { ...state.optimisticIndex }
  const providerIndex = { ...state.providerIndex }

  if (existingId) {
    const existingMessage = messagesById[existingId]
    if (!existingMessage) {
      return {
        messagesById,
        messagesByTicketId,
        correlationIndex,
        optimisticIndex,
        providerIndex,
      }
    }

    const shouldReplaceOptimisticId =
      getDeliveryStatus(existingMessage) === 'sending' &&
      source !== 'hydration' &&
      message.id !== existingId

    const incomingForMerge: Message = {
      ...message,
      id: shouldReplaceOptimisticId ? message.id : existingId,
      metadata: {
        ...message.metadata,
        optimisticId: getOptimisticId(message) ?? getOptimisticId(existingMessage) ?? existingId,
        optimistic_id: getOptimisticId(message) ?? getOptimisticId(existingMessage) ?? existingId,
      },
    }

    const nextMessage = mergeMessage(existingMessage, incomingForMerge)

    if (nextMessage === existingMessage) {
      buildIndexesForMessage(existingMessage, existingId, correlationIndex, optimisticIndex, providerIndex)
      return {
        messagesById,
        messagesByTicketId,
        correlationIndex,
        optimisticIndex,
        providerIndex,
      }
    }

    if (nextMessage.id !== existingId) {
      delete messagesById[existingId]
      messagesByTicketId[nextMessage.conversationId] = addUniqueId(
        removeId(messagesByTicketId[nextMessage.conversationId], existingId),
        nextMessage.id
      )
    }

    messagesById[nextMessage.id] = nextMessage
    const prevOrder = messagesByTicketId[nextMessage.conversationId] ?? []
    const nextOrder = sortMessageIds(
      addUniqueId(messagesByTicketId[nextMessage.conversationId], nextMessage.id),
      messagesById
    )
    messagesByTicketId[nextMessage.conversationId] = areIdsEqual(prevOrder, nextOrder)
      ? prevOrder
      : nextOrder

    buildIndexesForMessage(nextMessage, nextMessage.id, correlationIndex, optimisticIndex, providerIndex)

    devLog('duplicate/reconciled message', { existingId, nextId: nextMessage.id, source })
    return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex, providerIndex }
  }

  messagesById[message.id] = message
  const prevOrderNew = messagesByTicketId[message.conversationId] ?? []
  const nextOrderNew = sortMessageIds(
    addUniqueId(messagesByTicketId[message.conversationId], message.id),
    messagesById
  )
  messagesByTicketId[message.conversationId] = areIdsEqual(prevOrderNew, nextOrderNew) ? prevOrderNew : nextOrderNew

  buildIndexesForMessage(message, message.id, correlationIndex, optimisticIndex, providerIndex)

  return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex, providerIndex }
}

function resolveMessageId(state: MessageState, messageIdOrCorrelationId: string): string | undefined {
  return (
    state.messagesById[messageIdOrCorrelationId]?.id ??
    state.correlationIndex[messageIdOrCorrelationId] ??
    state.optimisticIndex[messageIdOrCorrelationId]
  )
}

export const useMessageStore = create<MessageState>((set) => ({
  messagesById: {},
  messagesByTicketId: {},
  correlationIndex: {},
  optimisticIndex: {},
  providerIndex: {},

  addOptimisticMessage: (ticketId, input) =>
    set((state) => {
      if (state.correlationIndex[input.correlationId]) {
        return state
      }

      const optimisticId = input.optimisticId ?? `tmp-${crypto.randomUUID()}`
      const message: Message = {
        id: optimisticId,
        conversationId: ticketId,
        type: 'agent',
        content: input.content.trim(),
        timestamp: input.timestamp ?? new Date(),
        senderName: input.senderName,
        senderId: input.senderId,
        isInternal: input.isInternal,
        metadata: {
          deliveryStatus: 'sending',
          delivery_status: 'sending',
          correlationId: input.correlationId,
          correlation_id: input.correlationId,
          optimisticId,
          optimistic_id: optimisticId,
        },
      }

      return { ...state, ...upsertMessage(state, message, 'optimistic') }
    }),

  addMessage: (message) =>
    set((state) => ({
      ...state,
      ...upsertMessage(state, message, 'realtime'),
    })),

  replaceOptimisticMessage: (tempIdOrCorrelationId, confirmedMessage) =>
    set((state) => {
      const existingId =
        state.messagesById[tempIdOrCorrelationId]?.id ??
        state.correlationIndex[tempIdOrCorrelationId] ??
        state.optimisticIndex[tempIdOrCorrelationId]

      if (!existingId) {
        return { ...state, ...upsertMessage(state, confirmedMessage, 'rest') }
      }

      return {
        ...state,
        ...upsertMessage(
          state,
          {
            ...confirmedMessage,
            metadata: {
              ...confirmedMessage.metadata,
              optimisticId: existingId,
              optimistic_id: existingId,
            },
          },
          'rest'
        ),
      }
    }),

  markMessageFailed: (messageIdOrCorrelationId, error) =>
    set((state) => {
      const messageId = resolveMessageId(state, messageIdOrCorrelationId)
      if (!messageId) return state

      const message = state.messagesById[messageId]
      if (!message || getDeliveryStatus(message) === 'failed') return state

      const nextDelivery = pickMonotonicDelivery(getDeliveryStatus(message), 'failed')
      if (nextDelivery !== 'failed') return state

      return {
        ...state,
        messagesById: {
          ...state.messagesById,
          [messageId]: {
            ...message,
            metadata: {
              ...message.metadata,
              deliveryStatus: 'failed',
              delivery_status: 'failed',
              error,
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        },
      }
    }),

  resetOutboundToSending: (correlationId) =>
    set((state) => {
      const messageId = state.correlationIndex[correlationId]
      if (!messageId) return state
      const message = state.messagesById[messageId]
      if (!message) return state

      return {
        ...state,
        messagesById: {
          ...state.messagesById,
          [messageId]: {
            ...message,
            metadata: {
              ...message.metadata,
              deliveryStatus: 'sending',
              delivery_status: 'sending',
              error: undefined,
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        },
      }
    }),

  hydrateMessages: (ticketId, messages) =>
    set((state) => {
      let nextState: MessageState = state

      messages.forEach((message) => {
        const slice = upsertMessage(
          nextState,
          {
            ...message,
            conversationId: message.conversationId || ticketId,
          },
          'hydration'
        )
        nextState = { ...nextState, ...slice }
      })

      const ids = nextState.messagesByTicketId[ticketId] ?? []
      const sortedIds = sortMessageIds(ids, nextState.messagesById)
      if (areIdsEqual(ids, sortedIds)) return nextState

      return {
        ...nextState,
        messagesByTicketId: {
          ...nextState.messagesByTicketId,
          [ticketId]: sortedIds,
        },
      }
    }),
}))
