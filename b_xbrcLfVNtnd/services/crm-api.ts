// CRM Mock API Services
import type { 
  CrmCustomer, 
  CustomerFiltersState, 
  PaginationState,
  BillingStatus,
  ChannelType,
  OmnichannelIdentity,
  SubscriptionDetails,
  PaymentState,
  CustomerMetrics,
  TicketHistoryPreview
} from '@/types/crm'

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to generate random data
const randomDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// Mock Plans
export const mockPlans = [
  { id: 'fibra-100', name: 'Fibra 100MB', speed: '100MB', price: 79.90 },
  { id: 'fibra-300', name: 'Fibra 300MB', speed: '300MB', price: 99.90 },
  { id: 'fibra-500', name: 'Fibra 500MB', speed: '500MB', price: 129.90 },
  { id: 'fibra-1gb', name: 'Fibra 1GB', speed: '1GB', price: 179.90 },
  { id: 'empresarial', name: 'Empresarial', speed: '2GB', price: 499.90 },
]

// Generate mock customers
const generateMockCustomers = (): CrmCustomer[] => {
  const customers: CrmCustomer[] = [
    {
      id: 'cust-001',
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '(11) 99999-1234',
      cpfCnpj: '123.456.789-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'em-dia',
      subscription: {
        id: 'sub-001',
        planId: 'fibra-500',
        planName: 'Fibra 500MB',
        speed: '500MB',
        monthlyPrice: 129.90,
        billingCycleDay: 10,
        status: 'active',
        contractStart: new Date('2023-01-15'),
        nextBillingDate: new Date('2024-02-10'),
        lastPaymentDate: new Date('2024-01-10'),
        lastPaymentAmount: 129.90,
      },
      payment: {
        currentBalance: 0,
        lastPaymentDate: new Date('2024-01-10'),
        lastPaymentAmount: 129.90,
        overdueAmount: 0,
        overdueDays: 0,
        paymentMethod: 'pix',
      },
      omnichannelIdentities: [
        { channel: 'whatsapp', identifier: '+55 11 99999-1234', isVerified: true, linkedAt: new Date('2023-01-15'), lastUsedAt: new Date() },
        { channel: 'email', identifier: 'maria.silva@email.com', isVerified: true, linkedAt: new Date('2023-01-15'), lastUsedAt: randomDate(7) },
      ],
      metrics: {
        ltv: 1558.80,
        totalTickets: 3,
        openTickets: 0,
        avgResponseTime: 12,
        avgSlaCompliance: 95,
        lastContactAt: randomDate(5),
        createdAt: new Date('2023-01-15'),
        sentiment: 'positive',
        sentimentHistory: [
          { date: randomDate(30), sentiment: 'positive' },
          { date: randomDate(60), sentiment: 'neutral' },
        ],
      },
      tags: ['cliente-fiel', 'nps-promotor'],
      notes: 'Cliente desde 2023, sempre em dia.',
      recentTickets: [
        { id: 'tkt-101', subject: 'Dúvida sobre fatura', status: 'resolved', createdAt: randomDate(30), resolvedAt: randomDate(29), channel: 'whatsapp' },
      ],
    },
    {
      id: 'cust-002',
      name: 'João Pedro Oliveira',
      email: 'joao.oliveira@empresa.com.br',
      phone: '(21) 98888-5678',
      cpfCnpj: '987.654.321-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'atrasado',
      subscription: {
        id: 'sub-002',
        planId: 'fibra-300',
        planName: 'Fibra 300MB',
        speed: '300MB',
        monthlyPrice: 99.90,
        billingCycleDay: 5,
        status: 'active',
        contractStart: new Date('2022-06-10'),
        nextBillingDate: new Date('2024-02-05'),
        lastPaymentDate: new Date('2023-12-05'),
        lastPaymentAmount: 99.90,
      },
      payment: {
        currentBalance: 199.80,
        lastPaymentDate: new Date('2023-12-05'),
        lastPaymentAmount: 99.90,
        overdueAmount: 199.80,
        overdueDays: 35,
        paymentMethod: 'boleto',
      },
      omnichannelIdentities: [
        { channel: 'whatsapp', identifier: '+55 21 98888-5678', isVerified: true, linkedAt: new Date('2022-06-10'), lastUsedAt: randomDate(2) },
        { channel: 'email', identifier: 'joao.oliveira@empresa.com.br', isVerified: true, linkedAt: new Date('2022-06-10') },
        { channel: 'instagram', identifier: '@joaopedro.oli', isVerified: false, linkedAt: randomDate(90) },
      ],
      metrics: {
        ltv: 1998.00,
        totalTickets: 8,
        openTickets: 1,
        avgResponseTime: 45,
        avgSlaCompliance: 72,
        lastContactAt: randomDate(2),
        createdAt: new Date('2022-06-10'),
        sentiment: 'negative',
        sentimentHistory: [
          { date: randomDate(7), sentiment: 'negative' },
          { date: randomDate(30), sentiment: 'neutral' },
          { date: randomDate(60), sentiment: 'positive' },
        ],
      },
      tags: ['inadimplente', 'risco-churn'],
      notes: 'Atrasado há 35 dias. Entrar em contato.',
      recentTickets: [
        { id: 'tkt-201', subject: 'Problema de conexão', status: 'open', createdAt: randomDate(2), channel: 'whatsapp' },
        { id: 'tkt-202', subject: 'Pedido de desconto', status: 'resolved', createdAt: randomDate(15), resolvedAt: randomDate(14), channel: 'email' },
      ],
    },
    {
      id: 'cust-003',
      name: 'Tech Solutions LTDA',
      email: 'contato@techsolutions.com.br',
      phone: '(11) 3333-4444',
      cpfCnpj: '12.345.678/0001-90',
      avatarUrl: undefined,
      type: 'pj',
      billingStatus: 'em-dia',
      subscription: {
        id: 'sub-003',
        planId: 'empresarial',
        planName: 'Empresarial',
        speed: '2GB',
        monthlyPrice: 499.90,
        billingCycleDay: 15,
        status: 'active',
        contractStart: new Date('2021-03-01'),
        contractEnd: new Date('2025-03-01'),
        nextBillingDate: new Date('2024-02-15'),
        lastPaymentDate: new Date('2024-01-15'),
        lastPaymentAmount: 499.90,
      },
      payment: {
        currentBalance: 0,
        lastPaymentDate: new Date('2024-01-15'),
        lastPaymentAmount: 499.90,
        overdueAmount: 0,
        overdueDays: 0,
        paymentMethod: 'debito-automatico',
      },
      omnichannelIdentities: [
        { channel: 'email', identifier: 'contato@techsolutions.com.br', isVerified: true, linkedAt: new Date('2021-03-01'), lastUsedAt: randomDate(10) },
        { channel: 'whatsapp', identifier: '+55 11 3333-4444', isVerified: true, linkedAt: new Date('2021-03-01'), lastUsedAt: randomDate(30) },
        { channel: 'web', identifier: 'portal-cliente', isVerified: true, linkedAt: new Date('2021-03-01'), lastUsedAt: randomDate(5) },
      ],
      metrics: {
        ltv: 17496.50,
        totalTickets: 12,
        openTickets: 0,
        avgResponseTime: 8,
        avgSlaCompliance: 98,
        lastContactAt: randomDate(10),
        createdAt: new Date('2021-03-01'),
        sentiment: 'positive',
        sentimentHistory: [
          { date: randomDate(30), sentiment: 'positive' },
          { date: randomDate(90), sentiment: 'positive' },
        ],
      },
      tags: ['enterprise', 'conta-chave', 'sla-premium'],
      notes: 'Cliente corporativo de alto valor. Atendimento prioritário.',
      recentTickets: [
        { id: 'tkt-301', subject: 'Solicitação de IP fixo', status: 'resolved', createdAt: randomDate(10), resolvedAt: randomDate(9), channel: 'email' },
      ],
    },
    {
      id: 'cust-004',
      name: 'Ana Carolina Ferreira',
      email: 'ana.ferreira@gmail.com',
      phone: '(31) 97777-8888',
      cpfCnpj: '456.789.123-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'suspenso',
      subscription: {
        id: 'sub-004',
        planId: 'fibra-100',
        planName: 'Fibra 100MB',
        speed: '100MB',
        monthlyPrice: 79.90,
        billingCycleDay: 20,
        status: 'suspended',
        contractStart: new Date('2023-08-01'),
        nextBillingDate: new Date('2024-02-20'),
        lastPaymentDate: new Date('2023-10-20'),
        lastPaymentAmount: 79.90,
      },
      payment: {
        currentBalance: 319.60,
        lastPaymentDate: new Date('2023-10-20'),
        lastPaymentAmount: 79.90,
        overdueAmount: 319.60,
        overdueDays: 90,
        paymentMethod: 'boleto',
      },
      omnichannelIdentities: [
        { channel: 'whatsapp', identifier: '+55 31 97777-8888', isVerified: true, linkedAt: new Date('2023-08-01'), lastUsedAt: randomDate(60) },
        { channel: 'email', identifier: 'ana.ferreira@gmail.com', isVerified: true, linkedAt: new Date('2023-08-01') },
      ],
      metrics: {
        ltv: 239.70,
        totalTickets: 5,
        openTickets: 0,
        avgResponseTime: 120,
        avgSlaCompliance: 40,
        lastContactAt: randomDate(60),
        createdAt: new Date('2023-08-01'),
        sentiment: 'negative',
        sentimentHistory: [
          { date: randomDate(60), sentiment: 'negative' },
          { date: randomDate(90), sentiment: 'neutral' },
        ],
      },
      tags: ['suspenso', 'cobranca-ativa'],
      notes: 'Serviço suspenso por inadimplência. Aguardando regularização.',
      recentTickets: [
        { id: 'tkt-401', subject: 'Contestação de cobrança', status: 'resolved', createdAt: randomDate(60), resolvedAt: randomDate(58), channel: 'whatsapp' },
      ],
    },
    {
      id: 'cust-005',
      name: 'Roberto Carlos Lima',
      email: 'roberto.lima@outlook.com',
      phone: '(41) 96666-7777',
      cpfCnpj: '789.123.456-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'cancelado',
      subscription: {
        id: 'sub-005',
        planId: 'fibra-300',
        planName: 'Fibra 300MB',
        speed: '300MB',
        monthlyPrice: 99.90,
        billingCycleDay: 25,
        status: 'cancelled',
        contractStart: new Date('2022-01-10'),
        contractEnd: new Date('2023-11-25'),
        nextBillingDate: new Date('2023-11-25'),
        lastPaymentDate: new Date('2023-10-25'),
        lastPaymentAmount: 99.90,
      },
      payment: {
        currentBalance: 0,
        lastPaymentDate: new Date('2023-10-25'),
        lastPaymentAmount: 99.90,
        overdueAmount: 0,
        overdueDays: 0,
        paymentMethod: 'cartao',
      },
      omnichannelIdentities: [
        { channel: 'email', identifier: 'roberto.lima@outlook.com', isVerified: true, linkedAt: new Date('2022-01-10') },
        { channel: 'whatsapp', identifier: '+55 41 96666-7777', isVerified: true, linkedAt: new Date('2022-01-10') },
      ],
      metrics: {
        ltv: 2197.80,
        totalTickets: 15,
        openTickets: 0,
        avgResponseTime: 30,
        avgSlaCompliance: 85,
        lastContactAt: new Date('2023-11-20'),
        createdAt: new Date('2022-01-10'),
        sentiment: 'neutral',
        sentimentHistory: [
          { date: new Date('2023-11-20'), sentiment: 'neutral' },
          { date: randomDate(90), sentiment: 'negative' },
        ],
      },
      tags: ['cancelado', 'ex-cliente'],
      notes: 'Cancelou por mudança de cidade. Possível win-back.',
      recentTickets: [
        { id: 'tkt-501', subject: 'Solicitação de cancelamento', status: 'resolved', createdAt: new Date('2023-11-15'), resolvedAt: new Date('2023-11-20'), channel: 'email' },
      ],
    },
    {
      id: 'cust-006',
      name: 'Fernanda Souza Mendes',
      email: 'fernanda.mendes@yahoo.com',
      phone: '(19) 95555-6666',
      cpfCnpj: '321.654.987-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'em-dia',
      subscription: {
        id: 'sub-006',
        planId: 'fibra-1gb',
        planName: 'Fibra 1GB',
        speed: '1GB',
        monthlyPrice: 179.90,
        billingCycleDay: 1,
        status: 'active',
        contractStart: new Date('2023-06-01'),
        nextBillingDate: new Date('2024-02-01'),
        lastPaymentDate: new Date('2024-01-01'),
        lastPaymentAmount: 179.90,
      },
      payment: {
        currentBalance: 0,
        lastPaymentDate: new Date('2024-01-01'),
        lastPaymentAmount: 179.90,
        overdueAmount: 0,
        overdueDays: 0,
        paymentMethod: 'pix',
      },
      omnichannelIdentities: [
        { channel: 'whatsapp', identifier: '+55 19 95555-6666', isVerified: true, linkedAt: new Date('2023-06-01'), lastUsedAt: randomDate(3) },
        { channel: 'email', identifier: 'fernanda.mendes@yahoo.com', isVerified: true, linkedAt: new Date('2023-06-01') },
        { channel: 'telegram', identifier: '@fer_mendes', isVerified: true, linkedAt: randomDate(60), lastUsedAt: randomDate(14) },
      ],
      metrics: {
        ltv: 1439.20,
        totalTickets: 2,
        openTickets: 0,
        avgResponseTime: 5,
        avgSlaCompliance: 100,
        lastContactAt: randomDate(3),
        createdAt: new Date('2023-06-01'),
        sentiment: 'positive',
        sentimentHistory: [
          { date: randomDate(30), sentiment: 'positive' },
        ],
      },
      tags: ['nps-promotor', 'indicou-amigos'],
      notes: 'Excelente cliente. Já indicou 2 novos assinantes.',
      recentTickets: [
        { id: 'tkt-601', subject: 'Upgrade de plano', status: 'resolved', createdAt: randomDate(60), resolvedAt: randomDate(59), channel: 'whatsapp' },
      ],
    },
    {
      id: 'cust-007',
      name: 'Comércio Estrela EIRELI',
      email: 'financeiro@comercioestrela.com.br',
      phone: '(85) 3222-1111',
      cpfCnpj: '98.765.432/0001-10',
      avatarUrl: undefined,
      type: 'pj',
      billingStatus: 'atrasado',
      subscription: {
        id: 'sub-007',
        planId: 'fibra-500',
        planName: 'Fibra 500MB',
        speed: '500MB',
        monthlyPrice: 129.90,
        billingCycleDay: 10,
        status: 'active',
        contractStart: new Date('2022-09-01'),
        nextBillingDate: new Date('2024-02-10'),
        lastPaymentDate: new Date('2023-12-10'),
        lastPaymentAmount: 129.90,
      },
      payment: {
        currentBalance: 129.90,
        lastPaymentDate: new Date('2023-12-10'),
        lastPaymentAmount: 129.90,
        overdueAmount: 129.90,
        overdueDays: 25,
        paymentMethod: 'boleto',
      },
      omnichannelIdentities: [
        { channel: 'email', identifier: 'financeiro@comercioestrela.com.br', isVerified: true, linkedAt: new Date('2022-09-01'), lastUsedAt: randomDate(5) },
        { channel: 'whatsapp', identifier: '+55 85 3222-1111', isVerified: true, linkedAt: new Date('2022-09-01'), lastUsedAt: randomDate(10) },
      ],
      metrics: {
        ltv: 2078.40,
        totalTickets: 6,
        openTickets: 1,
        avgResponseTime: 20,
        avgSlaCompliance: 88,
        lastContactAt: randomDate(5),
        createdAt: new Date('2022-09-01'),
        sentiment: 'neutral',
        sentimentHistory: [
          { date: randomDate(5), sentiment: 'neutral' },
          { date: randomDate(30), sentiment: 'positive' },
        ],
      },
      tags: ['pj', 'inadimplente-leve'],
      notes: 'Atraso pontual. Histórico de bom pagador.',
      recentTickets: [
        { id: 'tkt-701', subject: 'Segunda via de boleto', status: 'open', createdAt: randomDate(5), channel: 'email' },
      ],
    },
    {
      id: 'cust-008',
      name: 'Lucas Martins Costa',
      email: 'lucas.costa@proton.me',
      phone: '(62) 94444-3333',
      cpfCnpj: '654.987.321-00',
      avatarUrl: undefined,
      type: 'pf',
      billingStatus: 'em-dia',
      subscription: {
        id: 'sub-008',
        planId: 'fibra-300',
        planName: 'Fibra 300MB',
        speed: '300MB',
        monthlyPrice: 99.90,
        billingCycleDay: 15,
        status: 'active',
        contractStart: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-02-15'),
        lastPaymentDate: new Date('2024-01-15'),
        lastPaymentAmount: 99.90,
      },
      payment: {
        currentBalance: 0,
        lastPaymentDate: new Date('2024-01-15'),
        lastPaymentAmount: 99.90,
        overdueAmount: 0,
        overdueDays: 0,
        paymentMethod: 'cartao',
      },
      omnichannelIdentities: [
        { channel: 'whatsapp', identifier: '+55 62 94444-3333', isVerified: true, linkedAt: new Date('2024-01-01'), lastUsedAt: randomDate(1) },
        { channel: 'email', identifier: 'lucas.costa@proton.me', isVerified: true, linkedAt: new Date('2024-01-01') },
        { channel: 'web', identifier: 'portal-cliente', isVerified: true, linkedAt: new Date('2024-01-01'), lastUsedAt: randomDate(3) },
      ],
      metrics: {
        ltv: 99.90,
        totalTickets: 1,
        openTickets: 0,
        avgResponseTime: 3,
        avgSlaCompliance: 100,
        lastContactAt: randomDate(1),
        createdAt: new Date('2024-01-01'),
        sentiment: 'positive',
        sentimentHistory: [
          { date: randomDate(7), sentiment: 'positive' },
        ],
      },
      tags: ['novo-cliente', 'onboarding'],
      notes: 'Cliente recém-cadastrado. Acompanhar experiência inicial.',
      recentTickets: [
        { id: 'tkt-801', subject: 'Configuração inicial', status: 'resolved', createdAt: randomDate(7), resolvedAt: randomDate(6), channel: 'whatsapp' },
      ],
    },
  ]

  return customers
}

// Mock data store
let mockCustomers: CrmCustomer[] = generateMockCustomers()

// API Functions
export async function fetchCustomers(
  filters: CustomerFiltersState,
  pagination: { page: number; pageSize: number }
): Promise<{ customers: CrmCustomer[]; total: number }> {
  await delay(400 + Math.random() * 200)

  let filtered = [...mockCustomers]

  // Apply search filter
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.cpfCnpj.includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.omnichannelIdentities.some((id) =>
          id.identifier.toLowerCase().includes(search)
        )
    )
  }

  // Apply status filter
  if (filters.status !== 'all') {
    const statusMap: Record<string, BillingStatus> = {
      ativo: 'em-dia',
      inadimplente: 'atrasado',
      suspenso: 'suspenso',
      cancelado: 'cancelado',
    }
    filtered = filtered.filter((c) => c.billingStatus === statusMap[filters.status])
  }

  // Apply plan filter
  if (filters.planId) {
    filtered = filtered.filter((c) => c.subscription.planId === filters.planId)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'createdAt':
        comparison = a.metrics.createdAt.getTime() - b.metrics.createdAt.getTime()
        break
      case 'ltv':
        comparison = a.metrics.ltv - b.metrics.ltv
        break
      case 'lastContact':
        const aContact = a.metrics.lastContactAt?.getTime() || 0
        const bContact = b.metrics.lastContactAt?.getTime() || 0
        comparison = aContact - bContact
        break
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison
  })

  const total = filtered.length
  const start = (pagination.page - 1) * pagination.pageSize
  const paginatedCustomers = filtered.slice(start, start + pagination.pageSize)

  return { customers: paginatedCustomers, total }
}

export async function fetchCustomerById(id: string): Promise<CrmCustomer | null> {
  await delay(200 + Math.random() * 100)
  return mockCustomers.find((c) => c.id === id) || null
}

export async function updateCustomer(
  id: string,
  updates: Partial<CrmCustomer>
): Promise<CrmCustomer> {
  await delay(300 + Math.random() * 200)
  const index = mockCustomers.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Customer not found')
  
  mockCustomers[index] = { ...mockCustomers[index], ...updates }
  return mockCustomers[index]
}

export async function suspendCustomer(id: string): Promise<CrmCustomer> {
  await delay(500 + Math.random() * 200)
  const customer = mockCustomers.find((c) => c.id === id)
  if (!customer) throw new Error('Customer not found')
  
  customer.billingStatus = 'suspenso'
  customer.subscription.status = 'suspended'
  return customer
}

export async function activateCustomer(id: string): Promise<CrmCustomer> {
  await delay(500 + Math.random() * 200)
  const customer = mockCustomers.find((c) => c.id === id)
  if (!customer) throw new Error('Customer not found')
  
  customer.billingStatus = 'em-dia'
  customer.subscription.status = 'active'
  return customer
}

export async function bulkOperation(
  ids: string[],
  action: 'suspend' | 'activate' | 'export'
): Promise<{ success: boolean; processed: number }> {
  await delay(800 + Math.random() * 400)
  
  if (action === 'export') {
    return { success: true, processed: ids.length }
  }

  let processed = 0
  for (const id of ids) {
    const customer = mockCustomers.find((c) => c.id === id)
    if (customer) {
      if (action === 'suspend') {
        customer.billingStatus = 'suspenso'
        customer.subscription.status = 'suspended'
      } else if (action === 'activate') {
        customer.billingStatus = 'em-dia'
        customer.subscription.status = 'active'
      }
      processed++
    }
  }

  return { success: true, processed }
}

export { mockPlans }
