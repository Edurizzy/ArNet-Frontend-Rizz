'use client'

import { create } from 'zustand'
import type { Conversation } from '@/types/domain'
import type { Message, CustomerProfile, TicketQueueFilters } from '@/types/atendimento'

// Ticket Queue UI State (separate from data)
interface TicketQueueUIState {
  filters: TicketQueueFilters
  setFilters: (filters: Partial<TicketQueueFilters>) => void
  resetFilters: () => void
}

const defaultFilters: TicketQueueFilters = {
  status: 'all',
  searchQuery: '',
}

export const useTicketQueueUIStore = create<TicketQueueUIState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({ filters: defaultFilters }),
}))

// Active Conversation State
interface ActiveConversationState {
  selectedConversationId: string | null
  conversation: Conversation | null
  messages: Message[]
  customerProfile: CustomerProfile | null
  isLoadingMessages: boolean
  isLoadingProfile: boolean
  isSendingMessage: boolean
  
  // Actions
  selectConversation: (id: string | null) => void
  setConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessageStatus: (messageId: string, status: Message['metadata']) => void
  setCustomerProfile: (profile: CustomerProfile | null) => void
  setLoadingMessages: (loading: boolean) => void
  setLoadingProfile: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  clearSelection: () => void
}

export const useActiveConversationStore = create<ActiveConversationState>((set) => ({
  selectedConversationId: null,
  conversation: null,
  messages: [],
  customerProfile: null,
  isLoadingMessages: false,
  isLoadingProfile: false,
  isSendingMessage: false,

  selectConversation: (id) => set({ 
    selectedConversationId: id,
    // Clear previous data when selecting new conversation
    messages: [],
    customerProfile: null,
  }),
  
  setConversation: (conversation) => set({ conversation }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateMessageStatus: (messageId, metadata) => set((state) => ({
    messages: state.messages.map((m) => 
      m.id === messageId ? { ...m, metadata: { ...m.metadata, ...metadata } } : m
    ),
  })),
  
  setCustomerProfile: (customerProfile) => set({ customerProfile }),
  
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  
  setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
  
  setSendingMessage: (isSendingMessage) => set({ isSendingMessage }),
  
  clearSelection: () => set({
    selectedConversationId: null,
    conversation: null,
    messages: [],
    customerProfile: null,
  }),
}))

// Customer Context Panel UI State
interface CustomerContextUIState {
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

export const useCustomerContextUIStore = create<CustomerContextUIState>((set) => ({
  isCollapsed: false,
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}))

// Composer State
interface ComposerState {
  content: string
  isInternalNote: boolean
  isAttaching: boolean
  setContent: (content: string) => void
  setInternalNote: (isInternal: boolean) => void
  setAttaching: (attaching: boolean) => void
  reset: () => void
}

export const useComposerStore = create<ComposerState>((set) => ({
  content: '',
  isInternalNote: false,
  isAttaching: false,
  setContent: (content) => set({ content }),
  setInternalNote: (isInternalNote) => set({ isInternalNote }),
  setAttaching: (isAttaching) => set({ isAttaching }),
  reset: () => set({ content: '', isInternalNote: false, isAttaching: false }),
}))
