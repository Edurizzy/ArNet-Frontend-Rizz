// =============================================================================
// AUTOMATIONS & EVENTS ENGINE — STATE MANAGEMENT
// Isolated Zustand stores for workflow orchestration
// =============================================================================

import { create } from 'zustand';
import type {
  AutomationsTab,
  WorkflowDefinition,
  WorkflowExecution,
  EventLog,
  WebhookRequest,
  LogicNodeDefinition,
  WorkflowFilterState,
  ExecutionLogFilterState,
  WebhookFilterState,
  ExecutionTimeline,
} from '@/types/automations';

// -----------------------------------------------------------------------------
// TAB NAVIGATION STORE
// -----------------------------------------------------------------------------

interface AutomationsTabStore {
  activeTab: AutomationsTab;
  setActiveTab: (tab: AutomationsTab) => void;
}

export const useAutomationsTabStore = create<AutomationsTabStore>((set) => ({
  activeTab: 'workflows',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// -----------------------------------------------------------------------------
// WORKFLOW SELECTION STORE
// -----------------------------------------------------------------------------

interface WorkflowSelectionStore {
  selectedWorkflowId: string | null;
  selectedNodeId: string | null;
  isBuilderOpen: boolean;
  builderMode: 'view' | 'edit';
  setSelectedWorkflow: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  openBuilder: (workflowId: string, mode?: 'view' | 'edit') => void;
  closeBuilder: () => void;
}

export const useWorkflowSelectionStore = create<WorkflowSelectionStore>((set) => ({
  selectedWorkflowId: null,
  selectedNodeId: null,
  isBuilderOpen: false,
  builderMode: 'view',
  setSelectedWorkflow: (id) => set({ selectedWorkflowId: id }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  openBuilder: (workflowId, mode = 'view') =>
    set({ selectedWorkflowId: workflowId, isBuilderOpen: true, builderMode: mode }),
  closeBuilder: () =>
    set({ isBuilderOpen: false, selectedNodeId: null }),
}));

// -----------------------------------------------------------------------------
// WORKFLOWS DATA STORE
// -----------------------------------------------------------------------------

interface WorkflowsDataStore {
  workflows: WorkflowDefinition[];
  isLoading: boolean;
  error: string | null;
  filters: WorkflowFilterState;
  setWorkflows: (workflows: WorkflowDefinition[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<WorkflowFilterState>) => void;
  resetFilters: () => void;
}

const defaultWorkflowFilters: WorkflowFilterState = {
  search: '',
  status: 'all',
  healthState: 'all',
  triggerType: 'all',
};

export const useWorkflowsDataStore = create<WorkflowsDataStore>((set) => ({
  workflows: [],
  isLoading: false,
  error: null,
  filters: defaultWorkflowFilters,
  setWorkflows: (workflows) => set({ workflows }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultWorkflowFilters }),
}));

// -----------------------------------------------------------------------------
// WORKFLOW BUILDER STORE
// -----------------------------------------------------------------------------

interface WorkflowBuilderStore {
  currentWorkflow: WorkflowDefinition | null;
  draftNodes: LogicNodeDefinition[];
  hasUnsavedChanges: boolean;
  validationErrors: Map<string, string[]>;
  setCurrentWorkflow: (workflow: WorkflowDefinition | null) => void;
  setDraftNodes: (nodes: LogicNodeDefinition[]) => void;
  updateNode: (nodeId: string, updates: Partial<LogicNodeDefinition>) => void;
  addNode: (node: LogicNodeDefinition) => void;
  removeNode: (nodeId: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setValidationErrors: (errors: Map<string, string[]>) => void;
  resetBuilder: () => void;
}

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set) => ({
  currentWorkflow: null,
  draftNodes: [],
  hasUnsavedChanges: false,
  validationErrors: new Map(),
  setCurrentWorkflow: (workflow) =>
    set({ currentWorkflow: workflow, draftNodes: workflow?.nodes || [] }),
  setDraftNodes: (nodes) => set({ draftNodes: nodes, hasUnsavedChanges: true }),
  updateNode: (nodeId, updates) =>
    set((state) => ({
      draftNodes: state.draftNodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      hasUnsavedChanges: true,
    })),
  addNode: (node) =>
    set((state) => ({
      draftNodes: [...state.draftNodes, node],
      hasUnsavedChanges: true,
    })),
  removeNode: (nodeId) =>
    set((state) => ({
      draftNodes: state.draftNodes.filter((node) => node.id !== nodeId),
      hasUnsavedChanges: true,
    })),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  resetBuilder: () =>
    set({
      currentWorkflow: null,
      draftNodes: [],
      hasUnsavedChanges: false,
      validationErrors: new Map(),
    }),
}));

// -----------------------------------------------------------------------------
// EXECUTION LOGS STORE
// -----------------------------------------------------------------------------

interface ExecutionLogsStore {
  logs: EventLog[];
  isLoading: boolean;
  isLiveStreamPaused: boolean;
  error: string | null;
  filters: ExecutionLogFilterState;
  expandedLogIds: Set<string>;
  selectedExecution: WorkflowExecution | null;
  executionTimeline: ExecutionTimeline | null;
  setLogs: (logs: EventLog[]) => void;
  appendLog: (log: EventLog) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ExecutionLogFilterState>) => void;
  resetFilters: () => void;
  toggleLiveStream: () => void;
  toggleExpandedLog: (logId: string) => void;
  setSelectedExecution: (execution: WorkflowExecution | null) => void;
  setExecutionTimeline: (timeline: ExecutionTimeline | null) => void;
}

const defaultExecutionLogFilters: ExecutionLogFilterState = {
  search: '',
  workflowId: 'all',
  state: 'all',
  severity: 'all',
  dateRange: 'last_24h',
};

export const useExecutionLogsStore = create<ExecutionLogsStore>((set) => ({
  logs: [],
  isLoading: false,
  isLiveStreamPaused: false,
  error: null,
  filters: defaultExecutionLogFilters,
  expandedLogIds: new Set(),
  selectedExecution: null,
  executionTimeline: null,
  setLogs: (logs) => set({ logs }),
  appendLog: (log) =>
    set((state) => ({
      logs: state.isLiveStreamPaused ? state.logs : [log, ...state.logs].slice(0, 500),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultExecutionLogFilters }),
  toggleLiveStream: () =>
    set((state) => ({ isLiveStreamPaused: !state.isLiveStreamPaused })),
  toggleExpandedLog: (logId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedLogIds);
      if (newExpanded.has(logId)) {
        newExpanded.delete(logId);
      } else {
        newExpanded.add(logId);
      }
      return { expandedLogIds: newExpanded };
    }),
  setSelectedExecution: (execution) => set({ selectedExecution: execution }),
  setExecutionTimeline: (timeline) => set({ executionTimeline: timeline }),
}));

// -----------------------------------------------------------------------------
// WEBHOOKS STORE
// -----------------------------------------------------------------------------

interface WebhooksStore {
  webhooks: WebhookRequest[];
  isLoading: boolean;
  isLiveStreamActive: boolean;
  error: string | null;
  filters: WebhookFilterState;
  selectedWebhookId: string | null;
  setWebhooks: (webhooks: WebhookRequest[]) => void;
  appendWebhook: (webhook: WebhookRequest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<WebhookFilterState>) => void;
  resetFilters: () => void;
  setSelectedWebhook: (id: string | null) => void;
  toggleLiveStream: () => void;
}

const defaultWebhookFilters: WebhookFilterState = {
  search: '',
  provider: 'all',
  httpStatus: 'all',
  processingState: 'all',
};

export const useWebhooksStore = create<WebhooksStore>((set) => ({
  webhooks: [],
  isLoading: false,
  isLiveStreamActive: true,
  error: null,
  filters: defaultWebhookFilters,
  selectedWebhookId: null,
  setWebhooks: (webhooks) => set({ webhooks }),
  appendWebhook: (webhook) =>
    set((state) => ({
      webhooks: state.isLiveStreamActive
        ? [webhook, ...state.webhooks].slice(0, 200)
        : state.webhooks,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultWebhookFilters }),
  setSelectedWebhook: (id) => set({ selectedWebhookId: id }),
  toggleLiveStream: () =>
    set((state) => ({ isLiveStreamActive: !state.isLiveStreamActive })),
}));

// -----------------------------------------------------------------------------
// EXECUTION TRACE PANEL STORE
// -----------------------------------------------------------------------------

interface ExecutionTracePanelStore {
  isOpen: boolean;
  executionId: string | null;
  execution: WorkflowExecution | null;
  isLoading: boolean;
  activeTraceTab: 'timeline' | 'payload' | 'metadata' | 'retries';
  openPanel: (executionId: string) => void;
  closePanel: () => void;
  setExecution: (execution: WorkflowExecution | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveTraceTab: (tab: 'timeline' | 'payload' | 'metadata' | 'retries') => void;
}

export const useExecutionTracePanelStore = create<ExecutionTracePanelStore>((set) => ({
  isOpen: false,
  executionId: null,
  execution: null,
  isLoading: false,
  activeTraceTab: 'timeline',
  openPanel: (executionId) =>
    set({ isOpen: true, executionId, isLoading: true }),
  closePanel: () =>
    set({ isOpen: false, executionId: null, execution: null }),
  setExecution: (execution) => set({ execution, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveTraceTab: (tab) => set({ activeTraceTab: tab }),
}));

// -----------------------------------------------------------------------------
// SIMULATION STORE
// -----------------------------------------------------------------------------

interface SimulationStore {
  isSimulating: boolean;
  simulationWorkflowId: string | null;
  simulationSteps: Map<string, 'pending' | 'running' | 'success' | 'failed'>;
  simulationLogs: string[];
  startSimulation: (workflowId: string) => void;
  updateStepState: (
    nodeId: string,
    state: 'pending' | 'running' | 'success' | 'failed'
  ) => void;
  appendSimulationLog: (log: string) => void;
  endSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  isSimulating: false,
  simulationWorkflowId: null,
  simulationSteps: new Map(),
  simulationLogs: [],
  startSimulation: (workflowId) =>
    set({
      isSimulating: true,
      simulationWorkflowId: workflowId,
      simulationSteps: new Map(),
      simulationLogs: [],
    }),
  updateStepState: (nodeId, state) =>
    set((s) => {
      const newSteps = new Map(s.simulationSteps);
      newSteps.set(nodeId, state);
      return { simulationSteps: newSteps };
    }),
  appendSimulationLog: (log) =>
    set((s) => ({ simulationLogs: [...s.simulationLogs, log] })),
  endSimulation: () =>
    set({ isSimulating: false, simulationWorkflowId: null }),
}));
