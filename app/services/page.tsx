"use client"

import { useLanguage } from "@/components/context/LanguageContext"
import ServicesPage from "@/components/pages/ServicesPage"

export default function Services() {
  const { currentLanguage } = useLanguage()
  
  return <ServicesPage currentLanguage={currentLanguage} />
}
