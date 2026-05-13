'use client'

import { create } from 'zustand'
import type { Message } from '@/types/atendimento'

export type MessageDeliveryStatus = NonNullable<Message['metadata']>['deliveryStatus']

type MutationSource = 'realtime' | 'hydration' | 'optimistic'

interface MessageState {
  messagesById: Record<string, Message>
  messagesByTicketId: Record<string, string[]>
  correlationIndex: Record<string, string>
  optimisticIndex: Record<string, string>
  addMessage: (message: Message) => void
  replaceOptimisticMessage: (tempIdOrCorrelationId: string, message: Message) => void
  markMessageFailed: (messageId: string, error?: string) => void
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
  const correlationId = getCorrelationId(message)
  const optimisticId = getOptimisticId(message)

  return (
    state.messagesById[message.id]?.id ??
    (correlationId ? state.correlationIndex[correlationId] : undefined) ??
    (optimisticId ? state.optimisticIndex[optimisticId] : undefined)
  )
}

function buildIndexesForMessage(
  message: Message,
  messageId: string,
  correlationIndex: Record<string, string>,
  optimisticIndex: Record<string, string>
) {
  const correlationId = getCorrelationId(message)
  const optimisticId = getOptimisticId(message)

  if (correlationId) correlationIndex[correlationId] = messageId
  if (optimisticId) optimisticIndex[optimisticId] = messageId
}

function shouldPreserveExisting(existing: Message, incoming: Message, source: MutationSource) {
  const existingStatus = getDeliveryStatus(existing)
  const incomingStatus = getDeliveryStatus(incoming)

  if (source === 'hydration' && (existingStatus === 'sending' || existingStatus === 'failed')) {
    return true
  }

  if (existingStatus === 'sent' && incomingStatus === 'sending') {
    return true
  }

  const existingTime = getEventTime(existing)
  const incomingTime = getEventTime(incoming)
  if (incomingTime < existingTime) {
    devLog('out-of-order message ignored', {
      id: existing.id,
      incomingTime,
      existingTime,
      source,
    })
    return true
  }

  return false
}

function mergeMessage(existing: Message, incoming: Message, source: MutationSource): Message {
  if (shouldPreserveExisting(existing, incoming, source)) {
    return existing
  }

  const existingStatus = getDeliveryStatus(existing)
  const incomingStatus = getDeliveryStatus(incoming)
  const deliveryStatus =
    incomingStatus ?? (existingStatus === 'sending' && source !== 'hydration' ? 'sent' : existingStatus)

  return normalizeMessage({
    ...existing,
    ...incoming,
    metadata: {
      ...existing.metadata,
      ...incoming.metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
    },
  })
}

function upsertMessage(state: MessageState, incomingMessage: Message, source: MutationSource) {
  const message = normalizeMessage(incomingMessage)
  const existingId = findExistingId(message, state)
  const messagesById = { ...state.messagesById }
  const messagesByTicketId = { ...state.messagesByTicketId }
  const correlationIndex = { ...state.correlationIndex }
  const optimisticIndex = { ...state.optimisticIndex }

  if (existingId) {
    const existingMessage = messagesById[existingId]
    if (!existingMessage) return state

    const shouldReplaceOptimisticId =
      getDeliveryStatus(existingMessage) === 'sending' &&
      source !== 'hydration' &&
      message.id !== existingId
    const nextMessage = mergeMessage(
      existingMessage,
      {
        ...message,
        id: shouldReplaceOptimisticId ? message.id : existingId,
        metadata: {
          ...message.metadata,
          optimisticId: getOptimisticId(message) ?? existingId,
          optimistic_id: getOptimisticId(message) ?? existingId,
        },
      },
      source
    )

    if (nextMessage === existingMessage) {
      buildIndexesForMessage(existingMessage, existingId, correlationIndex, optimisticIndex)
      return {
        ...state,
        correlationIndex,
        optimisticIndex,
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
    messagesByTicketId[nextMessage.conversationId] = sortMessageIds(
      addUniqueId(messagesByTicketId[nextMessage.conversationId], nextMessage.id),
      messagesById
    )
    buildIndexesForMessage(nextMessage, nextMessage.id, correlationIndex, optimisticIndex)

    devLog('duplicate/reconciled message', { existingId, nextId: nextMessage.id, source })
    return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
  }

  messagesById[message.id] = message
  messagesByTicketId[message.conversationId] = sortMessageIds(
    addUniqueId(messagesByTicketId[message.conversationId], message.id),
    messagesById
  )
  buildIndexesForMessage(message, message.id, correlationIndex, optimisticIndex)

  return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
}

export const useMessageStore = create<MessageState>((set) => ({
  messagesById: {},
  messagesByTicketId: {},
  correlationIndex: {},
  optimisticIndex: {},

  addMessage: (message) =>
    set((state) => upsertMessage(state, message, getDeliveryStatus(message) === 'sending' ? 'optimistic' : 'realtime')),

  replaceOptimisticMessage: (tempIdOrCorrelationId, confirmedMessage) =>
    set((state) => {
      const existingId =
        state.messagesById[tempIdOrCorrelationId]?.id ??
        state.correlationIndex[tempIdOrCorrelationId] ??
        state.optimisticIndex[tempIdOrCorrelationId]

      if (!existingId) {
        return upsertMessage(state, confirmedMessage, 'realtime')
      }

      return upsertMessage(
        state,
        {
          ...confirmedMessage,
          metadata: {
            ...confirmedMessage.metadata,
            deliveryStatus: 'sent',
            delivery_status: 'sent',
            optimisticId: existingId,
            optimistic_id: existingId,
          },
        },
        'realtime'
      )
    }),

  markMessageFailed: (messageId, error) =>
    set((state) => {
      const message = state.messagesById[messageId]
      if (!message || getDeliveryStatus(message) === 'failed') return state

      return {
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

  hydrateMessages: (ticketId, messages) =>
    set((state) => {
      let nextState: MessageState = state

      messages.forEach((message) => {
        nextState = {
          ...nextState,
          ...upsertMessage(
            nextState,
            {
              ...message,
              conversationId: message.conversationId || ticketId,
            },
            'hydration'
          ),
        }
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
