"use client"

import { LanguageProvider } from '@/components/context/LanguageContext'
import { AuthProvider } from '@/components/context/AuthContext'

interface ClientRootLayoutProps {
  children: React.ReactNode
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  )
}
