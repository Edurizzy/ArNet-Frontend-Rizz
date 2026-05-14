'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import {
  helpdeskSocket,
  type HelpdeskConnectionState,
  type HelpdeskSocketOptions,
} from '@/lib/realtime/helpdesk-socket'
import { useSystemStatusStore } from '@/stores/app-store'
import type { SystemStatus } from '@/types/domain'

function subscribeToSocket(listener: (state: HelpdeskConnectionState) => void) {
  return helpdeskSocket.subscribe(listener)
}

function getSocketSnapshot() {
  return helpdeskSocket.getConnectionState()
}

function getServerSocketSnapshot(): HelpdeskConnectionState {
  return 'disconnected'
}

type UseHelpdeskSocketOptions = HelpdeskSocketOptions & {
  onResync?: (reason: 'visibility' | 'reconnect' | 'manual') => void
}

function mapSocketToSystemWebsocket(state: HelpdeskConnectionState): SystemStatus['websocket'] {
  if (state === 'connected') return 'connected'
  if (state === 'failed') return 'error'
  if (state === 'disconnected') return 'disconnected'
  return 'connecting'
}

export function useHelpdeskSocket(options: UseHelpdeskSocketOptions = {}) {
  const onResyncRef = useRef(options.onResync)

  useEffect(() => {
    onResyncRef.current = options.onResync
  }, [options.onResync])

  // Mirror helpdesk WebSocket state into the global header badge (Zustand).
  useEffect(() => {
    const unsub = helpdeskSocket.subscribe((state) => {
      useSystemStatusStore.setState((prev) => {
        const prevStatus = prev.status
        return {
          status: {
            websocket: mapSocketToSystemWebsocket(state),
            aiAgentsActive: prevStatus?.aiAgentsActive ?? 0,
            aiAgentsTotal: prevStatus?.aiAgentsTotal ?? 0,
            lastSync: new Date(),
          },
          isConnecting: false,
        }
      })
    })

    return () => {
      unsub()
      useSystemStatusStore.setState((prev) => {
        const prevStatus = prev.status
        return {
          status: prevStatus
            ? { ...prevStatus, websocket: 'disconnected', lastSync: new Date() }
            : {
                websocket: 'disconnected',
                aiAgentsActive: 0,
                aiAgentsTotal: 0,
                lastSync: new Date(),
              },
          isConnecting: false,
        }
      })
    }
  }, [])

  const connectionState = useSyncExternalStore(
    subscribeToSocket,
    getSocketSnapshot,
    getServerSocketSnapshot
  )

  useEffect(() => {
    helpdeskSocket.connect(options)

    return () => {
      helpdeskSocket.disconnect()
    }
  }, [
    options.url,
    options.token,
    options.orgId,
    options.maxRetries,
    options.heartbeatIntervalMs,
    options.heartbeatTimeoutMs,
  ])

  useEffect(() => {
    if (!options.onResync) return

    return helpdeskSocket.subscribeResync((reason) => {
      onResyncRef.current?.(reason)
    })
  }, [options.onResync])

  const reconnect = useCallback(() => {
    helpdeskSocket.reconnect()
  }, [])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    reconnect,
  }
}
