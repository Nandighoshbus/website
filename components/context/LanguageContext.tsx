"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const languages = {
  en: {
    home: "Home",
    routes: "Routes",
    features: "Features", 
    about: "About",
    contact: "Contact",
    offers: "Offers",
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
    // Contact Page
    getInTouch: "Get In Touch",
    beginJourney: "Let's Begin Your Journey Together",
    contactDescription: "Have questions or need assistance? We're here to help you plan the perfect journey with Nandighosh.",
    sendMessage: "Send us a Message",
    formDescription: "Fill out the form below and we'll get back to you as soon as possible",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    route: "Preferred Route",
    message: "Message",
    travelRequirements: "Tell us about your travel requirements...",
    sendMessageBtn: "Send Message",
    contactInfo: "Contact Information",
    helpline: "24/7 Helpline",
    whatsappService: "WhatsApp Service",
    instantResponse: "Instant Response",
    emailService: "Email Service",
    correspondence: "For general correspondence",
    mobileApp: "Mobile App Coming Soon",
    appDescription: "We're working on an amazing mobile app that will give you easy access to booking, tracking, and customer support. Stay tuned!",
    appStore: "App Store",
    // Offers Page
    offersTitle: "Special Offers",
    offersDescription: "Discover amazing deals and save more on your journey with Nandighosh Travels. From early bird specials to group discounts, we have something for everyone.",
    saveMore: "Save More, Travel More",
    validTill: "Valid Till",
    applicableRoutes: "Applicable Routes",
    dontMissOut: "Don't Miss Out on These Amazing Deals!",
    limitedTime: "Limited time offers that make your journey more affordable and comfortable.",
    viewAllOffers: "View All Offers",
    callNow: "Call Now",
    bookYourJourney: "Book Your Journey",
    // Booking Page
    search: "Search",
    track: "Track", 
    qrScan: "QR Scan",
    hireBus: "Hire Bus",
  },
  hi: {
    home: "होम",
    routes: "रूट्स",
    features: "सुविधाएं",
    about: "हमारे बारे में",
    contact: "संपर्क",
    offers: "ऑफ़र",
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
    // Contact Page
    getInTouch: "संपर्क में रहें",
    beginJourney: "आइए साथ मिलकर अपनी यात्रा शुरू करें",
    contactDescription: "कोई प्रश्न है या सहायता चाहिए? हम नंदीघोष के साथ आपकी परफेक्ट यात्रा की योजना बनाने में मदद करने के लिए यहां हैं।",
    sendMessage: "हमें संदेश भेजें",
    formDescription: "नीचे दिया गया फॉर्म भरें और हम जल्द से जल्द आपसे संपर्क करेंगे",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    email: "ईमेल पता",
    phone: "फोन नंबर",
    route: "पसंदीदा मार्ग",
    message: "संदेश",
    travelRequirements: "हमें अपनी यात्रा की आवश्यकताओं के बारे में बताएं...",
    sendMessageBtn: "संदेश भेजें",
    contactInfo: "संपर्क जानकारी",
    helpline: "24/7 हेल्पलाइन",
    whatsappService: "व्हाट्सऐप सेवा",
    instantResponse: "तत्काल प्रतिक्रिया",
    emailService: "ईमेल सेवा",
    correspondence: "सामान्य पत्राचार के लिए",
    mobileApp: "मोबाइल ऐप जल्द आ रहा है",
    appDescription: "हम एक अद्भुत मोबाइल ऐप पर काम कर रहे हैं जो आपको बुकिंग, ट्रैकिंग और कस्टमर सपोर्ट तक आसान पहुंच देगा। बने रहें!",
    appStore: "ऐप स्टोर",
    // Offers Page
    offersTitle: "विशेष ऑफ़र",
    offersDescription: "नंदीघोष ट्रैवल्स के साथ अपनी यात्रा पर अद्भुत सौदे खोजें और अधिक बचत करें। अर्ली बर्ड स्पेशल से लेकर ग्रुप डिस्काउंट तक, हमारे पास सभी के लिए कुछ न कुछ है।",
    saveMore: "अधिक बचत करें, अधिक यात्रा करें",
    validTill: "तक वैध",
    applicableRoutes: "लागू रूट्स",
    dontMissOut: "इन अद्भुत सौदों को न चूकें!",
    limitedTime: "सीमित समय के ऑफ़र जो आपकी यात्रा को और किफायती और आरामदायक बनाते हैं।",
    viewAllOffers: "सभी ऑफ़र देखें",
    callNow: "अभी कॉल करें",
    bookYourJourney: "अपनी यात्रा बुक करें",
    // Booking Page
    search: "खोजें",
    track: "ट्रैक करें",
    qrScan: "QR स्कैन",
    hireBus: "बस किराए पर लें",
  },
  or: {
    home: "ଘର",
    routes: "ରୁଟ୍",
    features: "ସୁବିଧା",
    about: "ଆମ ବିଷୟରେ",
    contact: "ଯୋଗାଯୋଗ",
    offers: "ଅଫର",
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
    // Contact Page
    getInTouch: "ସମ୍ପର୍କରେ ରୁହନ୍ତୁ",
    beginJourney: "ଆସନ୍ତୁ ମିଳିତ ଭାବରେ ଆପଣଙ୍କ ଯାତ୍ରା ଆରମ୍ଭ କରିବା",
    contactDescription: "କୌଣସି ପ୍ରଶ୍ନ ଅଛି କି ସହାୟତା ଦରକାର? ନନ୍ଦିଘୋଷ ସହିତ ଆପଣଙ୍କର ସମ୍ପୂର୍ଣ୍ଣ ଯାତ୍ରା ଯୋଜନା କରିବାରେ ସାହାଯ୍ୟ କରିବାକୁ ଆମେ ଏଠାରେ ଅଛୁ।",
    sendMessage: "ଆମକୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    formDescription: "ନିମ୍ନରେ ଥିବା ଫର୍ମ ପୂରଣ କରନ୍ତୁ ଏବଂ ଆମେ ଯଥାଶୀଘ୍ର ଆପଣଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରିବୁ",
    firstName: "ପ୍ରଥମ ନାମ",
    lastName: "ଶେଷ ନାମ",
    email: "ଇମେଲ ଠିକଣା",
    phone: "ଫୋନ ନମ୍ବର",
    route: "ପସନ୍ଦର ମାର୍ଗ",
    message: "ବାର୍ତ୍ତା",
    travelRequirements: "ଆପଣଙ୍କର ଯାତ୍ରା ଆବଶ୍ୟକତା ବିଷୟରେ ଆମକୁ କୁହନ୍ତୁ...",
    sendMessageBtn: "ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    contactInfo: "ଯୋଗାଯୋଗ ସୂଚନା",
    helpline: "24/7 ହେଲ୍ପଲାଇନ",
    whatsappService: "ହ୍ୱାଟସଆପ ସେବା",
    instantResponse: "ତତକ୍ଷଣାତ ପ୍ରତିକ୍ରିୟା",
    emailService: "ଇମେଲ ସେବା",
    correspondence: "ସାଧାରଣ ଚିଠିପତ୍ର ପାଇଁ",
    mobileApp: "ମୋବାଇଲ ଆପ ଶୀଘ୍ର ଆସୁଛି",
    appDescription: "ଆମେ ଏକ ଅଦ୍ଭୁତ ମୋବାଇଲ ଆପରେ କାମ କରୁଛୁ ଯାହା ଆପଣଙ୍କୁ ବୁକିଂ, ଟ୍ରାକିଂ ଏବଂ ଗ୍ରାହକ ସହାୟତାର ସହଜ ଅଭିଗମ ଦେବ। ସାଙ୍ଗେ ରୁହନ୍ତୁ!",
    appStore: "ଆପ ଷ୍ଟୋର",
    // Offers Page
    offersTitle: "ବିଶେଷ ଅଫର",
    offersDescription: "ନନ୍ଦିଘୋଷ ଟ୍ରାଭେଲ୍ସ ସହିତ ଆପଣଙ୍କ ଯାତ୍ରାରେ ଅଦ୍ଭୁତ ଡିଲ ଆବିଷ୍କାର କରନ୍ତୁ ଏବଂ ଅଧିକ ସଞ୍ଚୟ କରନ୍ତୁ। ଅର୍ଲି ବାର୍ଡ ସ୍ପେଶାଲ ଠାରୁ ଗ୍ରୁପ ରିହାତି ପର୍ଯ୍ୟନ୍ତ, ସମସ୍ତଙ୍କ ପାଇଁ ଆମର କିଛି ନା କିଛି ଅଛି।",
    saveMore: "ଅଧିକ ସଞ୍ଚୟ କରନ୍ତୁ, ଅଧିକ ଯାତ୍ରା କରନ୍ତୁ",
    validTill: "ପର୍ଯ୍ୟନ୍ତ ବୈଧ",
    applicableRoutes: "ପ୍ରଯୁଜ୍ୟ ରୁଟ",
    dontMissOut: "ଏହି ଅଦ୍ଭୁତ ଡିଲଗୁଡ଼ିକୁ ହାତଛଡ଼ା କରନ୍ତୁ ନାହିଁ!",
    limitedTime: "ସୀମିତ ସମୟର ଅଫର ଯାହା ଆପଣଙ୍କ ଯାତ୍ରାକୁ ଅଧିକ ସାଶ୍ରୟୀ ଏବଂ ଆରାମଦାୟକ ବନାଏ।",
    viewAllOffers: "ସମସ୍ତ ଅଫର ଦେଖନ୍ତୁ",
    callNow: "ବର୍ତ୍ତମାନ କଲ କରନ୍ତୁ",
    bookYourJourney: "ଆପଣଙ୍କ ଯାତ୍ରା ବୁକ କରନ୍ତୁ",
    // Booking Page
    search: "ଖୋଜନ୍ତୁ",
    track: "ଟ୍ରାକ କରନ୍ତୁ",
    qrScan: "QR ସ୍କାନ",
    hireBus: "ବସ୍ ଭଡ଼ାରେ ନିଅନ୍ତୁ",
  }
}

interface LanguageContextType {
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
  currentLang: any
  currentTime: Date
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
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
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        setCurrentLanguage, 
        currentLang, 
        currentTime 
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
