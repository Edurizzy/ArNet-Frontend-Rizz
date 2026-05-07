// =============================================================================
// PHASE 5: EXECUTIVE OPERATIONS DASHBOARD - TYPE SYSTEM
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS & CONSTANTS
// -----------------------------------------------------------------------------

export type SeverityLevel = 'critical' | 'warning' | 'info' | 'success'

export type SystemHealthState = 'healthy' | 'degraded' | 'critical' | 'offline' | 'unknown'

export type TimeRange = 'today' | '7d' | '30d' | 'custom'

export type TrendDirection = 'up' | 'down' | 'stable'

export type WidgetRefreshState = 'idle' | 'loading' | 'refreshing' | 'error' | 'stale'

export type ActivityEventType = 
  | 'sla_breach'
  | 'traffic_spike'
  | 'agent_restart'
  | 'vectorization_complete'
  | 'handoff'
  | 'escalation'
  | 'system_alert'
  | 'deployment'
  | 'queue_overflow'
  | 'ai_fallback'

export type ActivitySourceModule = 
  | 'atendimento'
  | 'crm'
  | 'ai_studio'
  | 'infrastructure'
  | 'billing'
  | 'security'

// -----------------------------------------------------------------------------
// KPI METRICS
// -----------------------------------------------------------------------------

export interface OperationalTrend {
  direction: TrendDirection
  delta: number // percentage change
  period: string // e.g., "vs. ontem", "vs. semana passada"
}

export interface TelemetryPoint {
  timestamp: number
  value: number
}

export interface MetricSparklineData {
  points: TelemetryPoint[]
  min: number
  max: number
  avg: number
}

export interface KpiMetric {
  id: string
  label: string
  value: number
  unit: 'percent' | 'count' | 'seconds' | 'minutes' | 'currency' | 'ratio'
  trend: OperationalTrend
  sparkline?: MetricSparklineData
  threshold?: {
    warning: number
    critical: number
  }
  severity: SeverityLevel
  lastUpdated: number
}

// -----------------------------------------------------------------------------
// HEATMAP DATA
// -----------------------------------------------------------------------------

export interface HeatmapCell {
  dayIndex: number // 0-6 (Dom-Sab)
  hourIndex: number // 0-23
  value: number
  density: 'low' | 'medium' | 'high' | 'critical'
}

export interface HeatmapDensity {
  cells: HeatmapCell[]
  maxValue: number
  minValue: number
  avgValue: number
  totalTickets: number
}

// -----------------------------------------------------------------------------
// ACTIVITY FEED
// -----------------------------------------------------------------------------

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  severity: SeverityLevel
  title: string
  description?: string
  sourceModule: ActivitySourceModule
  timestamp: number
  metadata?: Record<string, unknown>
  ticketId?: string
  agentId?: string
  customerId?: string
  isRead?: boolean
}

// -----------------------------------------------------------------------------
// SYSTEM HEALTH
// -----------------------------------------------------------------------------

export interface SystemComponent {
  id: string
  name: string
  status: SystemHealthState
  latency?: number // ms
  uptime?: number // percentage
  lastCheck: number
  message?: string
}

export interface SystemHealthSnapshot {
  overall: SystemHealthState
  components: SystemComponent[]
  lastUpdated: number
}

// -----------------------------------------------------------------------------
// CHARTS DATA
// -----------------------------------------------------------------------------

export interface SlaDataPoint {
  timestamp: number
  date: string
  responseTime: number // avg response time in seconds
  resolutionTime: number // avg resolution time in minutes
  slaCompliance: number // percentage
  totalTickets: number
}

export interface AiDeflectionDataPoint {
  timestamp: number
  date: string
  resolvedByAi: number
  transferredToHuman: number
  escalated: number
  total: number
  deflectionRate: number // percentage
}

// -----------------------------------------------------------------------------
// REALTIME STATUS
// -----------------------------------------------------------------------------

export interface RealtimeStatus {
  wssConnected: boolean
  lastSync: number
  refreshCadence: number // seconds
  eventIngestionRate: number // events per minute
  pendingEvents: number
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

// -----------------------------------------------------------------------------
// DASHBOARD SNAPSHOT
// -----------------------------------------------------------------------------

export interface DashboardSnapshot {
  kpis: KpiMetric[]
  heatmap: HeatmapDensity
  slaPerformance: SlaDataPoint[]
  aiDeflection: AiDeflectionDataPoint[]
  recentActivity: ActivityEvent[]
  systemHealth: SystemHealthSnapshot
  realtimeStatus: RealtimeStatus
  generatedAt: number
}

// -----------------------------------------------------------------------------
// WIDGET STATE
// -----------------------------------------------------------------------------

export interface WidgetState<T> {
  data: T | null
  state: WidgetRefreshState
  lastUpdated: number | null
  error: string | null
  retryCount: number
}
