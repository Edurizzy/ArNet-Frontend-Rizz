'use client'

import { create } from 'zustand'
import type { Conversation } from '@/types/domain'

interface TicketState {
  ticketsById: Record<string, Conversation>
  queueIds: string[]
  hydrateTickets: (tickets: Conversation[]) => void
  updateTicket: (ticket: Partial<Conversation> & { id: string }) => void
  markTicketUnread: (ticketId: string, incrementBy?: number) => void
  clearUnread: (ticketId: string) => void
}

function normalizeTicket(ticket: Conversation): Conversation {
  return {
    ...ticket,
    startedAt: ticket.startedAt instanceof Date ? ticket.startedAt : new Date(ticket.startedAt),
    updatedAt: ticket.updatedAt instanceof Date ? ticket.updatedAt : new Date(ticket.updatedAt),
    resolvedAt: ticket.resolvedAt
      ? ticket.resolvedAt instanceof Date
        ? ticket.resolvedAt
        : new Date(ticket.resolvedAt)
      : undefined,
  }
}

function sortQueueIds(queueIds: string[], ticketsById: Record<string, Conversation>) {
  return [...queueIds].sort((leftId, rightId) => {
    const left = ticketsById[leftId]
    const right = ticketsById[rightId]
    if (!left || !right) return 0

    const unreadDelta = Number(right.unreadCount > 0) - Number(left.unreadCount > 0)
    if (unreadDelta !== 0) return unreadDelta

    const updatedDelta = right.updatedAt.getTime() - left.updatedAt.getTime()
    if (updatedDelta !== 0) return updatedDelta

    return queueIds.indexOf(leftId) - queueIds.indexOf(rightId)
  })
}

function areIdsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function addTicketId(queueIds: string[], ticketId: string) {
  return queueIds.includes(ticketId) ? queueIds : [...queueIds, ticketId]
}

export const useTicketStore = create<TicketState>((set) => ({
  ticketsById: {},
  queueIds: [],

  hydrateTickets: (tickets) =>
    set((state) => {
      const ticketsById = { ...state.ticketsById }
      let queueIds = state.queueIds

      tickets.forEach((ticket) => {
        const normalizedTicket = normalizeTicket(ticket)
        ticketsById[normalizedTicket.id] = {
          ...ticketsById[normalizedTicket.id],
          ...normalizedTicket,
          unreadCount: ticketsById[normalizedTicket.id]?.unreadCount ?? normalizedTicket.unreadCount,
        }
        queueIds = addTicketId(queueIds, normalizedTicket.id)
      })

      const sortedQueueIds = sortQueueIds(queueIds, ticketsById)

      return {
        ticketsById,
        queueIds: areIdsEqual(queueIds, sortedQueueIds) ? queueIds : sortedQueueIds,
      }
    }),

  updateTicket: (ticket) =>
    set((state) => {
      const existingTicket = state.ticketsById[ticket.id]
      if (!existingTicket && !ticket.customerId) return state

      const nextTicket = normalizeTicket({
        ...(existingTicket as Conversation),
        ...ticket,
        unreadCount: ticket.unreadCount ?? existingTicket?.unreadCount ?? 0,
        tags: ticket.tags ?? existingTicket?.tags ?? [],
        startedAt: ticket.startedAt ?? existingTicket?.startedAt ?? new Date(),
        updatedAt: ticket.updatedAt ?? existingTicket?.updatedAt ?? new Date(),
      })

      const ticketsById = {
        ...state.ticketsById,
        [ticket.id]: nextTicket,
      }
      const queueIds = addTicketId(state.queueIds, ticket.id)
      const sortedQueueIds = sortQueueIds(queueIds, ticketsById)

      return {
        ticketsById,
        queueIds: areIdsEqual(queueIds, sortedQueueIds) ? queueIds : sortedQueueIds,
      }
    }),

  markTicketUnread: (ticketId, incrementBy = 1) =>
    set((state) => {
      const ticket = state.ticketsById[ticketId]
      if (!ticket) return state

      const ticketsById = {
        ...state.ticketsById,
        [ticketId]: {
          ...ticket,
          unreadCount: ticket.unreadCount + incrementBy,
          updatedAt: new Date(),
        },
      }
      const sortedQueueIds = sortQueueIds(state.queueIds, ticketsById)

      return {
        ticketsById,
        queueIds: areIdsEqual(state.queueIds, sortedQueueIds) ? state.queueIds : sortedQueueIds,
      }
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
      const sortedQueueIds = sortQueueIds(state.queueIds, ticketsById)

      return {
        ticketsById,
        queueIds: areIdsEqual(state.queueIds, sortedQueueIds) ? state.queueIds : sortedQueueIds,
      }
    }),
}))
