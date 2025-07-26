"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { BackgroundParticles } from "@/components/ui/BackgroundParticles"
import { useLanguage } from "@/components/context/LanguageContext"

interface LayoutProps {
  children: React.ReactNode | ((props: { currentLanguage: string; currentLang: any }) => React.ReactNode)
}

export default function ClientLayout({ children }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { currentLanguage, setCurrentLanguage, currentLang } = useLanguage()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
      <BackgroundParticles />

      <Navbar 
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        currentLang={currentLang}
      />
      
      <main className="relative z-10">
        {typeof children === 'function' 
          ? children({ currentLanguage, currentLang })
          : children
        }
      </main>

      <Footer currentLang={currentLang} currentTime={currentTime} />
    </div>
  )
}
