'use client'

import { dispatchHelpdeskSocketEvent } from '@/lib/realtime/event-dispatcher'
import { useAuthStore } from '@/stores/useAuthStore'

export type HelpdeskConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed'

type ConnectionListener = (state: HelpdeskConnectionState) => void
type ResyncListener = (reason: 'visibility' | 'reconnect' | 'manual') => void

export interface HelpdeskSocketOptions {
  url?: string
  token?: string | null
  orgId?: string | null
  maxRetries?: number
  heartbeatIntervalMs?: number
  heartbeatTimeoutMs?: number
}

const DEFAULT_SOCKET_URL = 'ws://127.0.0.1:8000/ws/v1/helpdesk/'
const DEFAULT_MAX_RETRIES = 8
const DEFAULT_HEARTBEAT_INTERVAL_MS = 25_000
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 60_000
const STRICT_MODE_DISCONNECT_GRACE_MS = 1_000
const RESYNC_DEBOUNCE_MS = 750

const isDevelopment = process.env.NODE_ENV !== 'production'

function devLog(title: string, data?: unknown) {
  if (!isDevelopment) return
  console.groupCollapsed(`[helpdesk:socket] ${title}`)
  if (data !== undefined) console.log(data)
  console.groupEnd()
}

function resolveToken(token?: string | null): string | null {
  return token ?? useAuthStore.getState().accessToken
}

function resolveOrgId(orgId?: string | null): string | null {
  return orgId ?? useAuthStore.getState().user?.organizationId ?? null
}

function buildSocketUrl(baseUrl: string, token: string | null): string {
  if (!token) return baseUrl

  const url = new URL(baseUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

class HelpdeskSocketManager {
  private socket: WebSocket | null = null
  private state: HelpdeskConnectionState = 'disconnected'
  private listeners = new Set<ConnectionListener>()
  private resyncListeners = new Set<ResyncListener>()
  private options: Required<Omit<HelpdeskSocketOptions, 'token' | 'orgId'>> & {
    token: string | null
    orgId: string | null
  } = {
    url: DEFAULT_SOCKET_URL,
    token: null,
    orgId: null,
    maxRetries: DEFAULT_MAX_RETRIES,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    heartbeatTimeoutMs: DEFAULT_HEARTBEAT_TIMEOUT_MS,
  }
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private disconnectTimer: number | null = null
  private resyncTimer: number | null = null
  private lastMessageAt = 0
  private lastPongAt = 0
  private activeLeases = 0
  private hasVisibilityListener = false
  private intentionalDisconnect = false

  getConnectionState() {
    return this.state
  }

  connect(options: HelpdeskSocketOptions = {}) {
    if (typeof window === 'undefined') return

    this.activeLeases += 1
    this.clearDisconnectTimer()
    this.ensureVisibilityListener()
    this.ensureConnected(options)
  }

  private ensureConnected(options: HelpdeskSocketOptions = {}) {
    this.options = {
      url: options.url ?? this.options.url,
      token: resolveToken(options.token),
      orgId: resolveOrgId(options.orgId),
      maxRetries: options.maxRetries ?? this.options.maxRetries,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? this.options.heartbeatIntervalMs,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? this.options.heartbeatTimeoutMs,
    }

    if (!this.options.token) {
      this.setState('disconnected')
      devLog('connect skipped: missing access token')
      return
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      devLog('connect skipped: active socket already exists', { state: this.state })
      return
    }

    this.intentionalDisconnect = false
    this.clearReconnectTimer()
    this.setState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    const socketUrl = buildSocketUrl(this.options.url, this.options.token)
    this.socket = new WebSocket(socketUrl)
    this.lastMessageAt = Date.now()

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.lastMessageAt = Date.now()
      this.lastPongAt = Date.now()
      this.setState('connected')
      this.startHeartbeat()
      this.requestResync('reconnect')
      devLog('connected', { url: this.options.url, orgId: this.options.orgId })
    }

    this.socket.onmessage = (event) => {
      this.lastMessageAt = Date.now()
      this.handleMessage(event.data)
    }

    this.socket.onerror = () => {
      devLog('socket error')
    }

    this.socket.onclose = (event) => {
      this.stopHeartbeat()
      this.socket = null
      devLog('closed', { code: event.code, reason: event.reason, intentional: this.intentionalDisconnect })

      if (this.intentionalDisconnect) {
        this.setState('disconnected')
        return
      }

      this.scheduleReconnect()
    }
  }

  reconnect(reason: 'visibility' | 'manual' = 'manual') {
    this.closeSocket({ reconnect: true })
    this.reconnectAttempts = 0
    this.ensureConnected(this.options)
    this.requestResync(reason)
  }

  reconnectWithLatestAuth(reason: 'visibility' | 'manual' = 'manual') {
    if (this.activeLeases === 0 && !this.socket) return
    this.closeSocket({ reconnect: true })
    this.reconnectAttempts = 0
    this.ensureConnected({
      ...this.options,
      token: useAuthStore.getState().accessToken,
      orgId: useAuthStore.getState().user?.organizationId ?? null,
    })
    this.requestResync(reason)
  }

  forceDisconnect() {
    this.activeLeases = 0
    this.closeSocket()
  }

  disconnect(config: { reconnect?: boolean } = {}) {
    this.activeLeases = Math.max(0, this.activeLeases - 1)
    if (config.reconnect) {
      this.closeSocket(config)
      return
    }

    if (this.activeLeases > 0) return

    this.clearDisconnectTimer()
    this.disconnectTimer = window.setTimeout(() => {
      if (this.activeLeases > 0) return
      this.closeSocket()
    }, STRICT_MODE_DISCONNECT_GRACE_MS)
  }

  private closeSocket(config: { reconnect?: boolean } = {}) {
    this.intentionalDisconnect = !config.reconnect
    this.clearReconnectTimer()
    this.stopHeartbeat()

    if (!this.socket) {
      this.setState('disconnected')
      return
    }

    this.socket.onopen = null
    this.socket.onmessage = null
    this.socket.onerror = null
    this.socket.onclose = null
    this.socket.close(1000, 'client_disconnect')
    this.socket = null
    this.setState('disconnected')
  }

  send(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      devLog('send skipped: socket not connected', payload)
      return false
    }

    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload)
    this.socket.send(serialized)
    devLog('outbound event', payload)
    return true
  }

  subscribe(listener: ConnectionListener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.unsubscribe(listener)
  }

  unsubscribe(listener: ConnectionListener) {
    this.listeners.delete(listener)
  }

  subscribeResync(listener: ResyncListener) {
    this.resyncListeners.add(listener)
    return () => {
      this.resyncListeners.delete(listener)
    }
  }

  isStale() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return true
    return Date.now() - this.lastMessageAt > this.options.heartbeatTimeoutMs
  }

  private handleMessage(raw: unknown) {
    if (typeof raw !== 'string') return

    try {
      const payload = JSON.parse(raw) as unknown
      if (this.isHeartbeatPayload(payload)) {
        this.lastPongAt = Date.now()
        if (this.isPingPayload(payload)) this.send({ type: 'pong' })
        return
      }

      dispatchHelpdeskSocketEvent(payload, { currentOrgId: this.options.orgId })
    } catch (error) {
      devLog('malformed inbound payload ignored', { raw, error })
    }
  }

  private isHeartbeatPayload(payload: unknown) {
    if (!payload || typeof payload !== 'object') return false
    const type = 'type' in payload ? payload.type : undefined
    const event = 'event' in payload ? payload.event : undefined
    return type === 'ping' || type === 'pong' || event === 'ping' || event === 'pong'
  }

  private isPingPayload(payload: unknown) {
    if (!payload || typeof payload !== 'object') return false
    const type = 'type' in payload ? payload.type : undefined
    const event = 'event' in payload ? payload.event : undefined
    return type === 'ping' || event === 'ping'
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      const ageMs = Date.now() - this.lastMessageAt

      if (ageMs > this.options.heartbeatTimeoutMs) {
        devLog('heartbeat timeout; closing stale socket', { ageMs })
        this.socket?.close(4000, 'heartbeat_timeout')
        return
      }

      this.send({ type: 'ping', ts: Date.now() })
    }, this.options.heartbeatIntervalMs)
  }

  private stopHeartbeat() {
    if (!this.heartbeatTimer) return
    window.clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  private scheduleReconnect() {
    this.clearReconnectTimer()
    if (this.intentionalDisconnect || this.activeLeases === 0) return

    if (this.reconnectAttempts >= this.options.maxRetries) {
      this.setState('failed')
      devLog('reconnect failed: max retries reached', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectAttempts += 1
    this.setState('reconnecting')

    const exponentialDelay = Math.min(30_000, 1_000 * 2 ** (this.reconnectAttempts - 1))
    const jitter = Math.floor(Math.random() * 500)
    const delayMs = exponentialDelay + jitter

    devLog('reconnect scheduled', { attempt: this.reconnectAttempts, delayMs })
    this.reconnectTimer = window.setTimeout(() => this.ensureConnected(this.options), delayMs)
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) return
    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private clearDisconnectTimer() {
    if (!this.disconnectTimer) return
    window.clearTimeout(this.disconnectTimer)
    this.disconnectTimer = null
  }

  private ensureVisibilityListener() {
    if (this.hasVisibilityListener || typeof document === 'undefined') return

    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    this.hasVisibilityListener = true
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return
    if (this.activeLeases === 0) return

    const stale = this.isStale()
    devLog(stale ? 'visible tab found stale socket' : 'visible tab socket healthy', {
      state: this.state,
      ageMs: Date.now() - this.lastMessageAt,
      lastPongAgeMs: Date.now() - this.lastPongAt,
    })

    if (stale || this.state === 'disconnected' || this.state === 'failed') {
      this.reconnect('visibility')
      return
    }

    this.requestResync('visibility')
  }

  private handleOnline = () => {
    devLog('browser online; validating socket')
    if (this.activeLeases > 0) this.reconnect('visibility')
  }

  private handleOffline = () => {
    devLog('browser offline')
    this.setState('disconnected')
  }

  private requestResync(reason: 'visibility' | 'reconnect' | 'manual') {
    if (this.resyncTimer) return

    this.resyncTimer = window.setTimeout(() => {
      this.resyncTimer = null
      devLog('resync requested', { reason, listeners: this.resyncListeners.size })
      this.resyncListeners.forEach((listener) => listener(reason))
    }, RESYNC_DEBOUNCE_MS)
  }

  private setState(nextState: HelpdeskConnectionState) {
    if (this.state === nextState) return
    this.state = nextState
    this.listeners.forEach((listener) => listener(nextState))
    devLog(`state: ${nextState}`)
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __helpdeskSocketManager: HelpdeskSocketManager | undefined
}

export const helpdeskSocket =
  globalThis.__helpdeskSocketManager ?? new HelpdeskSocketManager()

globalThis.__helpdeskSocketManager = helpdeskSocket
