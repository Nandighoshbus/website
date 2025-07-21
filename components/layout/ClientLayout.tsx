"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { BackgroundParticles } from "@/components/ui/BackgroundParticles"

interface LayoutProps {
  children: React.ReactNode | ((props: { currentLanguage: string; currentLang: any }) => React.ReactNode)
}

const languages = {
  en: {
    home: "Home",
    routes: "Routes",
    features: "Features", 
    contact: "Contact",
    bookNow: "Book Now",
    tagline: "Your Journey, Our Commitment",
    quickLinks: "Quick Links",
    services: "Services",
    contactInfoFooter: "Contact Info",
    onlineBooking: "Online Booking",
    acSleeper: "AC Sleeper",
    gpsTracking: "GPS Tracking",
    support: "24/7 Support",
    service24x7: "Available 24/7",
    rightsReserved: "All rights reserved.",
    madeWith: "Made with ❤️ in Odisha",
    footerDescription: "Connecting communities across Odisha with reliable, comfortable, and affordable bus services.",
  },
  hi: {
    home: "होम",
    routes: "रूट्स",
    features: "सुविधाएं",
    contact: "संपर्क",
    bookNow: "बुक करें",
    tagline: "आपकी यात्रा, हमारी प्रतिबद्धता",
    quickLinks: "त्वरित लिंक",
    services: "सेवाएं",
    contactInfoFooter: "संपर्क जानकारी",
    onlineBooking: "ऑनलाइन बुकिंग",
    acSleeper: "एसी स्लीपर",
    gpsTracking: "जीपीएस ट्रैकिंग",
    support: "24/7 सहायता",
    service24x7: "24/7 उपलब्ध",
    rightsReserved: "सभी अधिकार सुरक्षित।",
    madeWith: "ओडिशा में ❤️ से बनाया गया",
    footerDescription: "विश्वसनीय, आरामदायक और किफायती बस सेवाओं के साथ ओडिशा भर के समुदायों को जोड़ना।",
  },
  or: {
    home: "ଘର",
    routes: "ରୁଟ୍",
    features: "ସୁବିଧା",
    contact: "ଯୋଗାଯୋଗ",
    bookNow: "ବୁକ୍ କରନ୍ତୁ",
    tagline: "ଆପଣଙ୍କ ଯାତ୍ରା, ଆମର ପ୍ରତିବଦ୍ଧତା",
    quickLinks: "ଦ୍ରୁତ ଲିଙ୍କ",
    services: "ସେବା",
    contactInfoFooter: "ଯୋଗାଯୋଗ ସୂଚନା",
    onlineBooking: "ଅନଲାଇନ୍ ବୁକିଂ",
    acSleeper: "ଏସି ସ୍ଲିପର",
    gpsTracking: "ଜିପିଏସ୍ ଟ୍ରାକିଂ",
    support: "24/7 ସହାୟତା",
    service24x7: "24/7 ଉପଲବ୍ଧ",
    rightsReserved: "ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
    madeWith: "ଓଡ଼ିଶାରେ ❤️ ସହିତ ନିର୍ମିତ",
    footerDescription: "ବିଶ୍ୱସ୍ତ, ଆରାମଦାୟକ ଏବଂ ସୁଲଭ ବସ୍ ସେବା ସହିତ ଓଡ଼ିଶାର ସମ୍ପ୍ରଦାୟଗୁଡ଼ିକୁ ସଂଯୋଗ କରିବା।",
  }
}

export default function ClientLayout({ children }: LayoutProps) {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentLang = languages[currentLanguage as keyof typeof languages]

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
