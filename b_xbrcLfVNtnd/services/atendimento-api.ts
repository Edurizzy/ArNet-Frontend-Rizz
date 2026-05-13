// Mock data and services for Atendimento module
import type { Message, CustomerProfile, SLAInfo } from '@/types/atendimento'
import type { Conversation } from '@/types/domain'

// Extended mock conversations with more details
export const mockAtendimentoConversations: Conversation[] = [
  {
    id: 'conv-001',
    customerId: 'cust-001',
    customerName: 'Maria Silva',
    channel: 'whatsapp',
    status: 'open',
    priority: 'high',
    assignedAIAgentId: 'ai-001',
    subject: 'Internet instável há 3 dias',
    lastMessage: 'Já reiniciei o modem várias vezes e continua caindo',
    unreadCount: 2,
    sentiment: 'negative',
    tags: ['suporte técnico', 'queda de rede'],
    startedAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 300000),
  },
  {
    id: 'conv-002',
    customerId: 'cust-002',
    customerName: 'João Pereira',
    channel: 'chat',
    status: 'pending',
    priority: 'medium',
    assignedAgentId: 'user-001',
    subject: 'Dúvida sobre upgrade de plano',
    lastMessage: 'Qual o valor do plano de 1GB?',
    unreadCount: 0,
    sentiment: 'neutral',
    tags: ['vendas', 'upgrade'],
    startedAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'conv-003',
    customerId: 'cust-003',
    customerName: 'Ana Costa',
    channel: 'email',
    status: 'open',
    priority: 'low',
    assignedAIAgentId: 'ai-002',
    subject: 'Solicitação de 2ª via de boleto',
    lastMessage: 'Preciso da 2ª via do boleto de abril',
    unreadCount: 1,
    sentiment: 'positive',
    tags: ['financeiro', 'boleto'],
    startedAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 43200000),
  },
  {
    id: 'conv-004',
    customerId: 'cust-004',
    customerName: 'Carlos Santos',
    channel: 'whatsapp',
    status: 'escalated',
    priority: 'urgent',
    assignedAgentId: 'user-002',
    subject: 'Cancelamento de contrato',
    lastMessage: 'Quero cancelar imediatamente',
    unreadCount: 4,
    sentiment: 'negative',
    tags: ['cancelamento', 'urgente', 'retenção'],
    startedAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 120000),
  },
  {
    id: 'conv-005',
    customerId: 'cust-005',
    customerName: 'Fernanda Lima',
    channel: 'chat',
    status: 'open',
    priority: 'medium',
    assignedAIAgentId: 'ai-001',
    subject: 'Instalação nova',
    lastMessage: 'Quando podem fazer a instalação?',
    unreadCount: 0,
    sentiment: 'positive',
    tags: ['instalação', 'novo cliente'],
    startedAt: new Date(Date.now() - 5400000),
    updatedAt: new Date(Date.now() - 2700000),
  },
]

// Mock messages for conversation conv-001
export const mockMessagesConv001: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    type: 'customer',
    content: 'Boa tarde, minha internet está muito instável há 3 dias. Já reiniciei o modem várias vezes mas continua caindo.',
    timestamp: new Date(Date.now() - 3600000),
    senderName: 'Maria Silva',
    senderId: 'cust-001',
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    type: 'ai',
    content: 'Olá Maria! Entendo sua frustração com a instabilidade. Vou verificar o status da sua conexão agora. Pode me informar se as luzes do modem estão todas acesas normalmente?',
    timestamp: new Date(Date.now() - 3540000),
    senderName: 'Atlas',
    senderId: 'ai-001',
    metadata: {
      aiConfidence: 'high',
      aiModel: 'gpt-4-turbo',
      automationSource: 'Agente Autônomo',
    },
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    type: 'customer',
    content: 'A luz de internet fica piscando em vermelho às vezes',
    timestamp: new Date(Date.now() - 3300000),
    senderName: 'Maria Silva',
    senderId: 'cust-001',
  },
  {
    id: 'msg-004',
    conversationId: 'conv-001',
    type: 'ai',
    content: 'Obrigado pela informação. A luz vermelha indica perda de sinal. Identifiquei que há uma manutenção programada na sua região que pode estar causando instabilidade. Vou transferir para um especialista técnico para análise mais detalhada.',
    timestamp: new Date(Date.now() - 3240000),
    senderName: 'Atlas',
    senderId: 'ai-001',
    metadata: {
      aiConfidence: 'medium',
      aiModel: 'gpt-4-turbo',
      automationSource: 'Agente Autônomo',
    },
  },
  {
    id: 'msg-005',
    conversationId: 'conv-001',
    type: 'system',
    content: 'Handoff: Transferido para Joana (Suporte Técnico) via Automação de Escalonamento',
    timestamp: new Date(Date.now() - 3180000),
    metadata: {
      handoffReason: 'Escalonamento técnico',
      handoffFrom: 'Atlas (IA)',
      handoffTo: 'Joana',
    },
  },
  {
    id: 'msg-006',
    conversationId: 'conv-001',
    type: 'agent',
    content: 'Olá Maria, sou a Joana do suporte técnico. Estou analisando sua conexão e vejo que realmente há instabilidade no seu link. Vou agendar uma visita técnica para amanhã entre 14h e 18h, pode ser?',
    timestamp: new Date(Date.now() - 1800000),
    senderName: 'Joana',
    senderId: 'user-001',
  },
  {
    id: 'msg-007',
    conversationId: 'conv-001',
    type: 'customer',
    content: 'Já reiniciei o modem várias vezes e continua caindo',
    timestamp: new Date(Date.now() - 300000),
    senderName: 'Maria Silva',
    senderId: 'cust-001',
  },
]

// Mock customer profiles
export const mockCustomerProfiles: Record<string, CustomerProfile> = {
  'cust-001': {
    id: 'cust-001',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '+55 11 99999-1234',
    cpfCnpj: '123.456.789-00',
    subscription: {
      planName: 'Fibra 500MB',
      status: 'active',
      monthlyValue: 149.90,
      nextBillingDate: new Date(Date.now() + 86400000 * 15),
    },
    sentiment: 'irritated',
    tags: ['Suporte Técnico', 'Queda de Rede', 'Cliente Premium'],
  },
  'cust-002': {
    id: 'cust-002',
    name: 'João Pereira',
    email: 'joao.pereira@email.com',
    phone: '+55 21 98888-5678',
    cpfCnpj: '987.654.321-00',
    subscription: {
      planName: 'Fibra 200MB',
      status: 'active',
      monthlyValue: 99.90,
      nextBillingDate: new Date(Date.now() + 86400000 * 8),
    },
    sentiment: 'neutral',
    tags: ['Interesse em Upgrade'],
  },
  'cust-003': {
    id: 'cust-003',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '+55 31 97777-9012',
    cpfCnpj: '456.789.123-00',
    subscription: {
      planName: 'Fibra 100MB',
      status: 'active',
      monthlyValue: 79.90,
      nextBillingDate: new Date(Date.now() + 86400000 * 3),
    },
    sentiment: 'positive',
    tags: ['Financeiro'],
  },
  'cust-004': {
    id: 'cust-004',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    phone: '+55 41 96666-3456',
    cpfCnpj: '789.123.456-00',
    subscription: {
      planName: 'Fibra 300MB',
      status: 'active',
      monthlyValue: 129.90,
      nextBillingDate: new Date(Date.now() + 86400000 * 20),
    },
    sentiment: 'irritated',
    tags: ['Risco de Churn', 'Retenção Urgente'],
  },
  'cust-005': {
    id: 'cust-005',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '+55 51 95555-7890',
    cpfCnpj: '321.654.987-00',
    subscription: {
      planName: 'Fibra 500MB',
      status: 'pending',
      monthlyValue: 149.90,
    },
    sentiment: 'positive',
    tags: ['Novo Cliente', 'Instalação Pendente'],
  },
}

// Mock SLA data
export const mockSLAData: Record<string, SLAInfo> = {
  'conv-001': {
    deadline: new Date(Date.now() + 720000), // 12 minutes
    remainingMinutes: 12,
    status: 'warning',
  },
  'conv-002': {
    deadline: new Date(Date.now() + 3600000), // 60 minutes
    remainingMinutes: 60,
    status: 'on-track',
  },
  'conv-003': {
    deadline: new Date(Date.now() + 7200000), // 120 minutes
    remainingMinutes: 120,
    status: 'on-track',
  },
  'conv-004': {
    deadline: new Date(Date.now() - 300000), // -5 minutes (breached)
    remainingMinutes: -5,
    status: 'breached',
  },
  'conv-005': {
    deadline: new Date(Date.now() + 2700000), // 45 minutes
    remainingMinutes: 45,
    status: 'on-track',
  },
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API Services
export async function getAtendimentoConversations(): Promise<Conversation[]> {
  await delay(800)
  return mockAtendimentoConversations
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  await delay(600)
  if (conversationId === 'conv-001') {
    return mockMessagesConv001
  }
  // Return empty messages for other conversations (placeholder)
  return []
}

export async function getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
  await delay(400)
  return mockCustomerProfiles[customerId] || null
}

export async function getSLAInfo(conversationId: string): Promise<SLAInfo | null> {
  await delay(200)
  return mockSLAData[conversationId] || null
}

export async function sendMessage(
  conversationId: string, 
  content: string, 
  isInternal: boolean,
  correlationId?: string
): Promise<Message> {
  await delay(300)
  return {
    id: `msg-${Date.now()}`,
    conversationId,
    type: 'agent',
    content,
    timestamp: new Date(),
    senderName: 'Joana',
    senderId: 'user-001',
    isInternal,
    metadata: {
      deliveryStatus: 'sent',
      delivery_status: 'sent',
      correlationId,
      correlation_id: correlationId,
    },
  }
}
