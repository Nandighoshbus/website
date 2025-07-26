"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import ContactPage from "@/components/pages/ContactPage"
import { useLanguage } from "@/components/context/LanguageContext"

export default function Contact() {
  const { currentLanguage } = useLanguage()

  return (
    <ClientLayout>
      <ContactPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
