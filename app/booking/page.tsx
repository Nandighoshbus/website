"use client"

import ClientLayout from "@/components/layout/ClientLayout"
import BookingPage from "@/components/pages/BookingPage"
import { useLanguage } from "@/components/context/LanguageContext"

export default function Booking() {
  const { currentLanguage } = useLanguage()

  return (
    <ClientLayout>
      <BookingPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}
