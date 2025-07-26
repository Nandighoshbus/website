"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import HomePage from "@/components/pages/HomePage"
import { useLanguage } from "@/components/context/LanguageContext"

export default function Home() {
  const { currentLanguage } = useLanguage()

  return (
    <ClientLayout>
      <HomePage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
