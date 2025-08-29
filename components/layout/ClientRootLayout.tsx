"use client"

import { LanguageProvider } from '@/components/context/LanguageContext'
import { AuthProvider } from '@/components/context/AuthContext'
import { AdminAuthProvider } from '@/components/context/AdminAuthContext'
import { AgentAuthProvider } from '@/components/context/AgentAuthContext'

interface ClientRootLayoutProps {
  children: React.ReactNode
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AgentAuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AgentAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}
