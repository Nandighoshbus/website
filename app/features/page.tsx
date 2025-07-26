"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import FeaturesPage from "@/components/pages/FeaturesPage"
import { useLanguage } from "@/components/context/LanguageContext"

export default function Features() {
  const { currentLanguage } = useLanguage()

  return (
    <ClientLayout>
      <FeaturesPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
