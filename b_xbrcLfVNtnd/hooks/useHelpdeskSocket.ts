'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
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

export function useHelpdeskSocket(options: HelpdeskSocketOptions = {}) {
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

  const reconnect = useCallback(() => {
    helpdeskSocket.reconnect()
  }, [])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    reconnect,
  }
}
