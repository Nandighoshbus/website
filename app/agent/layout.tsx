// app/agent/layout.tsx
'use client'

import { AgentAuthProvider } from '@/components/context/AgentAuthContext'

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentAuthProvider>
      {children}
    </AgentAuthProvider>
  )
}
