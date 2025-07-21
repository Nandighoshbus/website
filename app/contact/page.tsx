"use client"

import { useState } from "react"
import ClientLayout from "@/components/layout/ClientLayout"
import ContactPage from "@/components/pages/ContactPage"

export default function Contact() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  return (
    <ClientLayout>
      <ContactPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
