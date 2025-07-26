"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import RoutesPage from "@/components/pages/RoutesPage"
import { useLanguage } from "@/components/context/LanguageContext"

export default function Routes() {
  const { currentLanguage } = useLanguage()

  return (
    <ClientLayout>
      <RoutesPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
