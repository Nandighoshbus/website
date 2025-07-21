"use client"

import { useState } from "react"
import ClientLayout from "@/components/layout/ClientLayout"
import FeaturesPage from "@/components/pages/FeaturesPage"

export default function Features() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  return (
    <ClientLayout>
      <FeaturesPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
