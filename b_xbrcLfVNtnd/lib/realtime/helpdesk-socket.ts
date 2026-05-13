import { dispatchHelpdeskSocketEvent } from '@/lib/realtime/event-dispatcher'

export type HelpdeskConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed'

type ConnectionListener = (state: HelpdeskConnectionState) => void

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

const isDevelopment = process.env.NODE_ENV !== 'production'

function devLog(title: string, data?: unknown) {
  if (!isDevelopment) return
  console.groupCollapsed(`[helpdesk:socket] ${title}`)
  if (data !== undefined) console.log(data)
  console.groupEnd()
}

function getBrowserStorageValue(keys: string[]): string | null {
  if (typeof window === 'undefined') return null

  for (const key of keys) {
    const value = window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
    if (value) return value
  }

  return null
}

function resolveToken(token?: string | null): string | null {
  return token ?? getBrowserStorageValue(['access_token', 'accessToken', 'jwt', 'token', 'authToken'])
}

function resolveOrgId(orgId?: string | null): string | null {
  return orgId ?? getBrowserStorageValue(['org_id', 'orgId', 'organization_id', 'organizationId'])
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
  private lastMessageAt = 0
  private intentionalDisconnect = false

  getConnectionState() {
    return this.state
  }

  connect(options: HelpdeskSocketOptions = {}) {
    if (typeof window === 'undefined') return

    this.options = {
      url: options.url ?? this.options.url,
      token: resolveToken(options.token),
      orgId: resolveOrgId(options.orgId),
      maxRetries: options.maxRetries ?? this.options.maxRetries,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? this.options.heartbeatIntervalMs,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? this.options.heartbeatTimeoutMs,
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
      this.setState('connected')
      this.startHeartbeat()
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

  reconnect() {
    this.disconnect({ reconnect: true })
    this.reconnectAttempts = 0
    this.connect(this.options)
  }

  disconnect(config: { reconnect?: boolean } = {}) {
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

  private handleMessage(raw: unknown) {
    if (typeof raw !== 'string') return

    try {
      const payload = JSON.parse(raw) as unknown
      if (this.isHeartbeatPayload(payload)) {
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
    this.reconnectTimer = window.setTimeout(() => this.connect(this.options), delayMs)
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) return
    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
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
