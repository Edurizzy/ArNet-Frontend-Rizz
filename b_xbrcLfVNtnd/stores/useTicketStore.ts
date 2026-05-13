'use client'

import { create } from 'zustand'
import type { Conversation } from '@/types/domain'

type TicketPatch = Partial<Conversation> & {
  id: string
  eventTimestamp?: Date | string
}

interface TicketState {
  ticketsById: Record<string, Conversation>
  queueIds: string[]
  hydrateTickets: (tickets: Conversation[]) => void
  updateTicket: (ticket: TicketPatch) => void
  markTicketUnread: (ticketId: string, incrementBy?: number) => void
  clearUnread: (ticketId: string) => void
}

const isDevelopment = process.env.NODE_ENV !== 'production'

function devLog(title: string, data?: unknown) {
  if (!isDevelopment) return
  console.groupCollapsed(`[helpdesk:tickets] ${title}`)
  if (data !== undefined) console.log(data)
  console.groupEnd()
}

function toDate(value: Date | string | undefined): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  return new Date()
}

function normalizeTicket(ticket: Conversation): Conversation {
  return {
    ...ticket,
    startedAt: toDate(ticket.startedAt),
    updatedAt: toDate(ticket.updatedAt),
    resolvedAt: ticket.resolvedAt ? toDate(ticket.resolvedAt) : undefined,
  }
}

function createPlaceholderTicket(ticket: TicketPatch): Conversation {
  const now = toDate(ticket.updatedAt ?? ticket.eventTimestamp)

  return normalizeTicket({
    id: ticket.id,
    customerId: ticket.customerId ?? ticket.id,
    customerName: ticket.customerName ?? 'Cliente',
    channel: ticket.channel ?? 'whatsapp',
    status: ticket.status ?? 'open',
    priority: ticket.priority ?? 'medium',
    assignedAgentId: ticket.assignedAgentId,
    assignedAIAgentId: ticket.assignedAIAgentId,
    subject: ticket.subject ?? 'Atendimento receptivo',
    lastMessage: ticket.lastMessage,
    unreadCount: ticket.unreadCount ?? 0,
    sentiment: ticket.sentiment,
    tags: ticket.tags ?? [],
    startedAt: ticket.startedAt ?? now,
    updatedAt: ticket.updatedAt ?? now,
    resolvedAt: ticket.resolvedAt,
  })
}

function getTicketTime(ticket: Conversation | TicketPatch) {
  const eventTimestamp = 'eventTimestamp' in ticket ? ticket.eventTimestamp : undefined
  return toDate(eventTimestamp ?? ticket.updatedAt).getTime()
}

function mergeTicket(
  existingTicket: Conversation | undefined,
  incomingTicket: TicketPatch,
  source: 'hydration' | 'realtime'
): Conversation {
  if (!existingTicket) return createPlaceholderTicket(incomingTicket)

  const existing = normalizeTicket(existingTicket)
  const incomingTime = getTicketTime(incomingTicket)
  const existingTime = getTicketTime(existing)
  const isOlder = incomingTime < existingTime

  if (isOlder) {
    devLog('out-of-order ticket update ignored', {
      id: incomingTicket.id,
      incomingTime,
      existingTime,
      source,
    })
  }

  if (isOlder) {
    return normalizeTicket({
      ...existing,
      customerId: existing.customerId || incomingTicket.customerId || existing.id,
      customerName: existing.customerName || incomingTicket.customerName || 'Cliente',
      subject: existing.subject || incomingTicket.subject,
      lastMessage: existing.lastMessage || incomingTicket.lastMessage,
      tags: existing.tags.length > 0 ? existing.tags : incomingTicket.tags ?? [],
    })
  }

  return normalizeTicket({
    ...existing,
    ...incomingTicket,
    unreadCount:
      source === 'hydration'
        ? Math.max(existing.unreadCount, incomingTicket.unreadCount ?? 0)
        : incomingTicket.unreadCount ?? existing.unreadCount,
    tags: incomingTicket.tags ?? existing.tags,
    startedAt: incomingTicket.startedAt ?? existing.startedAt,
    updatedAt: toDate(incomingTicket.updatedAt ?? incomingTicket.eventTimestamp ?? existing.updatedAt),
  })
}

function sortQueueIds(queueIds: string[], ticketsById: Record<string, Conversation>) {
  const position = new Map(queueIds.map((id, index) => [id, index]))

  return [...queueIds].sort((leftId, rightId) => {
    const left = ticketsById[leftId]
    const right = ticketsById[rightId]
    if (!left || !right) return 0

    const unreadDelta = Number(right.unreadCount > 0) - Number(left.unreadCount > 0)
    if (unreadDelta !== 0) return unreadDelta

    const updatedDelta = right.updatedAt.getTime() - left.updatedAt.getTime()
    if (updatedDelta !== 0) return updatedDelta

    return (position.get(leftId) ?? 0) - (position.get(rightId) ?? 0)
  })
}

function areIdsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function addTicketId(queueIds: string[], ticketId: string) {
  return queueIds.includes(ticketId) ? queueIds : [...queueIds, ticketId]
}

function areTicketsEqual(left: Conversation, right: Conversation) {
  return (
    left.id === right.id &&
    left.customerId === right.customerId &&
    left.customerName === right.customerName &&
    left.channel === right.channel &&
    left.status === right.status &&
    left.priority === right.priority &&
    left.assignedAgentId === right.assignedAgentId &&
    left.assignedAIAgentId === right.assignedAIAgentId &&
    left.subject === right.subject &&
    left.lastMessage === right.lastMessage &&
    left.unreadCount === right.unreadCount &&
    left.sentiment === right.sentiment &&
    left.updatedAt.getTime() === right.updatedAt.getTime() &&
    left.tags.length === right.tags.length &&
    left.tags.every((tag, index) => tag === right.tags[index])
  )
}

function commitTickets(
  state: TicketState,
  ticketsById: Record<string, Conversation>,
  queueIds: string[]
) {
  const sortedQueueIds = sortQueueIds(queueIds, ticketsById)
  const nextQueueIds = areIdsEqual(queueIds, sortedQueueIds) ? queueIds : sortedQueueIds

  if (state.ticketsById === ticketsById && state.queueIds === nextQueueIds) return state

  return {
    ticketsById,
    queueIds: nextQueueIds,
  }
}

export const useTicketStore = create<TicketState>((set) => ({
  ticketsById: {},
  queueIds: [],

  hydrateTickets: (tickets) =>
    set((state) => {
      let ticketsById = state.ticketsById
      let queueIds = state.queueIds
      let changed = false

      tickets.forEach((ticket) => {
        const normalizedTicket = normalizeTicket(ticket)
        const nextTicket = mergeTicket(ticketsById[normalizedTicket.id], normalizedTicket, 'hydration')

        if (!ticketsById[normalizedTicket.id] || !areTicketsEqual(ticketsById[normalizedTicket.id], nextTicket)) {
          ticketsById = { ...ticketsById, [normalizedTicket.id]: nextTicket }
          changed = true
        }

        const nextQueueIds = addTicketId(queueIds, normalizedTicket.id)
        if (nextQueueIds !== queueIds) {
          queueIds = nextQueueIds
          changed = true
        }
      })

      if (!changed) return state
      return commitTickets(state, ticketsById, queueIds)
    }),

  updateTicket: (ticket) =>
    set((state) => {
      const nextTicket = mergeTicket(state.ticketsById[ticket.id], ticket, 'realtime')
      const existingTicket = state.ticketsById[ticket.id]
      const queueIds = addTicketId(state.queueIds, ticket.id)

      if (existingTicket && areTicketsEqual(existingTicket, nextTicket) && queueIds === state.queueIds) {
        return state
      }

      const ticketsById = {
        ...state.ticketsById,
        [ticket.id]: nextTicket,
      }

      return commitTickets(state, ticketsById, queueIds)
    }),

  markTicketUnread: (ticketId, incrementBy = 1) =>
    set((state) => {
      const ticket = state.ticketsById[ticketId]
      if (!ticket) return state

      const nextTicket = {
        ...ticket,
        unreadCount: ticket.unreadCount + incrementBy,
        updatedAt: new Date(),
      }
      const ticketsById = {
        ...state.ticketsById,
        [ticketId]: nextTicket,
      }

      return commitTickets(state, ticketsById, state.queueIds)
    }),

  clearUnread: (ticketId) =>
    set((state) => {
      const ticket = state.ticketsById[ticketId]
      if (!ticket || ticket.unreadCount === 0) return state

      const ticketsById = {
        ...state.ticketsById,
        [ticketId]: {
          ...ticket,
          unreadCount: 0,
        },
      }

      return commitTickets(state, ticketsById, state.queueIds)
    }),
}))
