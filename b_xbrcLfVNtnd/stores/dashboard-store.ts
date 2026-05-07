import { create } from 'zustand'
import type {
  TimeRange,
  KpiMetric,
  HeatmapDensity,
  SlaDataPoint,
  AiDeflectionDataPoint,
  ActivityEvent,
  SystemHealthSnapshot,
  RealtimeStatus,
  WidgetRefreshState,
} from '@/types/dashboard'

// =============================================================================
// UI STATE STORE - Controls dashboard interactions
// =============================================================================

interface DashboardUiState {
  // Time range
  activeTimeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  
  // Widget interactions
  expandedWidgets: Set<string>
  toggleWidgetExpanded: (widgetId: string) => void
  
  // Feed state
  feedPaused: boolean
  setFeedPaused: (paused: boolean) => void
  
  // Selected KPI focus
  focusedKpiId: string | null
  setFocusedKpi: (kpiId: string | null) => void
  
  // Chart interactions
  hoveredChartPoint: { chartId: string; index: number } | null
  setHoveredChartPoint: (point: { chartId: string; index: number } | null) => void
  
  // Panel states
  healthPanelExpanded: boolean
  setHealthPanelExpanded: (expanded: boolean) => void
}

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  activeTimeRange: 'today',
  setTimeRange: (range) => set({ activeTimeRange: range }),
  
  expandedWidgets: new Set(),
  toggleWidgetExpanded: (widgetId) => set((state) => {
    const newSet = new Set(state.expandedWidgets)
    if (newSet.has(widgetId)) {
      newSet.delete(widgetId)
    } else {
      newSet.add(widgetId)
    }
    return { expandedWidgets: newSet }
  }),
  
  feedPaused: false,
  setFeedPaused: (paused) => set({ feedPaused: paused }),
  
  focusedKpiId: null,
  setFocusedKpi: (kpiId) => set({ focusedKpiId: kpiId }),
  
  hoveredChartPoint: null,
  setHoveredChartPoint: (point) => set({ hoveredChartPoint: point }),
  
  healthPanelExpanded: false,
  setHealthPanelExpanded: (expanded) => set({ healthPanelExpanded: expanded }),
}))

// =============================================================================
// KPI DATA STORE
// =============================================================================

interface KpiDataState {
  kpis: KpiMetric[]
  state: WidgetRefreshState
  lastUpdated: number | null
  setKpis: (kpis: KpiMetric[]) => void
  setState: (state: WidgetRefreshState) => void
  updateKpi: (kpiId: string, updates: Partial<KpiMetric>) => void
}

export const useKpiDataStore = create<KpiDataState>((set) => ({
  kpis: [],
  state: 'idle',
  lastUpdated: null,
  setKpis: (kpis) => set({ kpis, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
  updateKpi: (kpiId, updates) => set((state) => ({
    kpis: state.kpis.map((kpi) => 
      kpi.id === kpiId ? { ...kpi, ...updates } : kpi
    ),
  })),
}))

// =============================================================================
// HEATMAP DATA STORE
// =============================================================================

interface HeatmapDataState {
  heatmap: HeatmapDensity | null
  state: WidgetRefreshState
  lastUpdated: number | null
  setHeatmap: (heatmap: HeatmapDensity) => void
  setState: (state: WidgetRefreshState) => void
}

export const useHeatmapDataStore = create<HeatmapDataState>((set) => ({
  heatmap: null,
  state: 'idle',
  lastUpdated: null,
  setHeatmap: (heatmap) => set({ heatmap, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
}))

// =============================================================================
// SLA PERFORMANCE DATA STORE
// =============================================================================

interface SlaDataState {
  data: SlaDataPoint[]
  state: WidgetRefreshState
  lastUpdated: number | null
  setData: (data: SlaDataPoint[]) => void
  setState: (state: WidgetRefreshState) => void
}

export const useSlaDataStore = create<SlaDataState>((set) => ({
  data: [],
  state: 'idle',
  lastUpdated: null,
  setData: (data) => set({ data, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
}))

// =============================================================================
// AI DEFLECTION DATA STORE
// =============================================================================

interface AiDeflectionDataState {
  data: AiDeflectionDataPoint[]
  state: WidgetRefreshState
  lastUpdated: number | null
  setData: (data: AiDeflectionDataPoint[]) => void
  setState: (state: WidgetRefreshState) => void
}

export const useAiDeflectionDataStore = create<AiDeflectionDataState>((set) => ({
  data: [],
  state: 'idle',
  lastUpdated: null,
  setData: (data) => set({ data, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
}))

// =============================================================================
// ACTIVITY FEED DATA STORE
// =============================================================================

interface ActivityFeedState {
  events: ActivityEvent[]
  state: WidgetRefreshState
  lastUpdated: number | null
  maxEvents: number
  addEvent: (event: ActivityEvent) => void
  addEvents: (events: ActivityEvent[]) => void
  setEvents: (events: ActivityEvent[]) => void
  setState: (state: WidgetRefreshState) => void
  markAsRead: (eventId: string) => void
  clearAll: () => void
}

export const useActivityFeedStore = create<ActivityFeedState>((set) => ({
  events: [],
  state: 'idle',
  lastUpdated: null,
  maxEvents: 100,
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, state.maxEvents),
    lastUpdated: Date.now(),
  })),
  addEvents: (events) => set((state) => ({
    events: [...events, ...state.events].slice(0, state.maxEvents),
    lastUpdated: Date.now(),
  })),
  setEvents: (events) => set({ events, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
  markAsRead: (eventId) => set((state) => ({
    events: state.events.map((e) => 
      e.id === eventId ? { ...e, isRead: true } : e
    ),
  })),
  clearAll: () => set({ events: [] }),
}))

// =============================================================================
// SYSTEM HEALTH DATA STORE
// =============================================================================

interface SystemHealthDataState {
  health: SystemHealthSnapshot | null
  state: WidgetRefreshState
  lastUpdated: number | null
  setHealth: (health: SystemHealthSnapshot) => void
  setState: (state: WidgetRefreshState) => void
}

export const useSystemHealthStore = create<SystemHealthDataState>((set) => ({
  health: null,
  state: 'idle',
  lastUpdated: null,
  setHealth: (health) => set({ health, lastUpdated: Date.now(), state: 'idle' }),
  setState: (state) => set({ state }),
}))

// =============================================================================
// REALTIME STATUS STORE
// =============================================================================

interface RealtimeStatusState {
  status: RealtimeStatus | null
  setStatus: (status: RealtimeStatus) => void
  updateConnectionState: (connected: boolean) => void
}

export const useRealtimeStatusStore = create<RealtimeStatusState>((set) => ({
  status: null,
  setStatus: (status) => set({ status }),
  updateConnectionState: (connected) => set((state) => ({
    status: state.status ? { ...state.status, wssConnected: connected, lastSync: Date.now() } : null,
  })),
}))
