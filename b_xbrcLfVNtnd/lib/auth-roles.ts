/**
 * Roles allowed to manage organization-wide WhatsApp integration (self-service).
 * Matches product expectation: Admin / Manager — not agents.
 * Values are normalized to lowercase for comparison with JWT-backed `AuthUser.role`.
 */
const WHATSAPP_SETTINGS_MANAGER_ROLES = new Set(['admin', 'super_admin', 'manager', 'owner'])

export function canManageWhatsAppIntegration(role: string | undefined | null): boolean {
  if (!role || typeof role !== 'string') return false
  return WHATSAPP_SETTINGS_MANAGER_ROLES.has(role.trim().toLowerCase())
}
