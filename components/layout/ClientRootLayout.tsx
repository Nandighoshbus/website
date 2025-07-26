"use client"

import { LanguageProvider } from '@/components/context/LanguageContext'

interface ClientRootLayoutProps {
  children: React.ReactNode
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
