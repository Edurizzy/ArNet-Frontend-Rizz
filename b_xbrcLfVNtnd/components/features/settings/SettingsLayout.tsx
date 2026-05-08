'use client'

import { cn } from '@/lib/utils'
import { useSettingsNavigationStore } from '@/stores/settings-store'
import { SettingsSidebar } from './SettingsSidebar'
import { ProfileSettings } from './ProfileSettings'
import { OrganizationProfile } from './OrganizationProfile'
import { TeamManager } from './TeamManager'
import { RolePermissionMatrix } from './RolePermissionMatrix'
import { ApiKeysManager } from './ApiKeysManager'
import { SecurityAuditPanel } from './SecurityAuditPanel'
import { SessionManagementPanel } from './SessionManagementPanel'
import { DangerZonePanel } from './DangerZonePanel'

export function SettingsLayout() {
  const { currentPage, sidebarOpen } = useSettingsNavigationStore()

  // Render current settings page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfileSettings />
      case 'preferences':
        return <div className="p-6 text-zinc-400">Preferências - Em breve</div>
      case 'sessions':
        return <SessionManagementPanel />
      case 'organization':
        return <OrganizationProfile />
      case 'team':
        return <TeamManager />
      case 'billing':
        return <div className="p-6 text-zinc-400">Faturamento - Em breve</div>
      case 'feature-flags':
        return <div className="p-6 text-zinc-400">Feature Flags - Em breve</div>
      case 'api-keys':
        return <ApiKeysManager />
      case 'webhooks':
        return <div className="p-6 text-zinc-400">Webhooks - Em breve</div>
      case 'audit-logs':
        return <SecurityAuditPanel />
      case 'security':
        return <RolePermissionMatrix />
      case 'danger-zone':
        return <DangerZonePanel />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <div className="flex min-h-full bg-zinc-950">
      {/* Settings Sidebar */}
      <div className={cn(
        'border-r border-zinc-800/50 bg-zinc-900/30 transition-all duration-300',
        sidebarOpen ? 'w-80' : 'w-0',
        'shrink-0 overflow-hidden'
      )}>
        <SettingsSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  )
}