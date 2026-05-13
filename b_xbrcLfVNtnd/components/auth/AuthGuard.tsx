'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

interface AuthGuardProps {
  children: React.ReactNode
}

const PUBLIC_ROUTES = new Set(['/login'])

function GuardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        Preparando workspace...
      </div>
    </div>
  )
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isPublicRoute = PUBLIC_ROUTES.has(pathname)

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login')
      return
    }

    if (isAuthenticated && pathname === '/login') {
      router.replace('/')
    }
  }, [isAuthenticated, isHydrated, isPublicRoute, pathname, router])

  if (!isHydrated) return <GuardFallback />
  if (!isAuthenticated && !isPublicRoute) return <GuardFallback />
  if (isAuthenticated && pathname === '/login') return <GuardFallback />

  return <>{children}</>
}
