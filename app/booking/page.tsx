"use client"

import { useState } from "react"
import ClientLayout from "@/components/layout/ClientLayout"
import BookingPage from "@/components/pages/BookingPage"

export default function Booking() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  return (
    <ClientLayout>
      <BookingPage currentLanguage={currentLanguage} />
    </ClientLayout>
  )
}

//page .jsx is done here
