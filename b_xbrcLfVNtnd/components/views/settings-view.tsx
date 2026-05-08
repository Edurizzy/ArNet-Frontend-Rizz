'use client'

import { useEffect } from 'react'
import { SettingsLayout } from '@/components/features/settings'
import { useSettingsStoreReset } from '@/stores/settings-store'

export function SettingsView() {
  const resetAllStores = useSettingsStoreReset()

  // Cleanup stores when unmounting (when navigating away from settings)
  useEffect(() => {
    return () => {
      // Optional: Reset stores on unmount to prevent stale data
      // Uncomment if you want to reset data when navigating away
      // resetAllStores()
    }
  }, [resetAllStores])

  return <SettingsLayout />
}