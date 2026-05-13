'use client'

import { create } from 'zustand'
import type { Message } from '@/types/atendimento'

export type MessageDeliveryStatus = NonNullable<Message['metadata']>['deliveryStatus']

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

function normalizeDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

function normalizeMessage(message: Message): Message {
  const deliveryStatus = message.metadata?.deliveryStatus ?? message.metadata?.delivery_status

  return {
    ...message,
    timestamp: normalizeDate(message.timestamp),
    metadata: {
      ...message.metadata,
      ...(deliveryStatus ? { deliveryStatus, delivery_status: deliveryStatus } : {}),
    },
  }
}

function getCorrelationId(message: Message): string | undefined {
  return message.metadata?.correlationId ?? message.metadata?.correlation_id
}

function getOptimisticId(message: Message): string | undefined {
  return message.metadata?.optimisticId ?? message.metadata?.optimistic_id
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
  return [...ids].sort((leftId, rightId) => {
    const left = messagesById[leftId]
    const right = messagesById[rightId]
    if (!left || !right) return 0

    const timestampDelta = left.timestamp.getTime() - right.timestamp.getTime()
    if (timestampDelta !== 0) return timestampDelta
    return ids.indexOf(leftId) - ids.indexOf(rightId)
  })
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

export const useMessageStore = create<MessageState>((set) => ({
  messagesById: {},
  messagesByTicketId: {},
  correlationIndex: {},
  optimisticIndex: {},

  addMessage: (incomingMessage) =>
    set((state) => {
      const message = normalizeMessage(incomingMessage)
      const existingId = findExistingId(message, state)

      if (existingId) {
        const existingMessage = state.messagesById[existingId]
        const nextMessage = normalizeMessage({
          ...existingMessage,
          ...message,
          id: existingMessage.metadata?.deliveryStatus === 'sending' ? message.id : existingMessage.id,
          metadata: {
            ...existingMessage.metadata,
            ...message.metadata,
            deliveryStatus: message.metadata?.deliveryStatus ?? 'sent',
            delivery_status: message.metadata?.delivery_status ?? 'sent',
          },
        })

        const messagesById = { ...state.messagesById }
        const messagesByTicketId = { ...state.messagesByTicketId }
        const correlationIndex = { ...state.correlationIndex }
        const optimisticIndex = { ...state.optimisticIndex }

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

        return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
      }

      const messagesById = { ...state.messagesById, [message.id]: message }
      const messagesByTicketId = {
        ...state.messagesByTicketId,
        [message.conversationId]: sortMessageIds(
          addUniqueId(state.messagesByTicketId[message.conversationId], message.id),
          messagesById
        ),
      }
      const correlationIndex = { ...state.correlationIndex }
      const optimisticIndex = { ...state.optimisticIndex }

      buildIndexesForMessage(message, message.id, correlationIndex, optimisticIndex)

      return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
    }),

  replaceOptimisticMessage: (tempIdOrCorrelationId, confirmedMessage) =>
    set((state) => {
      const existingId =
        state.messagesById[tempIdOrCorrelationId]?.id ??
        state.correlationIndex[tempIdOrCorrelationId] ??
        state.optimisticIndex[tempIdOrCorrelationId]

      if (!existingId) return state

      const existingMessage = state.messagesById[existingId]
      const message = normalizeMessage({
        ...existingMessage,
        ...confirmedMessage,
        metadata: {
          ...existingMessage.metadata,
          ...confirmedMessage.metadata,
          deliveryStatus: 'sent',
          delivery_status: 'sent',
          optimisticId: existingMessage.id,
          optimistic_id: existingMessage.id,
        },
      })

      const messagesById = { ...state.messagesById }
      const messagesByTicketId = { ...state.messagesByTicketId }
      const correlationIndex = { ...state.correlationIndex }
      const optimisticIndex = { ...state.optimisticIndex }

      delete messagesById[existingId]
      messagesById[message.id] = message
      messagesByTicketId[message.conversationId] = sortMessageIds(
        addUniqueId(removeId(messagesByTicketId[message.conversationId], existingId), message.id),
        messagesById
      )
      buildIndexesForMessage(message, message.id, correlationIndex, optimisticIndex)

      return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
    }),

  markMessageFailed: (messageId, error) =>
    set((state) => {
      const message = state.messagesById[messageId]
      if (!message) return state

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
            },
          },
        },
      }
    }),

  hydrateMessages: (ticketId, messages) =>
    set((state) => {
      const messagesById = { ...state.messagesById }
      const messagesByTicketId = { ...state.messagesByTicketId }
      const correlationIndex = { ...state.correlationIndex }
      const optimisticIndex = { ...state.optimisticIndex }
      let ids = messagesByTicketId[ticketId] ?? []

      messages.forEach((incomingMessage) => {
        const message = normalizeMessage(incomingMessage)
        const existingId = findExistingId(message, {
          ...state,
          messagesById,
          messagesByTicketId,
          correlationIndex,
          optimisticIndex,
        })

        if (existingId) {
          messagesById[existingId] = {
            ...messagesById[existingId],
            ...message,
            id: existingId,
            metadata: {
              ...messagesById[existingId]?.metadata,
              ...message.metadata,
            },
          }
          ids = addUniqueId(ids, existingId)
          buildIndexesForMessage(messagesById[existingId], existingId, correlationIndex, optimisticIndex)
          return
        }

        messagesById[message.id] = message
        ids = addUniqueId(ids, message.id)
        buildIndexesForMessage(message, message.id, correlationIndex, optimisticIndex)
      })

      messagesByTicketId[ticketId] = sortMessageIds(ids, messagesById)

      return { messagesById, messagesByTicketId, correlationIndex, optimisticIndex }
    }),
}))
