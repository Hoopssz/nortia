import type { ReactNode } from 'react'
import { WebPlatformHeader } from '../components/WebPlatformHeader'
import { PushPermissionBanner } from '../components/PushPermissionBanner'
import { MobileBottomNav } from '../components/MobileBottomNav'

export function WebPlatformLayout({
  children,
  activeTab = '',
}: {
  children: ReactNode
  activeTab?: string
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-ambient)' }}>
      <WebPlatformHeader activeTab={activeTab} />
      <main style={{ flex: 1, width: '100%', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 14px))' }}>
        {children}
      </main>
      <PushPermissionBanner />
      <MobileBottomNav />
    </div>
  )
}

