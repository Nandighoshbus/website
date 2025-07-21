"use client"

import { useState } from "react"
import ClientLayout from "@/components/layout/ClientLayout"
import RoutesPage from "@/components/pages/RoutesPage"

export default function Routes() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  return (
    <ClientLayout>
      <RoutesPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
