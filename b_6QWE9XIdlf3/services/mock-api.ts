// Mock API services with simulated network latency
// Prepared for future Django REST + WebSocket backend integration

import type { User, Customer, Conversation, AIAgent, SystemStatus } from '@/types/domain'
import { 
  mockCurrentUser, 
  mockCustomers, 
  mockConversations, 
  mockAIAgents, 
  mockSystemStatus 
} from '@/lib/mock-data'

// Simulated network delay (200-600ms)
const simulateLatency = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 400 + 200)
)

// User services
export async function getCurrentUser(): Promise<User> {
  await simulateLatency()
  return mockCurrentUser
}

// Customer services
export async function getCustomers(): Promise<Customer[]> {
  await simulateLatency()
  return mockCustomers
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await simulateLatency()
  return mockCustomers.find(c => c.id === id) || null
}

export async function getCustomerStats(): Promise<{
  total: number
  active: number
  atRisk: number
  avgHealthScore: number
}> {
  await simulateLatency()
  const active = mockCustomers.filter(c => c.status === 'active').length
  const atRisk = mockCustomers.filter(c => c.healthScore < 70).length
  const avgHealth = mockCustomers.reduce((acc, c) => acc + c.healthScore, 0) / mockCustomers.length
  
  return {
    total: mockCustomers.length,
    active,
    atRisk,
    avgHealthScore: Math.round(avgHealth),
  }
}

// Conversation services
export async function getConversations(): Promise<Conversation[]> {
  await simulateLatency()
  return mockConversations
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  await simulateLatency()
  return mockConversations.find(c => c.id === id) || null
}

export async function getConversationStats(): Promise<{
  total: number
  open: number
  pending: number
  avgResponseTime: number
}> {
  await simulateLatency()
  return {
    total: mockConversations.length,
    open: mockConversations.filter(c => c.status === 'open').length,
    pending: mockConversations.filter(c => c.status === 'pending').length,
    avgResponseTime: 1250,
  }
}

// AI Agent services
export async function getAIAgents(): Promise<AIAgent[]> {
  await simulateLatency()
  return mockAIAgents
}

export async function getAIAgentById(id: string): Promise<AIAgent | null> {
  await simulateLatency()
  return mockAIAgents.find(a => a.id === id) || null
}

export async function getAIAgentStats(): Promise<{
  total: number
  active: number
  avgSatisfaction: number
  totalConversations: number
}> {
  await simulateLatency()
  const active = mockAIAgents.filter(a => a.status === 'active').length
  const avgSat = mockAIAgents.reduce((acc, a) => acc + a.satisfactionScore, 0) / mockAIAgents.length
  const totalConvs = mockAIAgents.reduce((acc, a) => acc + a.conversationsHandled, 0)
  
  return {
    total: mockAIAgents.length,
    active,
    avgSatisfaction: Math.round(avgSat),
    totalConversations: totalConvs,
  }
}

// System status services
export async function getSystemStatus(): Promise<SystemStatus> {
  await simulateLatency()
  return {
    ...mockSystemStatus,
    lastSync: new Date(),
  }
}

// Dashboard aggregated data
export async function getDashboardData(): Promise<{
  conversationStats: Awaited<ReturnType<typeof getConversationStats>>
  customerStats: Awaited<ReturnType<typeof getCustomerStats>>
  aiStats: Awaited<ReturnType<typeof getAIAgentStats>>
}> {
  const [conversationStats, customerStats, aiStats] = await Promise.all([
    getConversationStats(),
    getCustomerStats(),
    getAIAgentStats(),
  ])
  
  return { conversationStats, customerStats, aiStats }
}
