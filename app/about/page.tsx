'use client'

import ClientLayout from "@/components/layout/ClientLayout"
import AboutPage from '@/components/pages/AboutPage'
import { useLanguage } from '@/components/context/LanguageContext'

export default function About() {
  const { currentLanguage } = useLanguage()
  
  return (
    <ClientLayout>
      <AboutPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
