// AI Studio mock API services with simulated operational latency
// Prepared for Django REST + WebSocket + Celery backend integration

import type {
  OperationalAgent,
  RagDocument,
  ToolAssignment,
  InferenceTrace,
  TelemetrySnapshot,
  InferenceMetrics,
  AVAILABLE_MODELS,
} from '@/types/ai-studio'

// Simulated network delay (realistic operational latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const simulateLatency = () => delay(Math.random() * 400 + 200)
const simulateInferenceLatency = () => delay(Math.random() * 800 + 400)
const simulatePipelineLatency = () => delay(Math.random() * 1500 + 500)

// ============================================
// Mock Data: Operational Agents
// ============================================
const mockOperationalAgents: OperationalAgent[] = [
  {
    id: 'agent-001',
    name: 'Agente Financeiro',
    description: 'Gestão de consultas financeiras, faturas e pagamentos',
    lifecycleState: 'active',
    healthStatus: 'healthy',
    model: {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      costPer1kTokens: 0.005,
      supportsTools: true,
      supportsVision: true,
    },
    systemPrompt: `Você é o Agente Financeiro do ISP ArNet.

Sua responsabilidade:
- Consultar status de faturas e pagamentos
- Emitir 2ª via de boletos
- Negociar dívidas dentro dos parâmetros autorizados
- Explicar cobranças e valores

Regras:
- Sempre confirme a identidade do cliente
- Nunca revele dados sensíveis sem confirmação
- Limite de desconto: até 10% para regularização
- Escalone casos complexos para humano`,
    temperature: 0.3,
    maxTokens: 2048,
    toolAssignments: ['tool-001', 'tool-004'],
    guardrails: {
      contentFiltering: true,
      piiDetection: true,
      maxResponseLength: 500,
      requireConfirmation: false,
      blockedTopics: ['cancelamento', 'jurídico'],
    },
    lastExecutionAt: new Date(Date.now() - 45000),
    activeInferences: 3,
    totalInferences: 12847,
    avgLatencyMs: 234,
    confidenceScore: 94,
    errorRate: 0.8,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'agent-002',
    name: 'Triagem N1',
    description: 'Classificação de intent e direcionamento inicial',
    lifecycleState: 'active',
    healthStatus: 'healthy',
    model: {
      id: 'llama3-70b',
      name: 'Llama 3 70B',
      provider: 'local',
      contextWindow: 8192,
      costPer1kTokens: 0,
      supportsTools: true,
      supportsVision: false,
    },
    systemPrompt: `Você é o Agente de Triagem N1 do ISP ArNet.

Sua responsabilidade:
- Classificar a intenção do cliente
- Coletar informações iniciais
- Direcionar para o agente especializado correto

Categorias disponíveis:
- FINANCEIRO: faturas, boletos, pagamentos
- TECNICO: quedas, lentidão, configuração
- COMERCIAL: upgrade, planos, novos serviços
- CANCELAMENTO: churn, retenção

Sempre responda de forma breve e direcione rapidamente.`,
    temperature: 0.1,
    maxTokens: 256,
    toolAssignments: [],
    guardrails: {
      contentFiltering: true,
      piiDetection: false,
      maxResponseLength: 200,
      requireConfirmation: false,
      blockedTopics: [],
    },
    lastExecutionAt: new Date(Date.now() - 12000),
    activeInferences: 8,
    totalInferences: 45234,
    avgLatencyMs: 89,
    confidenceScore: 97,
    errorRate: 0.3,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'agent-003',
    name: 'SLA Guardian',
    description: 'Monitoramento de SLA e escalonamento automático',
    lifecycleState: 'processing',
    healthStatus: 'healthy',
    model: {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      costPer1kTokens: 0.01,
      supportsTools: true,
      supportsVision: true,
    },
    systemPrompt: `Você é o SLA Guardian do ISP ArNet.

Sua responsabilidade:
- Monitorar tempos de resposta em tempo real
- Identificar tickets em risco de SLA breach
- Escalonar automaticamente quando necessário
- Notificar supervisores de casos críticos

Thresholds:
- Warning: 80% do tempo SLA consumido
- Critical: 90% do tempo SLA consumido
- Breach: 100% - escalonamento imediato

Priorize sempre clientes enterprise e casos urgentes.`,
    temperature: 0.2,
    maxTokens: 512,
    toolAssignments: ['tool-003'],
    guardrails: {
      contentFiltering: false,
      piiDetection: false,
      maxResponseLength: 300,
      requireConfirmation: true,
      blockedTopics: [],
    },
    lastExecutionAt: new Date(Date.now() - 5000),
    activeInferences: 1,
    totalInferences: 8923,
    avgLatencyMs: 156,
    confidenceScore: 99,
    errorRate: 0.1,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: 'agent-004',
    name: 'Analista de Sentimento',
    description: 'Análise de sentimento em tempo real das conversas',
    lifecycleState: 'idle',
    healthStatus: 'healthy',
    model: {
      id: 'bertimbau',
      name: 'BERTimbau',
      provider: 'local',
      contextWindow: 512,
      costPer1kTokens: 0,
      supportsTools: false,
      supportsVision: false,
    },
    systemPrompt: `Classificador de sentimento otimizado para português brasileiro.
Categorias: POSITIVE, NEUTRAL, NEGATIVE, IRRITATED
Retorne apenas a categoria e score de confiança.`,
    temperature: 0,
    maxTokens: 32,
    toolAssignments: [],
    guardrails: {
      contentFiltering: false,
      piiDetection: false,
      maxResponseLength: 50,
      requireConfirmation: false,
      blockedTopics: [],
    },
    lastExecutionAt: new Date(Date.now() - 180000),
    activeInferences: 0,
    totalInferences: 67432,
    avgLatencyMs: 23,
    confidenceScore: 91,
    errorRate: 1.2,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'agent-005',
    name: 'Suporte Técnico N2',
    description: 'Diagnóstico técnico avançado e resolução de problemas',
    lifecycleState: 'degraded',
    healthStatus: 'warning',
    model: {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      costPer1kTokens: 0.005,
      supportsTools: true,
      supportsVision: true,
    },
    systemPrompt: `Você é o Agente de Suporte Técnico N2 do ISP ArNet.

Sua responsabilidade:
- Diagnosticar problemas de conectividade
- Verificar status de ONUs e equipamentos
- Executar comandos de reinicialização remota
- Agendar visitas técnicas quando necessário

Ferramentas disponíveis:
- Reiniciar ONU remotamente
- Verificar status de porta
- Consultar histórico de quedas
- Agendar visita técnica

Sempre documente as ações tomadas.`,
    temperature: 0.4,
    maxTokens: 1024,
    toolAssignments: ['tool-002', 'tool-003'],
    guardrails: {
      contentFiltering: true,
      piiDetection: true,
      maxResponseLength: 400,
      requireConfirmation: true,
      blockedTopics: [],
    },
    lastExecutionAt: new Date(Date.now() - 300000),
    activeInferences: 0,
    totalInferences: 5678,
    avgLatencyMs: 892,
    confidenceScore: 78,
    errorRate: 4.5,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(Date.now() - 600000),
  },
  {
    id: 'agent-006',
    name: 'Retenção & Churn',
    description: 'Estratégias de retenção e prevenção de cancelamento',
    lifecycleState: 'offline',
    healthStatus: 'critical',
    model: {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      costPer1kTokens: 0.015,
      supportsTools: true,
      supportsVision: true,
    },
    systemPrompt: `Você é o Agente de Retenção do ISP ArNet.

Sua responsabilidade:
- Identificar sinais de churn
- Oferecer benefícios de retenção
- Negociar condições especiais
- Documentar motivos de cancelamento

Ofertas autorizadas:
- Desconto de até 20% por 3 meses
- Upgrade de velocidade gratuito por 6 meses
- Isenção de taxa de visita técnica

Escalone para supervisor casos com mais de R$500/mês.`,
    temperature: 0.6,
    maxTokens: 2048,
    toolAssignments: ['tool-001', 'tool-004'],
    guardrails: {
      contentFiltering: true,
      piiDetection: true,
      maxResponseLength: 600,
      requireConfirmation: true,
      blockedTopics: [],
    },
    lastExecutionAt: null,
    activeInferences: 0,
    totalInferences: 2341,
    avgLatencyMs: 0,
    confidenceScore: 0,
    errorRate: 100,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(Date.now() - 86400000),
  },
]

// ============================================
// Mock Data: RAG Documents
// ============================================
const mockRagDocuments: RagDocument[] = [
  {
    id: 'doc-001',
    filename: 'manual_tecnico_onu_v3.pdf',
    fileType: 'pdf',
    fileSizeBytes: 4521984,
    uploadedAt: new Date('2024-03-15'),
    status: 'ready',
    chunkCount: 156,
    embeddingProgress: 100,
    vectorHealth: 'optimal',
    metadata: {
      title: 'Manual Técnico ONU - Versão 3.0',
      author: 'Equipe Técnica ArNet',
      pageCount: 89,
      wordCount: 24560,
      language: 'pt-BR',
    },
  },
  {
    id: 'doc-002',
    filename: 'politica_cobranca_2024.pdf',
    fileType: 'pdf',
    fileSizeBytes: 1245678,
    uploadedAt: new Date('2024-03-20'),
    status: 'ready',
    chunkCount: 42,
    embeddingProgress: 100,
    vectorHealth: 'optimal',
    metadata: {
      title: 'Política de Cobrança 2024',
      author: 'Departamento Financeiro',
      pageCount: 28,
      wordCount: 8934,
      language: 'pt-BR',
    },
  },
  {
    id: 'doc-003',
    filename: 'script_atendimento_n1.md',
    fileType: 'md',
    fileSizeBytes: 45678,
    uploadedAt: new Date('2024-04-01'),
    status: 'ready',
    chunkCount: 18,
    embeddingProgress: 100,
    vectorHealth: 'degraded',
    metadata: {
      title: 'Script de Atendimento N1',
      wordCount: 3456,
      language: 'pt-BR',
      lastModified: new Date('2024-04-05'),
    },
  },
  {
    id: 'doc-004',
    filename: 'tabela_planos_precos.txt',
    fileType: 'txt',
    fileSizeBytes: 12345,
    uploadedAt: new Date('2024-04-10'),
    status: 'embedding',
    chunkCount: 8,
    embeddingProgress: 67,
    vectorHealth: 'missing',
    metadata: {
      title: 'Tabela de Planos e Preços',
      wordCount: 890,
      language: 'pt-BR',
    },
  },
  {
    id: 'doc-005',
    filename: 'faq_suporte_tecnico.pdf',
    fileType: 'pdf',
    fileSizeBytes: 2345678,
    uploadedAt: new Date('2024-04-12'),
    status: 'chunking',
    chunkCount: 0,
    embeddingProgress: 0,
    vectorHealth: 'missing',
    metadata: {
      title: 'FAQ - Suporte Técnico',
      pageCount: 45,
      language: 'pt-BR',
    },
  },
  {
    id: 'doc-006',
    filename: 'contrato_servicos_template.pdf',
    fileType: 'pdf',
    fileSizeBytes: 567890,
    uploadedAt: new Date('2024-04-13'),
    status: 'failed',
    chunkCount: 0,
    embeddingProgress: 0,
    vectorHealth: 'missing',
    errorMessage: 'Falha ao extrair texto: documento protegido por senha',
    metadata: {
      title: 'Template Contrato de Serviços',
    },
  },
]

// ============================================
// Mock Data: Tool Assignments
// ============================================
const mockToolAssignments: ToolAssignment[] = [
  {
    id: 'tool-001',
    name: 'Consultar Fatura',
    description: 'Consulta status de faturas e histórico de pagamentos',
    category: 'internal-api',
    endpoint: '/api/billing/invoices',
    assignedAgents: ['agent-001', 'agent-006'],
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      requiresAuth: true,
      rateLimit: 100,
    },
    healthStatus: 'healthy',
    avgExecutionMs: 145,
    timeoutMs: 5000,
    lastCalledAt: new Date(Date.now() - 30000),
    totalCalls: 45678,
    successRate: 99.2,
  },
  {
    id: 'tool-002',
    name: 'Reiniciar ONU',
    description: 'Envia comando de reinicialização para ONU do cliente',
    category: 'automation',
    endpoint: '/api/network/onu/restart',
    assignedAgents: ['agent-005'],
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      requiresAuth: true,
      rateLimit: 10,
    },
    healthStatus: 'healthy',
    avgExecutionMs: 2340,
    timeoutMs: 30000,
    lastCalledAt: new Date(Date.now() - 180000),
    totalCalls: 8923,
    successRate: 94.5,
  },
  {
    id: 'tool-003',
    name: 'Verificar SLA',
    description: 'Consulta métricas de SLA e tempo restante',
    category: 'internal-api',
    endpoint: '/api/support/sla',
    assignedAgents: ['agent-003', 'agent-005'],
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      requiresAuth: true,
    },
    healthStatus: 'healthy',
    avgExecutionMs: 67,
    timeoutMs: 3000,
    lastCalledAt: new Date(Date.now() - 5000),
    totalCalls: 123456,
    successRate: 99.9,
  },
  {
    id: 'tool-004',
    name: 'Consultar Financeiro',
    description: 'Acesso a informações financeiras do cliente',
    category: 'database',
    assignedAgents: ['agent-001', 'agent-006'],
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      requiresAuth: true,
      rateLimit: 50,
    },
    healthStatus: 'degraded',
    avgExecutionMs: 234,
    timeoutMs: 5000,
    lastCalledAt: new Date(Date.now() - 60000),
    totalCalls: 34567,
    successRate: 97.8,
  },
  {
    id: 'tool-005',
    name: 'Enviar SMS',
    description: 'Envia mensagem SMS para o cliente',
    category: 'external-api',
    endpoint: 'https://api.twilio.com/sms',
    assignedAgents: [],
    permissions: {
      canRead: false,
      canWrite: true,
      canDelete: false,
      requiresAuth: true,
      rateLimit: 5,
    },
    healthStatus: 'offline',
    avgExecutionMs: 0,
    timeoutMs: 10000,
    lastCalledAt: null,
    totalCalls: 0,
    successRate: 0,
  },
]

// ============================================
// Mock Data: Inference Traces
// ============================================
const generateMockInferenceTraces = (): InferenceTrace[] => {
  const agents = ['Agente Financeiro', 'Triagem N1', 'SLA Guardian', 'Analista de Sentimento']
  const tools = ['Consultar Fatura', 'Verificar SLA', 'Reiniciar ONU', null, null]
  const statuses: Array<'success' | 'error' | 'timeout'> = ['success', 'success', 'success', 'success', 'error', 'timeout']
  
  return Array.from({ length: 25 }, (_, i) => {
    const agentName = agents[Math.floor(Math.random() * agents.length)]
    const tool = tools[Math.floor(Math.random() * tools.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      id: `trace-${String(i + 1).padStart(3, '0')}`,
      agentId: `agent-00${Math.floor(Math.random() * 4) + 1}`,
      agentName,
      timestamp: new Date(Date.now() - i * 45000 - Math.random() * 30000),
      durationMs: Math.floor(Math.random() * 500) + 50,
      tokenUsage: {
        promptTokens: Math.floor(Math.random() * 500) + 100,
        completionTokens: Math.floor(Math.random() * 300) + 50,
        totalTokens: 0,
        estimatedCostUSD: 0,
      },
      confidenceScore: Math.floor(Math.random() * 30) + 70,
      status,
      triggeredTools: tool ? [tool] : [],
      inputPreview: 'Cliente perguntou sobre...',
      outputPreview: status === 'success' ? 'Resposta gerada com sucesso...' : undefined,
      errorMessage: status === 'error' ? 'Timeout na chamada de ferramenta' : undefined,
    }
  }).map(t => ({
    ...t,
    tokenUsage: {
      ...t.tokenUsage,
      totalTokens: t.tokenUsage.promptTokens + t.tokenUsage.completionTokens,
      estimatedCostUSD: (t.tokenUsage.promptTokens + t.tokenUsage.completionTokens) * 0.00001,
    }
  }))
}

// ============================================
// Mock Data: Telemetry Snapshot
// ============================================
const mockTelemetrySnapshot: TelemetrySnapshot = {
  timestamp: new Date(),
  periodMinutes: 60,
  totalInferences: 1247,
  avgLatencyMs: 187,
  errorRate: 1.2,
  tokensConsumed: {
    promptTokens: 456789,
    completionTokens: 234567,
    totalTokens: 691356,
    estimatedCostUSD: 12.45,
  },
  activeAgents: 4,
  toolCallFrequency: {
    'Consultar Fatura': 234,
    'Verificar SLA': 567,
    'Reiniciar ONU': 23,
    'Consultar Financeiro': 189,
  },
  costEstimate: {
    daily: 298.80,
    weekly: 2091.60,
    monthly: 8964.00,
    currency: 'BRL',
  },
}

// ============================================
// API Services
// ============================================

// Agents
export async function getOperationalAgents(): Promise<OperationalAgent[]> {
  await simulateLatency()
  return mockOperationalAgents
}

export async function getOperationalAgentById(id: string): Promise<OperationalAgent | null> {
  await simulateLatency()
  return mockOperationalAgents.find(a => a.id === id) || null
}

export async function updateAgentConfig(
  id: string, 
  config: Partial<Pick<OperationalAgent, 'systemPrompt' | 'temperature' | 'maxTokens' | 'model'>>
): Promise<OperationalAgent> {
  await simulateInferenceLatency()
  const agent = mockOperationalAgents.find(a => a.id === id)
  if (!agent) throw new Error('Agent not found')
  return { ...agent, ...config, updatedAt: new Date() }
}

export async function toggleAgentState(id: string, state: 'active' | 'offline'): Promise<OperationalAgent> {
  await simulateLatency()
  const agent = mockOperationalAgents.find(a => a.id === id)
  if (!agent) throw new Error('Agent not found')
  return { ...agent, lifecycleState: state, updatedAt: new Date() }
}

// Knowledge Base / RAG
export async function getRagDocuments(): Promise<RagDocument[]> {
  await simulateLatency()
  return mockRagDocuments
}

export async function uploadDocument(file: File): Promise<RagDocument> {
  await simulatePipelineLatency()
  return {
    id: `doc-${Date.now()}`,
    filename: file.name,
    fileType: file.name.split('.').pop() as RagDocument['fileType'],
    fileSizeBytes: file.size,
    uploadedAt: new Date(),
    status: 'uploading',
    chunkCount: 0,
    embeddingProgress: 0,
    vectorHealth: 'missing',
    metadata: {},
  }
}

export async function deleteDocument(id: string): Promise<void> {
  await simulateLatency()
}

export async function reindexDocument(id: string): Promise<RagDocument> {
  await simulatePipelineLatency()
  const doc = mockRagDocuments.find(d => d.id === id)
  if (!doc) throw new Error('Document not found')
  return { ...doc, status: 'chunking', embeddingProgress: 0 }
}

// Tools
export async function getToolAssignments(): Promise<ToolAssignment[]> {
  await simulateLatency()
  return mockToolAssignments
}

export async function updateToolAssignment(
  id: string, 
  updates: Partial<ToolAssignment>
): Promise<ToolAssignment> {
  await simulateLatency()
  const tool = mockToolAssignments.find(t => t.id === id)
  if (!tool) throw new Error('Tool not found')
  return { ...tool, ...updates }
}

// Telemetry
export async function getTelemetrySnapshot(): Promise<TelemetrySnapshot> {
  await simulateLatency()
  return {
    ...mockTelemetrySnapshot,
    timestamp: new Date(),
  }
}

export async function getInferenceTraces(limit = 25): Promise<InferenceTrace[]> {
  await simulateLatency()
  return generateMockInferenceTraces().slice(0, limit)
}

export async function getInferenceMetrics(): Promise<InferenceMetrics> {
  await simulateLatency()
  return {
    totalRequests: 45678,
    successfulRequests: 45123,
    failedRequests: 555,
    avgLatencyMs: 187,
    p50LatencyMs: 145,
    p95LatencyMs: 456,
    p99LatencyMs: 892,
    tokensConsumed: mockTelemetrySnapshot.tokensConsumed,
    errorsByType: {
      'Timeout': 234,
      'Rate Limit': 156,
      'Invalid Input': 89,
      'Tool Error': 76,
    },
    lastUpdated: new Date(),
  }
}

// Streaming simulation (for future WebSocket integration)
export function subscribeToInferenceStream(
  callback: (trace: InferenceTrace) => void
): () => void {
  const interval = setInterval(() => {
    const traces = generateMockInferenceTraces()
    callback(traces[0])
  }, 5000)
  
  return () => clearInterval(interval)
}

// Agent Stats
export async function getAgentStats(): Promise<{
  total: number
  active: number
  processing: number
  degraded: number
  offline: number
  avgConfidence: number
  totalInferences: number
}> {
  await simulateLatency()
  const agents = mockOperationalAgents
  return {
    total: agents.length,
    active: agents.filter(a => a.lifecycleState === 'active').length,
    processing: agents.filter(a => a.lifecycleState === 'processing').length,
    degraded: agents.filter(a => a.lifecycleState === 'degraded').length,
    offline: agents.filter(a => a.lifecycleState === 'offline').length,
    avgConfidence: Math.round(
      agents.filter(a => a.confidenceScore > 0).reduce((acc, a) => acc + a.confidenceScore, 0) / 
      agents.filter(a => a.confidenceScore > 0).length
    ),
    totalInferences: agents.reduce((acc, a) => acc + a.totalInferences, 0),
  }
}
