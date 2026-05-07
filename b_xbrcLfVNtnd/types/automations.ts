// =============================================================================
// AUTOMATIONS & EVENTS ENGINE — TYPE DEFINITIONS
// Enterprise workflow orchestration domain model
// =============================================================================

// -----------------------------------------------------------------------------
// EXECUTION STATE MACHINE
// -----------------------------------------------------------------------------

export type ExecutionState =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'retrying'
  | 'skipped'
  | 'cancelled';

export type WorkflowHealthState =
  | 'healthy'
  | 'degraded'
  | 'failing'
  | 'disabled';

export type EventSeverity = 'info' | 'warning' | 'critical';

export type NodeType =
  | 'trigger'
  | 'condition'
  | 'action'
  | 'branch'
  | 'delay'
  | 'ai_decision';

// -----------------------------------------------------------------------------
// TRIGGER DEFINITIONS
// -----------------------------------------------------------------------------

export type TriggerType =
  | 'message_received'
  | 'ticket_created'
  | 'ticket_updated'
  | 'customer_created'
  | 'payment_received'
  | 'payment_failed'
  | 'webhook_inbound'
  | 'schedule_cron'
  | 'manual'
  | 'ai_escalation'
  | 'sla_breach';

export interface TriggerDefinition {
  id: string;
  type: TriggerType;
  label: string;
  description: string;
  sourceChannel?: string;
  webhookEndpoint?: string;
  cronExpression?: string;
  filterConditions?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// CONDITION DEFINITIONS
// -----------------------------------------------------------------------------

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'matches_regex'
  | 'in_list'
  | 'not_in_list';

export interface ConditionDefinition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface ConditionGroup {
  id: string;
  conditions: ConditionDefinition[];
  logicalOperator: 'AND' | 'OR';
}

// -----------------------------------------------------------------------------
// ACTION DEFINITIONS
// -----------------------------------------------------------------------------

export type ActionType =
  | 'send_message'
  | 'assign_ticket'
  | 'update_status'
  | 'add_tag'
  | 'remove_tag'
  | 'transfer_to_ai'
  | 'transfer_to_human'
  | 'create_task'
  | 'send_webhook'
  | 'update_customer'
  | 'send_notification'
  | 'log_event'
  | 'delay_execution'
  | 'invoke_ai_agent';

export interface ActionDefinition {
  id: string;
  type: ActionType;
  label: string;
  description: string;
  parameters: Record<string, unknown>;
  estimatedLatencyMs?: number;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

// -----------------------------------------------------------------------------
// LOGIC NODE — EXECUTION UNIT
// -----------------------------------------------------------------------------

export interface LogicNodeDefinition {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  trigger?: TriggerDefinition;
  conditions?: ConditionGroup;
  action?: ActionDefinition;
  branchTrue?: string; // next node ID
  branchFalse?: string; // next node ID for condition failures
  nextNodeId?: string;
  position: { x: number; y: number };
  validationState: 'valid' | 'warning' | 'error';
  validationMessages?: string[];
}

// -----------------------------------------------------------------------------
// WORKFLOW DEFINITION
// -----------------------------------------------------------------------------

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  versionLabel?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  healthState: WorkflowHealthState;
  triggerType: TriggerType;
  triggerLabel: string;
  nodes: LogicNodeDefinition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastExecutedAt?: string;
  executionCount: number;
  successRate: number;
  failureRate: number;
  avgExecutionTimeMs: number;
  tags: string[];
}

export interface WorkflowVersion {
  version: number;
  versionLabel: string;
  createdAt: string;
  createdBy: string;
  changeDescription: string;
  isActive: boolean;
}

// -----------------------------------------------------------------------------
// WORKFLOW EXECUTION — RUNTIME STATE
// -----------------------------------------------------------------------------

export interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  state: ExecutionState;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: ExecutionError;
  retryAttempts: RetryAttempt[];
  metadata?: RuntimeMetadata;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack?: string;
  retriable: boolean;
}

export interface RetryAttempt {
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  state: ExecutionState;
  error?: ExecutionError;
}

export interface RuntimeMetadata {
  serviceId?: string;
  workerId?: string;
  queueName?: string;
  processingTimeMs?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: number;
  correlationId: string;
  state: ExecutionState;
  severity: EventSeverity;
  triggerEvent: string;
  triggerSource: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  steps: ExecutionStep[];
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  metadata: RuntimeMetadata;
}

export interface ExecutionTimeline {
  executionId: string;
  steps: ExecutionTimelineStep[];
  totalDurationMs: number;
}

export interface ExecutionTimelineStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  state: ExecutionState;
  startOffsetMs: number;
  durationMs: number;
  retryCount: number;
}

// -----------------------------------------------------------------------------
// EVENT LOG — OPERATIONAL TELEMETRY
// -----------------------------------------------------------------------------

export interface EventLog {
  id: string;
  timestamp: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  correlationId: string;
  triggerEvent: string;
  sourceService: string;
  actionTaken: string;
  state: ExecutionState;
  severity: EventSeverity;
  durationMs: number;
  metadata?: RuntimeMetadata;
  payload?: Record<string, unknown>;
  traceId?: string;
}

export interface CorrelationTrace {
  correlationId: string;
  events: EventLog[];
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  spanCount: number;
}

// -----------------------------------------------------------------------------
// WEBHOOK INGESTION
// -----------------------------------------------------------------------------

export type WebhookProvider =
  | 'stripe'
  | 'mercadopago'
  | 'twilio'
  | 'whatsapp'
  | 'telegram'
  | 'slack'
  | 'github'
  | 'custom'
  | 'internal';

export interface WebhookRequest {
  id: string;
  receivedAt: string;
  provider: WebhookProvider;
  providerLabel: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  httpStatus: number;
  latencyMs: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  rawBody?: string;
  signatureValid: boolean;
  signatureHeader?: string;
  processingState: ExecutionState;
  retryAttempts: number;
  linkedWorkflowId?: string;
  linkedExecutionId?: string;
  responseBody?: Record<string, unknown>;
  processingDiagnostics?: string[];
}

export interface WebhookPayload {
  headers: Record<string, string>;
  body: Record<string, unknown>;
  rawBody?: string;
}

// -----------------------------------------------------------------------------
// UI STATE CONTRACTS
// -----------------------------------------------------------------------------

export type AutomationsTab = 'workflows' | 'execution_logs' | 'webhooks';

export interface WorkflowFilterState {
  search: string;
  status: WorkflowDefinition['status'] | 'all';
  healthState: WorkflowHealthState | 'all';
  triggerType: TriggerType | 'all';
}

export interface ExecutionLogFilterState {
  search: string;
  workflowId: string | 'all';
  state: ExecutionState | 'all';
  severity: EventSeverity | 'all';
  dateRange: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d';
}

export interface WebhookFilterState {
  search: string;
  provider: WebhookProvider | 'all';
  httpStatus: 'all' | '2xx' | '4xx' | '5xx';
  processingState: ExecutionState | 'all';
}
