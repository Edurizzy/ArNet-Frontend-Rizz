import type {
  KpiMetric,
  HeatmapDensity,
  HeatmapCell,
  SlaDataPoint,
  AiDeflectionDataPoint,
  ActivityEvent,
  SystemHealthSnapshot,
  RealtimeStatus,
  DashboardSnapshot,
  TimeRange,
  ActivityEventType,
  ActivitySourceModule,
  SeverityLevel,
} from '@/types/dashboard'

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSparklineData(points: number, min: number, max: number) {
  const data = []
  let value = randomBetween(min, max)
  const now = Date.now()
  
  for (let i = 0; i < points; i++) {
    value = Math.max(min, Math.min(max, value + randomBetween(-5, 5)))
    data.push({
      timestamp: now - (points - i) * 60000,
      value,
    })
  }
  
  const values = data.map((d) => d.value)
  return {
    points: data,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }
}

// =============================================================================
// KPI METRICS
// =============================================================================

export async function fetchKpiMetrics(timeRange: TimeRange): Promise<KpiMetric[]> {
  await delay(randomBetween(300, 600))
  
  const now = Date.now()
  
  return [
    {
      id: 'ai-resolution-rate',
      label: 'Taxa de Resolução IA',
      value: 73.4,
      unit: 'percent',
      trend: { direction: 'up', delta: 5.2, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 65, 80),
      threshold: { warning: 60, critical: 40 },
      severity: 'success',
      lastUpdated: now,
    },
    {
      id: 'avg-wait-time',
      label: 'Tempo Médio de Espera',
      value: 2.4,
      unit: 'minutes',
      trend: { direction: 'down', delta: 12.3, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 1, 5),
      threshold: { warning: 5, critical: 10 },
      severity: 'success',
      lastUpdated: now,
    },
    {
      id: 'active-tickets',
      label: 'Tickets Ativos',
      value: 847,
      unit: 'count',
      trend: { direction: 'up', delta: 8.7, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 600, 1000),
      threshold: { warning: 1000, critical: 1500 },
      severity: 'info',
      lastUpdated: now,
    },
    {
      id: 'csat-avg',
      label: 'CSAT Médio',
      value: 4.6,
      unit: 'ratio',
      trend: { direction: 'stable', delta: 0.1, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 4, 5),
      threshold: { warning: 4.0, critical: 3.5 },
      severity: 'success',
      lastUpdated: now,
    },
    {
      id: 'sla-compliance',
      label: 'SLA Compliance',
      value: 94.2,
      unit: 'percent',
      trend: { direction: 'down', delta: 2.1, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 88, 98),
      threshold: { warning: 90, critical: 80 },
      severity: 'warning',
      lastUpdated: now,
    },
    {
      id: 'throughput',
      label: 'Throughput Operacional',
      value: 342,
      unit: 'count',
      trend: { direction: 'up', delta: 15.4, period: 'vs. ontem' },
      sparkline: generateSparklineData(24, 250, 400),
      severity: 'success',
      lastUpdated: now,
    },
  ]
}

// =============================================================================
// HEATMAP DATA
// =============================================================================

export async function fetchHeatmapData(timeRange: TimeRange): Promise<HeatmapDensity> {
  await delay(randomBetween(400, 800))
  
  const cells: HeatmapCell[] = []
  let maxValue = 0
  let minValue = Infinity
  let total = 0
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Simulate realistic patterns - more tickets during work hours
      let baseValue = 10
      if (hour >= 9 && hour <= 18) baseValue = 60
      if (hour >= 12 && hour <= 14) baseValue = 80
      if (day === 0 || day === 6) baseValue = baseValue * 0.3 // weekends
      
      const value = Math.max(0, baseValue + randomBetween(-20, 30))
      maxValue = Math.max(maxValue, value)
      minValue = Math.min(minValue, value)
      total += value
      
      let density: HeatmapCell['density'] = 'low'
      if (value > 70) density = 'critical'
      else if (value > 50) density = 'high'
      else if (value > 25) density = 'medium'
      
      cells.push({
        dayIndex: day,
        hourIndex: hour,
        value,
        density,
      })
    }
  }
  
  return {
    cells,
    maxValue,
    minValue,
    avgValue: total / cells.length,
    totalTickets: total,
  }
}

// =============================================================================
// SLA PERFORMANCE DATA
// =============================================================================

export async function fetchSlaPerformanceData(timeRange: TimeRange): Promise<SlaDataPoint[]> {
  await delay(randomBetween(350, 700))
  
  const days = timeRange === 'today' ? 24 : timeRange === '7d' ? 7 : 30
  const data: SlaDataPoint[] = []
  const now = Date.now()
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - i * (timeRange === 'today' ? 3600000 : 86400000)
    const date = new Date(timestamp)
    const dateStr = timeRange === 'today' 
      ? `${date.getHours()}:00`
      : `${date.getDate()}/${date.getMonth() + 1}`
    
    data.push({
      timestamp,
      date: dateStr,
      responseTime: randomBetween(15, 45),
      resolutionTime: randomBetween(8, 25),
      slaCompliance: randomBetween(88, 98),
      totalTickets: randomBetween(80, 200),
    })
  }
  
  return data
}

// =============================================================================
// AI DEFLECTION DATA
// =============================================================================

export async function fetchAiDeflectionData(timeRange: TimeRange): Promise<AiDeflectionDataPoint[]> {
  await delay(randomBetween(300, 650))
  
  const days = timeRange === 'today' ? 24 : timeRange === '7d' ? 7 : 30
  const data: AiDeflectionDataPoint[] = []
  const now = Date.now()
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - i * (timeRange === 'today' ? 3600000 : 86400000)
    const date = new Date(timestamp)
    const dateStr = timeRange === 'today' 
      ? `${date.getHours()}:00`
      : `${date.getDate()}/${date.getMonth() + 1}`
    
    const total = randomBetween(100, 250)
    const resolvedByAi = Math.floor(total * (randomBetween(60, 80) / 100))
    const escalated = Math.floor((total - resolvedByAi) * 0.2)
    const transferredToHuman = total - resolvedByAi - escalated
    
    data.push({
      timestamp,
      date: dateStr,
      resolvedByAi,
      transferredToHuman,
      escalated,
      total,
      deflectionRate: (resolvedByAi / total) * 100,
    })
  }
  
  return data
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

const eventTemplates: Array<{
  type: ActivityEventType
  title: string
  severity: SeverityLevel
  source: ActivitySourceModule
}> = [
  { type: 'sla_breach', title: 'SLA Rompido: Ticket #{id}', severity: 'critical', source: 'atendimento' },
  { type: 'traffic_spike', title: 'Pico de acesso detectado', severity: 'warning', source: 'infrastructure' },
  { type: 'agent_restart', title: 'Agente {agent} reiniciado', severity: 'info', source: 'ai_studio' },
  { type: 'vectorization_complete', title: 'Vetorização concluída: {doc}', severity: 'success', source: 'ai_studio' },
  { type: 'handoff', title: 'Handoff IA → Humano', severity: 'info', source: 'atendimento' },
  { type: 'escalation', title: 'Escalação: Ticket #{id}', severity: 'warning', source: 'atendimento' },
  { type: 'system_alert', title: 'Latência elevada no {service}', severity: 'warning', source: 'infrastructure' },
  { type: 'deployment', title: 'Deploy concluído: {version}', severity: 'success', source: 'infrastructure' },
  { type: 'queue_overflow', title: 'Fila {queue} acima do limite', severity: 'critical', source: 'atendimento' },
  { type: 'ai_fallback', title: 'IA sem resposta, fallback ativado', severity: 'warning', source: 'ai_studio' },
]

const agentNames = ['Financeiro', 'Suporte Técnico', 'Vendas', 'Cobrança', 'Retenção']
const docNames = ['FAQ Atualizado', 'Manual v2.3', 'Base de Conhecimento', 'Políticas 2024']
const serviceNames = ['API Gateway', 'Vector DB', 'Redis Cluster', 'Inference Engine']
const queueNames = ['Atendimento', 'Cobrança', 'Suporte N2', 'Escalações']

function generateActivityEvent(): ActivityEvent {
  const template = eventTemplates[randomBetween(0, eventTemplates.length - 1)]
  const id = `evt-${Date.now()}-${randomBetween(1000, 9999)}`
  
  let title = template.title
  title = title.replace('{id}', String(randomBetween(1000, 9999)))
  title = title.replace('{agent}', agentNames[randomBetween(0, agentNames.length - 1)])
  title = title.replace('{doc}', docNames[randomBetween(0, docNames.length - 1)])
  title = title.replace('{service}', serviceNames[randomBetween(0, serviceNames.length - 1)])
  title = title.replace('{queue}', queueNames[randomBetween(0, queueNames.length - 1)])
  title = title.replace('{version}', `v${randomBetween(1, 3)}.${randomBetween(0, 9)}.${randomBetween(0, 99)}`)
  
  return {
    id,
    type: template.type,
    severity: template.severity,
    title,
    sourceModule: template.source,
    timestamp: Date.now() - randomBetween(0, 3600000),
    isRead: false,
  }
}

export async function fetchRecentActivity(limit: number = 20): Promise<ActivityEvent[]> {
  await delay(randomBetween(200, 500))
  
  const events: ActivityEvent[] = []
  for (let i = 0; i < limit; i++) {
    events.push(generateActivityEvent())
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp)
}

export function subscribeToActivityStream(
  onEvent: (event: ActivityEvent) => void,
  interval: number = 5000
): () => void {
  const id = setInterval(() => {
    if (Math.random() > 0.4) {
      onEvent(generateActivityEvent())
    }
  }, interval)
  
  return () => clearInterval(id)
}

// =============================================================================
// SYSTEM HEALTH
// =============================================================================

export async function fetchSystemHealth(): Promise<SystemHealthSnapshot> {
  await delay(randomBetween(250, 500))
  
  const components = [
    { id: 'wss', name: 'WebSocket Gateway', baseStatus: 'healthy' as const },
    { id: 'ai-inference', name: 'AI Inference Engine', baseStatus: 'healthy' as const },
    { id: 'queue-processor', name: 'Queue Processor', baseStatus: 'healthy' as const },
    { id: 'background-workers', name: 'Background Workers', baseStatus: 'healthy' as const },
    { id: 'vector-db', name: 'Vector Database', baseStatus: 'healthy' as const },
    { id: 'redis', name: 'Redis Cluster', baseStatus: 'healthy' as const },
    { id: 'postgres', name: 'PostgreSQL Primary', baseStatus: 'healthy' as const },
    { id: 'cdn', name: 'CDN Edge', baseStatus: 'healthy' as const },
  ]
  
  const now = Date.now()
  const healthComponents = components.map((c) => {
    // Randomly degrade some services
    const rand = Math.random()
    let status = c.baseStatus
    let message: string | undefined
    
    if (rand > 0.95) {
      status = 'critical'
      message = 'Service unresponsive'
    } else if (rand > 0.9) {
      status = 'degraded'
      message = 'High latency detected'
    }
    
    return {
      id: c.id,
      name: c.name,
      status,
      latency: randomBetween(5, status === 'degraded' ? 500 : 100),
      uptime: status === 'critical' ? randomBetween(95, 98) : randomBetween(99, 100),
      lastCheck: now,
      message,
    }
  })
  
  const criticalCount = healthComponents.filter((c) => c.status === 'critical').length
  const degradedCount = healthComponents.filter((c) => c.status === 'degraded').length
  
  let overall: SystemHealthSnapshot['overall'] = 'healthy'
  if (criticalCount > 0) overall = 'critical'
  else if (degradedCount > 1) overall = 'degraded'
  
  return {
    overall,
    components: healthComponents,
    lastUpdated: now,
  }
}

// =============================================================================
// REALTIME STATUS
// =============================================================================

export async function fetchRealtimeStatus(): Promise<RealtimeStatus> {
  await delay(randomBetween(100, 200))
  
  return {
    wssConnected: Math.random() > 0.05,
    lastSync: Date.now(),
    refreshCadence: 30,
    eventIngestionRate: randomBetween(120, 280),
    pendingEvents: randomBetween(0, 15),
    connectionQuality: Math.random() > 0.9 ? 'fair' : Math.random() > 0.7 ? 'good' : 'excellent',
  }
}

// =============================================================================
// FULL DASHBOARD SNAPSHOT
// =============================================================================

export async function fetchDashboardSnapshot(timeRange: TimeRange): Promise<DashboardSnapshot> {
  const [kpis, heatmap, slaPerformance, aiDeflection, recentActivity, systemHealth, realtimeStatus] = 
    await Promise.all([
      fetchKpiMetrics(timeRange),
      fetchHeatmapData(timeRange),
      fetchSlaPerformanceData(timeRange),
      fetchAiDeflectionData(timeRange),
      fetchRecentActivity(20),
      fetchSystemHealth(),
      fetchRealtimeStatus(),
    ])
  
  return {
    kpis,
    heatmap,
    slaPerformance,
    aiDeflection,
    recentActivity,
    systemHealth,
    realtimeStatus,
    generatedAt: Date.now(),
  }
}
