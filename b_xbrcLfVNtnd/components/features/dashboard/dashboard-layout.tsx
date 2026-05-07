'use client'

import { useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { KpiGrid } from './kpi-grid'
import { SlaPerformanceChart } from './sla-performance-chart'
import { AiDeflectionChart } from './ai-deflection-chart'
import { OperationalHeatmap } from './operational-heatmap'
import { LiveActivityFeed } from './live-activity-feed'
import { SystemHealthPanel } from './system-health-panel'
import { RealtimeStatusBar } from './realtime-status-bar'
import { 
  useDashboardUiStore,
  useKpiDataStore,
  useHeatmapDataStore,
  useSlaDataStore,
  useAiDeflectionDataStore,
  useActivityFeedStore,
  useSystemHealthStore,
  useRealtimeStatusStore,
} from '@/stores/dashboard-store'
import {
  fetchKpiMetrics,
  fetchHeatmapData,
  fetchSlaPerformanceData,
  fetchAiDeflectionData,
  fetchRecentActivity,
  fetchSystemHealth,
  fetchRealtimeStatus,
  subscribeToActivityStream,
} from '@/services/dashboard-api'

export function DashboardLayout() {
  const { activeTimeRange, feedPaused } = useDashboardUiStore()
  const { setKpis, setState: setKpiState } = useKpiDataStore()
  const { setHeatmap, setState: setHeatmapState } = useHeatmapDataStore()
  const { setData: setSlaData, setState: setSlaState } = useSlaDataStore()
  const { setData: setAiData, setState: setAiState } = useAiDeflectionDataStore()
  const { setEvents, addEvent, setState: setFeedState } = useActivityFeedStore()
  const { setHealth, setState: setHealthState } = useSystemHealthStore()
  const { setStatus } = useRealtimeStatusStore()

  // Load all dashboard data with staggered loading
  useEffect(() => {
    const loadData = async () => {
      // KPIs first (highest priority)
      setKpiState('loading')
      fetchKpiMetrics(activeTimeRange).then((data) => {
        setKpis(data)
      })

      // System health (critical infrastructure)
      setHealthState('loading')
      fetchSystemHealth().then((data) => {
        setHealth(data)
      })

      // Realtime status
      fetchRealtimeStatus().then((data) => {
        setStatus(data)
      })

      // Activity feed
      setFeedState('loading')
      fetchRecentActivity(20).then((data) => {
        setEvents(data)
      })

      // Charts (can load slightly later)
      setTimeout(() => {
        setSlaState('loading')
        fetchSlaPerformanceData(activeTimeRange).then((data) => {
          setSlaData(data)
        })
      }, 100)

      setTimeout(() => {
        setAiState('loading')
        fetchAiDeflectionData(activeTimeRange).then((data) => {
          setAiData(data)
        })
      }, 200)

      // Heatmap (can load last)
      setTimeout(() => {
        setHeatmapState('loading')
        fetchHeatmapData(activeTimeRange).then((data) => {
          setHeatmap(data)
        })
      }, 300)
    }

    loadData()
  }, [activeTimeRange])

  // Subscribe to realtime events
  useEffect(() => {
    if (feedPaused) return

    const unsubscribe = subscribeToActivityStream((event) => {
      addEvent(event)
    }, 4000)

    return unsubscribe
  }, [feedPaused, addEvent])

  // Periodic health checks
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemHealth().then(setHealth)
      fetchRealtimeStatus().then(setStatus)
    }, 30000)

    return () => clearInterval(interval)
  }, [setHealth, setStatus])

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-[1800px] space-y-4">
          {/* KPI Grid */}
          <KpiGrid />
          
          {/* Main Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SlaPerformanceChart />
            <AiDeflectionChart />
          </div>
          
          {/* Secondary Row - Heatmap + Activity Feed */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OperationalHeatmap />
            </div>
            <div className="lg:col-span-1">
              <LiveActivityFeed />
            </div>
          </div>
          
          {/* System Health Panel */}
          <SystemHealthPanel />
        </div>
      </div>
      
      {/* Realtime Status Bar - Fixed at bottom */}
      <RealtimeStatusBar />
    </div>
  )
}
