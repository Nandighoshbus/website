"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import HomePage from "@/components/pages/HomePage"

export default function Home() {
  return (
    <ClientLayout>
      {({ currentLanguage, currentLang }) => (
        <HomePage currentLanguage={currentLanguage} />
      )}
    </ClientLayout>
  )
}
