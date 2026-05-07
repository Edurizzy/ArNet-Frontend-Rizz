// =============================================================================
// AUTOMATIONS & EVENTS ENGINE — MOCK API SERVICES
// Promise-based services with simulated execution dynamics
// =============================================================================

import type {
  WorkflowDefinition,
  WorkflowExecution,
  EventLog,
  WebhookRequest,
  LogicNodeDefinition,
  ExecutionTimeline,
  ExecutionState,
  EventSeverity,
  TriggerType,
  NodeType,
  WebhookProvider,
  WorkflowHealthState,
} from '@/types/automations';

// -----------------------------------------------------------------------------
// UTILITY HELPERS
// -----------------------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomId = () => Math.random().toString(36).substring(2, 15);

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const formatISODate = (date: Date) => date.toISOString();

const minutesAgo = (minutes: number) =>
  formatISODate(new Date(Date.now() - minutes * 60 * 1000));

// -----------------------------------------------------------------------------
// MOCK WORKFLOW DEFINITIONS
// -----------------------------------------------------------------------------

const mockNodes: Record<string, LogicNodeDefinition[]> = {
  'wf-001': [
    {
      id: 'node-1',
      type: 'trigger',
      label: 'Nova Mensagem Recebida',
      description: 'Dispara quando uma nova mensagem é recebida em qualquer canal',
      trigger: {
        id: 'trig-1',
        type: 'message_received',
        label: 'Mensagem Recebida',
        description: 'Webhook de mensagem inbound',
        sourceChannel: 'whatsapp',
      },
      position: { x: 0, y: 0 },
      validationState: 'valid',
      nextNodeId: 'node-2',
    },
    {
      id: 'node-2',
      type: 'condition',
      label: 'Verificar Horário Comercial',
      description: 'Verifica se está fora do horário comercial (18h-8h)',
      conditions: {
        id: 'cond-group-1',
        conditions: [
          { id: 'cond-1', field: 'current_hour', operator: 'greater_than', value: 18 },
          { id: 'cond-2', field: 'current_hour', operator: 'less_than', value: 8, logicalOperator: 'OR' },
        ],
        logicalOperator: 'OR',
      },
      position: { x: 0, y: 100 },
      validationState: 'valid',
      branchTrue: 'node-3',
      branchFalse: 'node-4',
    },
    {
      id: 'node-3',
      type: 'action',
      label: 'Transferir para IA',
      description: 'Encaminha a conversa para o agente de IA',
      action: {
        id: 'action-1',
        type: 'transfer_to_ai',
        label: 'Transferir para IA',
        description: 'Aciona o agente de atendimento automatizado',
        parameters: { agentId: 'agent-aria', priority: 'high' },
        estimatedLatencyMs: 150,
      },
      position: { x: -100, y: 200 },
      validationState: 'valid',
      nextNodeId: 'node-5',
    },
    {
      id: 'node-4',
      type: 'action',
      label: 'Criar Ticket de Atendimento',
      description: 'Cria um novo ticket na fila de atendimento humano',
      action: {
        id: 'action-2',
        type: 'assign_ticket',
        label: 'Criar Ticket',
        description: 'Encaminha para fila de atendimento',
        parameters: { queue: 'support-tier-1', priority: 'normal' },
        estimatedLatencyMs: 80,
      },
      position: { x: 100, y: 200 },
      validationState: 'valid',
      nextNodeId: 'node-5',
    },
    {
      id: 'node-5',
      type: 'action',
      label: 'Registrar Evento',
      description: 'Loga o evento no sistema de telemetria',
      action: {
        id: 'action-3',
        type: 'log_event',
        label: 'Log Event',
        description: 'Registra no OpenTelemetry',
        parameters: { level: 'info', service: 'workflow-engine' },
        estimatedLatencyMs: 20,
      },
      position: { x: 0, y: 300 },
      validationState: 'valid',
    },
  ],
  'wf-002': [
    {
      id: 'node-1',
      type: 'trigger',
      label: 'Pagamento Recebido',
      description: 'Webhook Stripe/MercadoPago payment.succeeded',
      trigger: {
        id: 'trig-2',
        type: 'payment_received',
        label: 'Pagamento Confirmado',
        description: 'Evento de pagamento aprovado',
      },
      position: { x: 0, y: 0 },
      validationState: 'valid',
      nextNodeId: 'node-2',
    },
    {
      id: 'node-2',
      type: 'action',
      label: 'Atualizar Status do Cliente',
      description: 'Marca o cliente como ativo no CRM',
      action: {
        id: 'action-4',
        type: 'update_customer',
        label: 'Update Customer',
        description: 'Atualiza status financeiro',
        parameters: { status: 'active', updateField: 'financial_status' },
        estimatedLatencyMs: 120,
      },
      position: { x: 0, y: 100 },
      validationState: 'valid',
      nextNodeId: 'node-3',
    },
    {
      id: 'node-3',
      type: 'action',
      label: 'Enviar Confirmação',
      description: 'Envia mensagem de confirmação via WhatsApp',
      action: {
        id: 'action-5',
        type: 'send_message',
        label: 'Enviar Mensagem',
        description: 'Template de confirmação de pagamento',
        parameters: { channel: 'whatsapp', templateId: 'payment_confirmed' },
        estimatedLatencyMs: 200,
      },
      position: { x: 0, y: 200 },
      validationState: 'valid',
    },
  ],
  'wf-003': [
    {
      id: 'node-1',
      type: 'trigger',
      label: 'SLA Breach Detectado',
      description: 'Dispara quando um ticket ultrapassa o tempo de SLA',
      trigger: {
        id: 'trig-3',
        type: 'sla_breach',
        label: 'SLA Breach',
        description: 'Alerta de violação de SLA',
      },
      position: { x: 0, y: 0 },
      validationState: 'valid',
      nextNodeId: 'node-2',
    },
    {
      id: 'node-2',
      type: 'ai_decision',
      label: 'Avaliar Prioridade com IA',
      description: 'Usa IA para determinar a severidade da violação',
      action: {
        id: 'action-6',
        type: 'invoke_ai_agent',
        label: 'AI Decision',
        description: 'Análise de priorização inteligente',
        parameters: { agentId: 'agent-prioriza', model: 'gpt-4o-mini' },
        estimatedLatencyMs: 800,
      },
      position: { x: 0, y: 100 },
      validationState: 'valid',
      nextNodeId: 'node-3',
    },
    {
      id: 'node-3',
      type: 'condition',
      label: 'Severidade Crítica?',
      description: 'Verifica se a IA classificou como crítico',
      conditions: {
        id: 'cond-group-2',
        conditions: [
          { id: 'cond-3', field: 'ai_severity', operator: 'equals', value: 'critical' },
        ],
        logicalOperator: 'AND',
      },
      position: { x: 0, y: 200 },
      validationState: 'valid',
      branchTrue: 'node-4',
      branchFalse: 'node-5',
    },
    {
      id: 'node-4',
      type: 'action',
      label: 'Escalar para Supervisor',
      description: 'Notifica supervisor imediatamente',
      action: {
        id: 'action-7',
        type: 'send_notification',
        label: 'Notificar Supervisor',
        description: 'Alerta urgente para equipe de gestão',
        parameters: { channel: 'slack', urgency: 'critical' },
        estimatedLatencyMs: 50,
      },
      position: { x: -100, y: 300 },
      validationState: 'valid',
    },
    {
      id: 'node-5',
      type: 'action',
      label: 'Adicionar Tag de Prioridade',
      description: 'Marca o ticket para revisão na próxima hora',
      action: {
        id: 'action-8',
        type: 'add_tag',
        label: 'Add Tag',
        description: 'Tag de prioridade elevada',
        parameters: { tag: 'priority-review' },
        estimatedLatencyMs: 30,
      },
      position: { x: 100, y: 300 },
      validationState: 'valid',
    },
  ],
};

const mockWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-001',
    name: 'Roteamento Inteligente de Mensagens',
    description: 'Direciona mensagens para IA ou atendimento humano baseado no horário',
    version: 3,
    versionLabel: 'v3.0.1',
    status: 'active',
    healthState: 'healthy',
    triggerType: 'message_received',
    triggerLabel: 'Nova Mensagem',
    nodes: mockNodes['wf-001'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: minutesAgo(45),
    createdBy: 'carlos.silva@arnet.io',
    lastExecutedAt: minutesAgo(2),
    executionCount: 12847,
    successRate: 98.7,
    failureRate: 1.3,
    avgExecutionTimeMs: 342,
    tags: ['atendimento', 'ia', 'roteamento'],
  },
  {
    id: 'wf-002',
    name: 'Confirmação de Pagamento',
    description: 'Atualiza status do cliente e envia confirmação após pagamento',
    version: 2,
    versionLabel: 'v2.1.0',
    status: 'active',
    healthState: 'healthy',
    triggerType: 'payment_received',
    triggerLabel: 'Pagamento Confirmado',
    nodes: mockNodes['wf-002'],
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: minutesAgo(180),
    createdBy: 'ana.costa@arnet.io',
    lastExecutedAt: minutesAgo(8),
    executionCount: 3421,
    successRate: 99.2,
    failureRate: 0.8,
    avgExecutionTimeMs: 520,
    tags: ['financeiro', 'notificação'],
  },
  {
    id: 'wf-003',
    name: 'Escalação Automática de SLA',
    description: 'Avalia e escala tickets que violam SLA usando IA',
    version: 1,
    versionLabel: 'v1.0.0',
    status: 'active',
    healthState: 'degraded',
    triggerType: 'sla_breach',
    triggerLabel: 'SLA Breach',
    nodes: mockNodes['wf-003'],
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: minutesAgo(60),
    createdBy: 'rafael.lima@arnet.io',
    lastExecutedAt: minutesAgo(15),
    executionCount: 892,
    successRate: 94.5,
    failureRate: 5.5,
    avgExecutionTimeMs: 1250,
    tags: ['sla', 'escalação', 'ia'],
  },
  {
    id: 'wf-004',
    name: 'Webhook Handler - Twilio',
    description: 'Processa eventos de SMS e chamadas do Twilio',
    version: 4,
    versionLabel: 'v4.0.0',
    status: 'active',
    healthState: 'healthy',
    triggerType: 'webhook_inbound',
    triggerLabel: 'Webhook Twilio',
    nodes: mockNodes['wf-001'], // reuse for demo
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: minutesAgo(300),
    createdBy: 'mariana.santos@arnet.io',
    lastExecutedAt: minutesAgo(1),
    executionCount: 45230,
    successRate: 99.8,
    failureRate: 0.2,
    avgExecutionTimeMs: 180,
    tags: ['twilio', 'sms', 'webhook'],
  },
  {
    id: 'wf-005',
    name: 'Retry de Pagamentos Falhos',
    description: 'Tenta novamente cobranças que falharam',
    version: 1,
    versionLabel: 'v1.2.0',
    status: 'paused',
    healthState: 'failing',
    triggerType: 'payment_failed',
    triggerLabel: 'Pagamento Falhou',
    nodes: mockNodes['wf-002'], // reuse for demo
    createdAt: '2024-04-01T11:00:00Z',
    updatedAt: minutesAgo(1440),
    createdBy: 'pedro.oliveira@arnet.io',
    lastExecutedAt: minutesAgo(720),
    executionCount: 156,
    successRate: 72.4,
    failureRate: 27.6,
    avgExecutionTimeMs: 2100,
    tags: ['financeiro', 'retry', 'cobrança'],
  },
  {
    id: 'wf-006',
    name: 'Onboarding de Novos Clientes',
    description: 'Sequência de boas-vindas para novos cadastros',
    version: 2,
    versionLabel: 'v2.0.0',
    status: 'draft',
    healthState: 'healthy',
    triggerType: 'customer_created',
    triggerLabel: 'Novo Cliente',
    nodes: mockNodes['wf-002'], // reuse for demo
    createdAt: '2024-05-01T16:00:00Z',
    updatedAt: minutesAgo(30),
    createdBy: 'julia.mendes@arnet.io',
    executionCount: 0,
    successRate: 0,
    failureRate: 0,
    avgExecutionTimeMs: 0,
    tags: ['onboarding', 'marketing'],
  },
];

// -----------------------------------------------------------------------------
// MOCK EVENT LOGS
// -----------------------------------------------------------------------------

const generateEventLogs = (count: number): EventLog[] => {
  const logs: EventLog[] = [];
  const workflowNames = mockWorkflows.map((w) => ({ id: w.id, name: w.name }));
  const states: ExecutionState[] = ['success', 'success', 'success', 'success', 'failed', 'retrying'];
  const severities: EventSeverity[] = ['info', 'info', 'info', 'warning', 'critical'];
  const actions = [
    'Mensagem roteada para IA',
    'Ticket criado na fila',
    'Pagamento processado',
    'Notificação enviada',
    'Tag adicionada',
    'Status atualizado',
    'Webhook processado',
    'Evento logado',
  ];
  const services = ['workflow-engine', 'message-router', 'payment-processor', 'notification-service'];
  const triggers = [
    'message.received',
    'payment.succeeded',
    'payment.failed',
    'ticket.created',
    'sla.breached',
    'webhook.inbound',
  ];

  for (let i = 0; i < count; i++) {
    const workflow = randomChoice(workflowNames);
    const state = randomChoice(states);
    logs.push({
      id: `log-${randomId()}`,
      timestamp: minutesAgo(i * 2 + randomInt(0, 5)),
      workflowId: workflow.id,
      workflowName: workflow.name,
      executionId: `exec-${randomId()}`,
      correlationId: `corr-${randomId().substring(0, 8)}`,
      triggerEvent: randomChoice(triggers),
      sourceService: randomChoice(services),
      actionTaken: randomChoice(actions),
      state,
      severity: state === 'failed' ? 'critical' : state === 'retrying' ? 'warning' : randomChoice(severities),
      durationMs: randomInt(50, 2000),
      metadata: {
        serviceId: `svc-${randomInt(1, 5)}`,
        workerId: `worker-${randomInt(1, 10)}`,
        queueName: 'automations-queue',
        processingTimeMs: randomInt(20, 500),
      },
      payload: {
        customerId: `cust-${randomId()}`,
        channel: randomChoice(['whatsapp', 'telegram', 'email', 'sms']),
        priority: randomChoice(['low', 'normal', 'high']),
      },
    });
  }

  return logs;
};

// -----------------------------------------------------------------------------
// MOCK WEBHOOK REQUESTS
// -----------------------------------------------------------------------------

const generateWebhooks = (count: number): WebhookRequest[] => {
  const webhooks: WebhookRequest[] = [];
  const providers: { provider: WebhookProvider; label: string }[] = [
    { provider: 'stripe', label: 'Stripe' },
    { provider: 'mercadopago', label: 'MercadoPago' },
    { provider: 'twilio', label: 'Twilio' },
    { provider: 'whatsapp', label: 'WhatsApp Business' },
    { provider: 'slack', label: 'Slack' },
    { provider: 'github', label: 'GitHub' },
  ];
  const states: ExecutionState[] = ['success', 'success', 'success', 'failed', 'retrying'];
  const httpStatuses = [200, 200, 200, 200, 400, 500];

  for (let i = 0; i < count; i++) {
    const { provider, label } = randomChoice(providers);
    const status = randomChoice(httpStatuses);
    webhooks.push({
      id: `wh-${randomId()}`,
      receivedAt: minutesAgo(i * 3 + randomInt(0, 5)),
      provider,
      providerLabel: label,
      endpoint: `/api/webhooks/${provider}`,
      method: 'POST',
      httpStatus: status,
      latencyMs: randomInt(15, 300),
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': `sha256=${randomId()}${randomId()}`,
        'x-request-id': randomId(),
      },
      body: {
        event: randomChoice(['payment.succeeded', 'message.received', 'status.updated']),
        data: {
          id: randomId(),
          amount: randomInt(1000, 50000),
          currency: 'BRL',
          customer: { id: `cust-${randomId()}`, email: 'cliente@example.com' },
        },
        timestamp: Date.now(),
      },
      signatureValid: status < 400,
      signatureHeader: 'x-webhook-signature',
      processingState: status < 400 ? 'success' : randomChoice(states.filter((s) => s !== 'success')),
      retryAttempts: status >= 400 ? randomInt(0, 3) : 0,
      linkedWorkflowId: randomChoice(mockWorkflows.slice(0, 4)).id,
      linkedExecutionId: `exec-${randomId()}`,
      responseBody: status < 400 ? { received: true } : { error: 'Processing failed' },
      processingDiagnostics: status >= 400 ? ['Signature validation failed', 'Retrying in 30s'] : [],
    });
  }

  return webhooks;
};

// -----------------------------------------------------------------------------
// MOCK EXECUTION DETAILS
// -----------------------------------------------------------------------------

const generateExecutionTimeline = (workflowId: string): ExecutionTimeline => {
  const workflow = mockWorkflows.find((w) => w.id === workflowId);
  const nodes = workflow?.nodes || mockNodes['wf-001'];
  let offset = 0;

  return {
    executionId: `exec-${randomId()}`,
    steps: nodes.map((node) => {
      const duration = randomInt(50, 500);
      const step = {
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        state: randomChoice(['success', 'success', 'success', 'failed']) as ExecutionState,
        startOffsetMs: offset,
        durationMs: duration,
        retryCount: randomInt(0, 2),
      };
      offset += duration + randomInt(10, 50);
      return step;
    }),
    totalDurationMs: offset,
  };
};

const generateWorkflowExecution = (workflowId: string): WorkflowExecution => {
  const workflow = mockWorkflows.find((w) => w.id === workflowId) || mockWorkflows[0];
  const nodes = workflow.nodes;
  const states: ExecutionState[] = ['success', 'success', 'success', 'failed'];
  const overallState = randomChoice(states);

  return {
    id: `exec-${randomId()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    workflowVersion: workflow.version,
    correlationId: `corr-${randomId().substring(0, 8)}`,
    state: overallState,
    severity: overallState === 'failed' ? 'critical' : 'info',
    triggerEvent: workflow.triggerLabel,
    triggerSource: 'webhook',
    startedAt: minutesAgo(5),
    completedAt: overallState !== 'running' ? minutesAgo(4) : undefined,
    durationMs: randomInt(200, 1500),
    steps: nodes.map((node, idx) => ({
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      state: idx < nodes.length - 1 ? 'success' : overallState,
      startedAt: minutesAgo(5 - idx * 0.5),
      completedAt: minutesAgo(5 - idx * 0.5 - 0.3),
      durationMs: randomInt(50, 400),
      input: { key: 'value' },
      output: { result: 'processed' },
      retryAttempts: [],
      metadata: { serviceId: 'workflow-engine', workerId: `worker-${randomInt(1, 5)}` },
    })),
    inputPayload: {
      customerId: `cust-${randomId()}`,
      channel: 'whatsapp',
      messageId: `msg-${randomId()}`,
      content: 'Olá, preciso de ajuda com meu pedido',
    },
    outputPayload: {
      routed_to: 'ai_agent',
      ticket_id: `ticket-${randomId()}`,
      response_sent: true,
    },
    metadata: {
      serviceId: 'workflow-engine',
      workerId: `worker-${randomInt(1, 10)}`,
      queueName: 'automations-queue',
      processingTimeMs: randomInt(100, 800),
    },
  };
};

// -----------------------------------------------------------------------------
// API FUNCTIONS
// -----------------------------------------------------------------------------

export async function fetchWorkflows(): Promise<WorkflowDefinition[]> {
  await delay(randomInt(300, 600));
  return mockWorkflows;
}

export async function fetchWorkflowById(id: string): Promise<WorkflowDefinition | null> {
  await delay(randomInt(200, 400));
  return mockWorkflows.find((w) => w.id === id) || null;
}

export async function fetchEventLogs(): Promise<EventLog[]> {
  await delay(randomInt(400, 800));
  return generateEventLogs(50);
}

export async function fetchWebhooks(): Promise<WebhookRequest[]> {
  await delay(randomInt(300, 600));
  return generateWebhooks(30);
}

export async function fetchWebhookById(id: string): Promise<WebhookRequest | null> {
  await delay(randomInt(150, 300));
  const webhooks = generateWebhooks(30);
  return webhooks.find((w) => w.id === id) || webhooks[0];
}

export async function fetchExecutionDetails(executionId: string): Promise<WorkflowExecution> {
  await delay(randomInt(300, 500));
  const workflowId = randomChoice(mockWorkflows).id;
  return generateWorkflowExecution(workflowId);
}

export async function fetchExecutionTimeline(executionId: string): Promise<ExecutionTimeline> {
  await delay(randomInt(200, 400));
  const workflowId = randomChoice(mockWorkflows).id;
  return generateExecutionTimeline(workflowId);
}

// -----------------------------------------------------------------------------
// REALTIME EVENT STREAM SIMULATION
// -----------------------------------------------------------------------------

export function subscribeToEventStream(
  onEvent: (log: EventLog) => void,
  intervalMs = 3000
): () => void {
  const interval = setInterval(() => {
    const logs = generateEventLogs(1);
    if (logs[0]) {
      logs[0].timestamp = formatISODate(new Date());
      onEvent(logs[0]);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

export function subscribeToWebhookStream(
  onWebhook: (webhook: WebhookRequest) => void,
  intervalMs = 5000
): () => void {
  const interval = setInterval(() => {
    const webhooks = generateWebhooks(1);
    if (webhooks[0]) {
      webhooks[0].receivedAt = formatISODate(new Date());
      onWebhook(webhooks[0]);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

// -----------------------------------------------------------------------------
// SIMULATION API
// -----------------------------------------------------------------------------

export async function simulateWorkflowExecution(
  workflowId: string,
  onStepUpdate: (nodeId: string, state: ExecutionState) => void,
  onLog: (message: string) => void
): Promise<void> {
  const workflow = mockWorkflows.find((w) => w.id === workflowId);
  if (!workflow) return;

  onLog(`[${new Date().toISOString()}] Iniciando simulação: ${workflow.name}`);

  for (const node of workflow.nodes) {
    onStepUpdate(node.id, 'running');
    onLog(`[${new Date().toISOString()}] Executando: ${node.label}`);
    await delay(randomInt(500, 1500));

    const success = Math.random() > 0.1;
    onStepUpdate(node.id, success ? 'success' : 'failed');
    onLog(
      `[${new Date().toISOString()}] ${success ? 'Sucesso' : 'Falha'}: ${node.label} (${randomInt(50, 400)}ms)`
    );

    if (!success) {
      onLog(`[${new Date().toISOString()}] Simulação interrompida por falha`);
      return;
    }
  }

  onLog(`[${new Date().toISOString()}] Simulação concluída com sucesso`);
}
