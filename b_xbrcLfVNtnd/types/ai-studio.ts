// AI Studio module domain types
// Operational AI infrastructure entities

// Agent Lifecycle States
export type AgentLifecycleState = 
  | 'active' 
  | 'idle' 
  | 'processing' 
  | 'degraded' 
  | 'offline'
  | 'warmup'

export type AgentHealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

// Core Agent Entity
export interface OperationalAgent {
  id: string
  name: string
  description: string
  lifecycleState: AgentLifecycleState
  healthStatus: AgentHealthStatus
  model: ModelConfiguration
  systemPrompt: string
  temperature: number
  maxTokens: number
  toolAssignments: string[]
  guardrails: GuardrailConfig
  lastExecutionAt: Date | null
  activeInferences: number
  totalInferences: number
  avgLatencyMs: number
  confidenceScore: number // 0-100
  errorRate: number // percentage
  createdAt: Date
  updatedAt: Date
}

// Model Configuration
export interface ModelConfiguration {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'local' | 'groq' | 'mistral'
  contextWindow: number
  costPer1kTokens: number
  supportsTools: boolean
  supportsVision: boolean
}

// Guardrail Configuration
export interface GuardrailConfig {
  contentFiltering: boolean
  piiDetection: boolean
  maxResponseLength: number
  requireConfirmation: boolean
  blockedTopics: string[]
}

// Inference Metrics
export interface InferenceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgLatencyMs: number
  p50LatencyMs: number
  p95LatencyMs: number
  p99LatencyMs: number
  tokensConsumed: TokenUsage
  errorsByType: Record<string, number>
  lastUpdated: Date
}

// Token Usage
export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUSD: number
}

// RAG Document Entity
export interface RagDocument {
  id: string
  filename: string
  fileType: 'pdf' | 'txt' | 'md' | 'docx'
  fileSizeBytes: number
  uploadedAt: Date
  status: DocumentPipelineStatus
  chunkCount: number
  embeddingProgress: number // 0-100
  vectorHealth: VectorHealthStatus
  errorMessage?: string
  metadata: DocumentMetadata
}

export type DocumentPipelineStatus = 
  | 'uploading'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'ready'
  | 'failed'

export type VectorHealthStatus = 'optimal' | 'degraded' | 'stale' | 'missing'

export interface DocumentMetadata {
  title?: string
  author?: string
  pageCount?: number
  wordCount?: number
  language?: string
  lastModified?: Date
}

// Chunking Progress
export interface ChunkingProgress {
  documentId: string
  totalChunks: number
  processedChunks: number
  chunkSize: number
  overlap: number
  strategy: 'fixed' | 'semantic' | 'recursive'
}

// Vectorization Status
export interface VectorizationStatus {
  documentId: string
  embeddingModel: string
  dimensions: number
  totalVectors: number
  indexedVectors: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Tool Assignment & Configuration
export interface ToolAssignment {
  id: string
  name: string
  description: string
  category: 'internal-api' | 'external-api' | 'database' | 'automation'
  endpoint?: string
  assignedAgents: string[]
  permissions: ToolPermissions
  healthStatus: 'healthy' | 'degraded' | 'offline'
  avgExecutionMs: number
  timeoutMs: number
  lastCalledAt: Date | null
  totalCalls: number
  successRate: number
}

export interface ToolPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  requiresAuth: boolean
  rateLimit?: number
}

// Inference Trace
export interface InferenceTrace {
  id: string
  agentId: string
  agentName: string
  timestamp: Date
  durationMs: number
  tokenUsage: TokenUsage
  confidenceScore: number
  status: 'success' | 'error' | 'timeout'
  triggeredTools: string[]
  inputPreview?: string
  outputPreview?: string
  errorMessage?: string
}

// Telemetry Snapshot
export interface TelemetrySnapshot {
  timestamp: Date
  periodMinutes: number
  totalInferences: number
  avgLatencyMs: number
  errorRate: number
  tokensConsumed: TokenUsage
  activeAgents: number
  toolCallFrequency: Record<string, number>
  costEstimate: CostEstimate
}

export interface CostEstimate {
  daily: number
  weekly: number
  monthly: number
  currency: 'USD' | 'BRL'
}

// Prompt Configuration
export interface PromptConfiguration {
  id: string
  agentId: string
  version: number
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  createdAt: Date
  createdBy: string
  isActive: boolean
}

// UI State Types
export type AiStudioTab = 
  | 'agents' 
  | 'knowledge-base' 
  | 'tools' 
  | 'telemetry'

export interface AiStudioFilters {
  agentStatus: AgentLifecycleState | 'all'
  documentStatus: DocumentPipelineStatus | 'all'
  toolCategory: ToolAssignment['category'] | 'all'
  searchQuery: string
}

// Async State for realtime updates
export type StreamingState = 
  | { status: 'idle' }
  | { status: 'connecting' }
  | { status: 'streaming'; lastEvent: Date }
  | { status: 'error'; error: string }

// Available Models
export const AVAILABLE_MODELS: ModelConfiguration[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    supportsTools: true,
    supportsVision: true,
  },
  {
    id: 'llama3-70b',
    name: 'Llama 3 70B',
    provider: 'local',
    contextWindow: 8192,
    costPer1kTokens: 0,
    supportsTools: true,
    supportsVision: false,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    contextWindow: 32000,
    costPer1kTokens: 0.002,
    supportsTools: true,
    supportsVision: false,
  },
  {
    id: 'bertimbau',
    name: 'BERTimbau',
    provider: 'local',
    contextWindow: 512,
    costPer1kTokens: 0,
    supportsTools: false,
    supportsVision: false,
  },
]
