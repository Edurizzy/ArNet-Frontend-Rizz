'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import {
  helpdeskSocket,
  type HelpdeskConnectionState,
  type HelpdeskSocketOptions,
} from '@/lib/realtime/helpdesk-socket'

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

export function useHelpdeskSocket(options: UseHelpdeskSocketOptions = {}) {
  const onResyncRef = useRef(options.onResync)

  useEffect(() => {
    onResyncRef.current = options.onResync
  }, [options.onResync])

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
