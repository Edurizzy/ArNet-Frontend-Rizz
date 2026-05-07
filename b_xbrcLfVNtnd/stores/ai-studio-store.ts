'use client'

import { create } from 'zustand'
import type {
  AiStudioTab,
  AiStudioFilters,
  OperationalAgent,
  RagDocument,
  ToolAssignment,
  InferenceTrace,
  TelemetrySnapshot,
  PromptConfiguration,
  StreamingState,
} from '@/types/ai-studio'

// ============================================
// Tab Navigation UI State
// ============================================
interface AiStudioTabState {
  activeTab: AiStudioTab
  setActiveTab: (tab: AiStudioTab) => void
}

export const useAiStudioTabStore = create<AiStudioTabState>((set) => ({
  activeTab: 'agents',
  setActiveTab: (activeTab) => set({ activeTab }),
}))

// ============================================
// Filters UI State
// ============================================
interface AiStudioFiltersState {
  filters: AiStudioFilters
  setFilters: (filters: Partial<AiStudioFilters>) => void
  resetFilters: () => void
  setSearchQuery: (query: string) => void
}

const defaultFilters: AiStudioFilters = {
  agentStatus: 'all',
  documentStatus: 'all',
  toolCategory: 'all',
  searchQuery: '',
}

export const useAiStudioFiltersStore = create<AiStudioFiltersState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearchQuery: (searchQuery) => set((state) => ({
    filters: { ...state.filters, searchQuery }
  })),
}))

// ============================================
// Agent Selection & Editor State
// ============================================
interface AgentSelectionState {
  selectedAgentId: string | null
  selectedAgent: OperationalAgent | null
  isEditorOpen: boolean
  isLoadingAgent: boolean
  isSavingAgent: boolean
  
  // Prompt Editor State
  draftSystemPrompt: string
  draftTemperature: number
  draftMaxTokens: number
  draftModel: string
  hasUnsavedChanges: boolean
  
  // Actions
  selectAgent: (id: string | null) => void
  setSelectedAgent: (agent: OperationalAgent | null) => void
  openEditor: () => void
  closeEditor: () => void
  setLoadingAgent: (loading: boolean) => void
  setSavingAgent: (saving: boolean) => void
  
  // Draft Actions
  setDraftSystemPrompt: (prompt: string) => void
  setDraftTemperature: (temp: number) => void
  setDraftMaxTokens: (tokens: number) => void
  setDraftModel: (model: string) => void
  initializeDraft: (agent: OperationalAgent) => void
  markUnsavedChanges: (hasChanges: boolean) => void
  discardChanges: () => void
}

export const useAgentSelectionStore = create<AgentSelectionState>((set, get) => ({
  selectedAgentId: null,
  selectedAgent: null,
  isEditorOpen: false,
  isLoadingAgent: false,
  isSavingAgent: false,
  
  draftSystemPrompt: '',
  draftTemperature: 0.7,
  draftMaxTokens: 4096,
  draftModel: 'gpt-4o',
  hasUnsavedChanges: false,

  selectAgent: (id) => set({
    selectedAgentId: id,
    isEditorOpen: id !== null,
    selectedAgent: null,
  }),

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  
  openEditor: () => set({ isEditorOpen: true }),
  closeEditor: () => set({ isEditorOpen: false }),
  
  setLoadingAgent: (isLoadingAgent) => set({ isLoadingAgent }),
  setSavingAgent: (isSavingAgent) => set({ isSavingAgent }),

  setDraftSystemPrompt: (draftSystemPrompt) => set({ 
    draftSystemPrompt, 
    hasUnsavedChanges: true 
  }),
  setDraftTemperature: (draftTemperature) => set({ 
    draftTemperature, 
    hasUnsavedChanges: true 
  }),
  setDraftMaxTokens: (draftMaxTokens) => set({ 
    draftMaxTokens, 
    hasUnsavedChanges: true 
  }),
  setDraftModel: (draftModel) => set({ 
    draftModel, 
    hasUnsavedChanges: true 
  }),

  initializeDraft: (agent) => set({
    draftSystemPrompt: agent.systemPrompt,
    draftTemperature: agent.temperature,
    draftMaxTokens: agent.maxTokens,
    draftModel: agent.model.id,
    hasUnsavedChanges: false,
  }),

  markUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),

  discardChanges: () => {
    const agent = get().selectedAgent
    if (agent) {
      set({
        draftSystemPrompt: agent.systemPrompt,
        draftTemperature: agent.temperature,
        draftMaxTokens: agent.maxTokens,
        draftModel: agent.model.id,
        hasUnsavedChanges: false,
      })
    }
  },
}))

// ============================================
// Agents Data State (separate from UI)
// ============================================
interface AgentsDataState {
  agents: OperationalAgent[]
  isLoading: boolean
  error: string | null
  lastFetchedAt: Date | null
  
  // Actions
  setAgents: (agents: OperationalAgent[]) => void
  updateAgent: (id: string, updates: Partial<OperationalAgent>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
}

export const useAgentsDataStore = create<AgentsDataState>((set) => ({
  agents: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  setAgents: (agents) => set({ 
    agents, 
    lastFetchedAt: new Date(),
    error: null,
  }),

  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    ),
  })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearData: () => set({
    agents: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  }),
}))

// ============================================
// Knowledge Base Document State
// ============================================
interface KnowledgeBaseState {
  documents: RagDocument[]
  selectedDocumentId: string | null
  isLoading: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  
  // Actions
  setDocuments: (documents: RagDocument[]) => void
  addDocument: (document: RagDocument) => void
  updateDocument: (id: string, updates: Partial<RagDocument>) => void
  removeDocument: (id: string) => void
  selectDocument: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setUploading: (uploading: boolean) => void
  setUploadProgress: (progress: number) => void
  setError: (error: string | null) => void
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set) => ({
  documents: [],
  selectedDocumentId: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  setDocuments: (documents) => set({ documents, error: null }),
  
  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents],
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    ),
  })),
  
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id),
  })),
  
  selectDocument: (selectedDocumentId) => set({ selectedDocumentId }),
  setLoading: (isLoading) => set({ isLoading }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setError: (error) => set({ error }),
}))

// ============================================
// Tools Orchestration State
// ============================================
interface ToolsOrchestrationState {
  tools: ToolAssignment[]
  selectedToolId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setTools: (tools: ToolAssignment[]) => void
  updateTool: (id: string, updates: Partial<ToolAssignment>) => void
  selectTool: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useToolsOrchestrationStore = create<ToolsOrchestrationState>((set) => ({
  tools: [],
  selectedToolId: null,
  isLoading: false,
  error: null,

  setTools: (tools) => set({ tools, error: null }),
  
  updateTool: (id, updates) => set((state) => ({
    tools: state.tools.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  
  selectTool: (selectedToolId) => set({ selectedToolId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ============================================
// Telemetry & Observability State
// ============================================
interface TelemetryState {
  snapshot: TelemetrySnapshot | null
  inferenceTraces: InferenceTrace[]
  isLoading: boolean
  streamingState: StreamingState
  expandedSections: Set<string>
  
  // Actions
  setSnapshot: (snapshot: TelemetrySnapshot) => void
  setInferenceTraces: (traces: InferenceTrace[]) => void
  addInferenceTrace: (trace: InferenceTrace) => void
  setLoading: (loading: boolean) => void
  setStreamingState: (state: StreamingState) => void
  toggleSection: (section: string) => void
  expandSection: (section: string) => void
  collapseSection: (section: string) => void
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  snapshot: null,
  inferenceTraces: [],
  isLoading: false,
  streamingState: { status: 'idle' },
  expandedSections: new Set(['metrics', 'feed']),

  setSnapshot: (snapshot) => set({ snapshot }),
  
  setInferenceTraces: (inferenceTraces) => set({ inferenceTraces }),
  
  addInferenceTrace: (trace) => set((state) => ({
    inferenceTraces: [trace, ...state.inferenceTraces].slice(0, 100), // Keep last 100
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setStreamingState: (streamingState) => set({ streamingState }),
  
  toggleSection: (section) => set((state) => {
    const newSet = new Set(state.expandedSections)
    if (newSet.has(section)) {
      newSet.delete(section)
    } else {
      newSet.add(section)
    }
    return { expandedSections: newSet }
  }),
  
  expandSection: (section) => set((state) => {
    const newSet = new Set(state.expandedSections)
    newSet.add(section)
    return { expandedSections: newSet }
  }),
  
  collapseSection: (section) => set((state) => {
    const newSet = new Set(state.expandedSections)
    newSet.delete(section)
    return { expandedSections: newSet }
  }),
}))

// ============================================
// Side Panel State (for detail views)
// ============================================
interface SidePanelState {
  isOpen: boolean
  panelType: 'agent-detail' | 'document-detail' | 'tool-detail' | 'trace-detail' | null
  panelData: unknown
  
  // Actions
  openPanel: (type: SidePanelState['panelType'], data?: unknown) => void
  closePanel: () => void
  setPanelData: (data: unknown) => void
}

export const useSidePanelStore = create<SidePanelState>((set) => ({
  isOpen: false,
  panelType: null,
  panelData: null,

  openPanel: (panelType, panelData = null) => set({ 
    isOpen: true, 
    panelType, 
    panelData 
  }),
  
  closePanel: () => set({ 
    isOpen: false, 
    panelType: null, 
    panelData: null 
  }),
  
  setPanelData: (panelData) => set({ panelData }),
}))
