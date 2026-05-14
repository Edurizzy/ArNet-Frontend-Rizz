import { apiClient, ApiClientError } from '@/lib/api-client'

/** Backend `IntegrationProvider.WHATSAPP_CLOUD` — WhatsApp only, no multi-channel UI. */
export const WHATSAPP_CLOUD_PROVIDER = 'whatsapp_cloud' as const

/** Stored under `ConnectedAccount.settings` (JSON). Backend may consume these keys later. */
export const WHATSAPP_SETTINGS_KEYS = {
  companyWhatsappNumber: 'company_whatsapp_number',
  autoGreetingEnabled: 'auto_greeting_enabled',
  autoGreetingMessage: 'auto_greeting_message',
} as const

export const DEFAULT_AUTO_GREETING_MESSAGE =
  'Olá! Você entrou em contato com a ArNet. Em breve um atendente irá responder sua mensagem.'

export interface ConnectedAccountApi {
  id: string
  organization_id: string
  provider: string
  external_id: string
  display_name: string
  settings: Record<string, unknown>
  is_active: boolean
  last_sync_at: string | null
  access_token_hint: string
  refresh_token_hint: string
  webhook_verify_token_hint: string
  created_at: string
  updated_at: string
}

export interface WhatsAppSettingsFormSnapshot {
  id: string | null
  displayName: string
  companyWhatsappNumber: string
  metaPhoneNumberId: string
  webhookVerifyToken: string
  integrationActive: boolean
  autoGreetingEnabled: boolean
  autoGreetingMessage: string
  accessTokenHint: string
  webhookVerifyTokenHint: string
}

export interface SaveWhatsAppSettingsInput {
  id: string | null
  displayName: string
  companyWhatsappNumber: string
  metaPhoneNumberId: string
  /** Empty = leave unchanged on PATCH; required on create. */
  accessToken: string
  /** Empty = omit from PATCH (unchanged). */
  webhookVerifyToken: string
  integrationActive: boolean
  autoGreetingEnabled: boolean
  autoGreetingMessage: string
}

interface PaginatedList<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const LIST_PATH = '/integrations/connected-accounts/'

function isPaginatedAccounts(data: unknown): data is PaginatedList<ConnectedAccountApi> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as PaginatedList<ConnectedAccountApi>).results)
  )
}

function isAccountArray(data: unknown): data is ConnectedAccountApi[] {
  return Array.isArray(data)
}

function extractAccountList(data: unknown): ConnectedAccountApi[] {
  if (isPaginatedAccounts(data)) return data.results
  if (isAccountArray(data)) return data
  return []
}

function readStringSetting(settings: Record<string, unknown>, key: string): string {
  const raw = settings[key]
  return typeof raw === 'string' ? raw : ''
}

function readBoolSetting(settings: Record<string, unknown>, key: string, defaultValue: boolean): boolean {
  const raw = settings[key]
  if (typeof raw === 'boolean') return raw
  return defaultValue
}

export function mapAccountToFormSnapshot(account: ConnectedAccountApi | null): WhatsAppSettingsFormSnapshot {
  const settings = account?.settings ?? {}
  const greeting = readStringSetting(settings, WHATSAPP_SETTINGS_KEYS.autoGreetingMessage)
  return {
    id: account?.id ?? null,
    displayName: account?.display_name ?? '',
    companyWhatsappNumber: readStringSetting(settings, WHATSAPP_SETTINGS_KEYS.companyWhatsappNumber),
    metaPhoneNumberId: account?.external_id ?? '',
    webhookVerifyToken: '',
    integrationActive: account?.is_active ?? true,
    autoGreetingEnabled: readBoolSetting(settings, WHATSAPP_SETTINGS_KEYS.autoGreetingEnabled, false),
    autoGreetingMessage: greeting || DEFAULT_AUTO_GREETING_MESSAGE,
    accessTokenHint: account?.access_token_hint ?? '',
    webhookVerifyTokenHint: account?.webhook_verify_token_hint ?? '',
  }
}

export async function listWhatsAppConnectedAccounts(): Promise<ConnectedAccountApi[]> {
  const { data } = await apiClient.get<unknown>(LIST_PATH)
  return extractAccountList(data).filter((row) => row.provider === WHATSAPP_CLOUD_PROVIDER)
}

export async function getPrimaryWhatsAppAccount(): Promise<ConnectedAccountApi | null> {
  const rows = await listWhatsAppConnectedAccounts()
  if (rows.length === 0) return null
  const active = rows.find((r) => r.is_active)
  return active ?? rows[0] ?? null
}

function buildSettingsPayload(input: SaveWhatsAppSettingsInput): Record<string, unknown> {
  return {
    [WHATSAPP_SETTINGS_KEYS.companyWhatsappNumber]: input.companyWhatsappNumber.trim(),
    [WHATSAPP_SETTINGS_KEYS.autoGreetingEnabled]: input.autoGreetingEnabled,
    [WHATSAPP_SETTINGS_KEYS.autoGreetingMessage]: input.autoGreetingMessage.trim(),
  }
}

function buildCreateBody(input: SaveWhatsAppSettingsInput): Record<string, unknown> {
  const token = input.accessToken.trim()
  const verify = input.webhookVerifyToken.trim()
  if (!input.metaPhoneNumberId.trim()) {
    throw new Error('ID do número de telefone Meta é obrigatório.')
  }
  if (!input.displayName.trim()) {
    throw new Error('Nome de exibição é obrigatório.')
  }
  if (!verify) {
    throw new Error('Token de verificação do webhook é obrigatório na primeira configuração.')
  }
  if (!token) {
    throw new Error('Token de acesso é obrigatório na primeira configuração.')
  }
  return {
    provider: WHATSAPP_CLOUD_PROVIDER,
    external_id: input.metaPhoneNumberId.trim(),
    display_name: input.displayName.trim(),
    webhook_verify_token: verify,
    access_token: token,
    settings: buildSettingsPayload(input),
    is_active: input.integrationActive,
  }
}

function buildPatchBody(input: SaveWhatsAppSettingsInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    external_id: input.metaPhoneNumberId.trim(),
    display_name: input.displayName.trim(),
    settings: buildSettingsPayload(input),
    is_active: input.integrationActive,
  }
  const token = input.accessToken.trim()
  if (token) body.access_token = token
  const verify = input.webhookVerifyToken.trim()
  if (verify) body.webhook_verify_token = verify
  return body
}

export async function saveWhatsAppSettings(input: SaveWhatsAppSettingsInput): Promise<ConnectedAccountApi> {
  if (input.id) {
    const { data } = await apiClient.patch<ConnectedAccountApi>(
      `${LIST_PATH}${input.id}/`,
      buildPatchBody(input)
    )
    return data
  }
  const { data } = await apiClient.post<ConnectedAccountApi>(LIST_PATH, buildCreateBody(input))
  return data
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    const d = error.data
    if (typeof d === 'object' && d !== null) {
      const rec = d as Record<string, unknown>
      const detail = rec.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        return detail
          .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
          .join(' ')
      }
      const firstKey = Object.keys(rec)[0]
      if (firstKey) {
        const v = rec[firstKey]
        if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v.join(' ')
        if (typeof v === 'string') return v
      }
    }
    return `Falha ao salvar (${error.status}).`
  }
  if (error instanceof Error) return error.message
  return 'Erro inesperado ao salvar.'
}
