"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bus,
  Clock,
  Shield,
  Phone,
  Mail,
  MessageCircle,
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  MapPin,
  QrCode,
  Crown,
  Navigation,
  Wifi,
  Coffee,
  Rocket,
  Award,
} from "lucide-react"
import Image from "next/image"

type RouteType = {
  id: string;
  from: {
    en: string;
    hi: string;
    or: string;
  };
  to: {
    en: string;
    hi: string;
    or: string;
  };
  duration: string;
  price: string;
  icon: string;
  distance: string;
  stops: number;
  nextDeparture: string;
  rating: number;
  amenities: string[];
  description: {
    en: string;
    hi: string;
    or: string;
  };
  popular?: boolean;
};

export default function NandighoshAdvancedLanding() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weatherData, setWeatherData] = useState({ temp: 28, condition: "Sunny" })
  const [isVisible, setIsVisible] = useState({})
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null)
  const [seatAvailability, setSeatAvailability] = useState<Record<string, number>>({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)

  // Loading animation effect
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval)
          setTimeout(() => setIsLoading(false), 500) // Small delay before hiding loader
          return 100
        }
        return prev + 2
      })
    }, 80) // Adjust speed as needed

    return () => clearInterval(loadingInterval)
  }, [])

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Scroll animation setup
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          
          // Add staggered animation for child elements
          const staggerElements = entry.target.querySelectorAll('.stagger-child')
          staggerElements.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in')
            }, index * 80) // Reduced delay for smoother effect
          })
        }
      })
    }, observerOptions)

    // Wait for DOM to be ready
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('[data-animate]')
      animatedElements.forEach((el) => {
        observer.observe(el)
      })
    }, 100)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Real-time updates and intersection observer
  useEffect(() => {
    // Real-time updates - update every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Simulate real-time seat availability
    const seatInterval = setInterval(() => {
      setSeatAvailability({
        "balasore-sambalpur": Math.floor(Math.random() * 20) + 5,
        "balasore-jamshedpur": Math.floor(Math.random() * 15) + 8,
        "balasore-berhampur": Math.floor(Math.random() * 25) + 10,
        "balasore-puri": Math.floor(Math.random() * 18) + 7,
      })
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(seatInterval)
    }
  }, [])

  // Loading animation effect
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval)
          setTimeout(() => setIsLoading(false), 500) // Small delay before hiding loader
          return 100
        }
        return prev + 2
      })
    }, 80) // Adjust speed as needed

    return () => clearInterval(loadingInterval)
  }, [])

  // Language translations
  const languages = {
    en: {
      // Navigation
      home: "Home",
      routes: "Routes",
      features: "Features",
      contact: "Contact",
      bookNow: "Book Now",
      stops: "stops",
      next: "Next:",
      popularRoute: "POPULAR ROUTE",

      // Hero Section
      tagline: "Connecting Odisha, Comfortably",
      subtitle: "Premium Travel Experience Across Odisha",
      premiumSubtitle: "Experience luxury travel redefined with our world-class fleet and exceptional service",
      bookSeat: "Reserve Your Journey",
      exploreRoutes: "Explore Destinations",
      dailyRoutes: "Daily Routes",
      happyCustomers: "Happy Customers",
      yearsExperience: "Years Experience",
      onTime: "On-Time",

      // Booking Section
      quickBooking: "Quick Booking",
      bookJourney: "Explore Your Journey",
      search: "Search",
      track: "Track",
      qrScan: "QR Scan",
      from: "From",
      to: "To",
      date: "Date",
      passengers: "Passengers",
      departureCity: "Departure city",
      destinationCity: "Destination city",
      searchRoutes: "Search Routes",
      liveTracking: "Live Bus Tracking",
      enterTicket: "Enter your ticket number",
      trackBus: "Track My Bus",
      qrBooking: "QR Code Booking",
      qrDescription: "Scan QR codes at bus stops for instant booking",
      openScanner: "Open QR Scanner",

      // Routes Section
      popularRoutes: "Popular Routes",
      premiumRoutes: "Our Premium Routes",
      routesDescription: "Discover our most popular destinations with comfortable travel and competitive pricing",
      checkTimings: "Check Timings",
      bookRoute: "Book Journey",
      liveAvailability: "Live Availability",
      seats: "seats",

      // Features Section
      whyChooseUs: "Why Choose Us",
      premiumExperience: "Premium Travel Experience",
      featuresDescription:
        "We provide world-class amenities and services to make your journey comfortable and memorable",
      additionalAmenities: "Additional Amenities",
      
      // Feature Items
      acSleeperCoaches: "AC Sleeper Coaches",
      acSleeperDesc: "Comfortable air-conditioned sleeper buses for long journeys",
      timelyDeparture: "Timely Departure", 
      timelyDepartureDesc: "Punctual service with on-time departures and arrivals",
      safeSecure: "Safe & Secure",
      safeSecureDesc: "GPS tracking and experienced drivers for your safety",
      modernAmenities: "Modern Amenities",
      modernAmenitiesDesc: "WiFi, charging points, and entertainment systems",
      
      // Amenities
      ac: "AC",
      wifi: "WiFi", 
      meals: "Meals",
      entertainment: "Entertainment",
      snacks: "Snacks",
      usbCharging: "USB Charging",
      refreshments: "Refreshments",
      blankets: "Blankets",

      // Contact Section
      getInTouch: "Get In Touch",
      beginJourney: "Contact Us",
      contactDescription: "Ready to travel? Contact us now or fill out the form below to book your comfortable journey",
      sendMessage: "Send us a Message",
      formDescription: "Fill out the form and we'll get back to you within 24 hours",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      route: "Route",
      message: "Message",
      travelRequirements: "Tell us about your travel requirements...",
      sendMessageBtn: "Send Message",

      // Contact Info
      contactInfo: "Contact Information",
      helpline: "Helpline",
      support24x7: "24/7 Support",
      whatsappService: "WhatsApp Service",
      instantResponse: "Instant response",
      emailService: "Email Service",
      correspondence: "Professional correspondence",

      // App Section
      mobileApp: "Nandighosh Mobile App",
      appDescription: "Book tickets, track buses, and manage your journeys on the go",
      appStore: "App Store",
      googlePlay: "Google Play",

      // Footer
      footerDescription: "Connecting Odisha, Comfortably",
      quickLinks: "Quick Links",
      services: "Services",
      onlineBooking: "Online Booking",
      acSleeper: "AC Sleeper",
      gpsTracking: "GPS Tracking",
      support: "24/7 Support",
      contactInfoFooter: "Contact Info",
      service24x7: "24/7 Service",
      rightsReserved: "All rights reserved.",
      madeWith: "Made with ❤️ in Odisha",
    },
    hi: {
      // Navigation
      home: "होम",
      routes: "मार्ग",
      features: "सुविधाएं",
      contact: "संपर्क",
      bookNow: "बुक करें",
      stops: "स्टॉप",
      next: "अगला:",
      popularRoute: "लोकप्रिय मार्ग",

      // Hero Section
      tagline: "ओडिशा को जोड़ना, आराम से",
      subtitle: "ओडिशा में प्रीमियम यात्रा अनुभव",
      premiumSubtitle: "हमारे विश्व स्तरीय बेड़े और असाधारण सेवा के साथ लक्जरी यात्रा का अनुभव करें",
      bookSeat: "अपनी यात्रा आरक्षित करें",
      exploreRoutes: "गंतव्य देखें",
      dailyRoutes: "दैनिक मार्ग",
      happyCustomers: "खुश ग्राहक",
      yearsExperience: "साल का अनुभव",
      onTime: "समय पर",

      // Booking Section
      quickBooking: "त्वरित बुकिंग",
      bookJourney: "अपनी यात्रा बुक करें",
      search: "खोजें",
      track: "ट्रैक करें",
      qrScan: "QR स्कैन",
      from: "से",
      to: "तक",
      date: "तारीख",
      passengers: "यात्री",
      departureCity: "प्रस्थान शहर",
      destinationCity: "गंतव्य शहर",
      searchRoutes: "मार्ग खोजें",
      liveTracking: "लाइव बस ट्रैकिंग",
      enterTicket: "अपना टिकट नंबर दर्ज करें",
      trackBus: "मेरी बस ट्रैक करें",
      qrBooking: "QR कोड बुकिंग",
      qrDescription: "तत्काल बुकिंग के लिए बस स्टॉप पर QR कोड स्कैन करें",
      openScanner: "QR स्कैनर खोलें",

      // Routes Section
      popularRoutes: "लोकप्रिय मार्ग",
      premiumRoutes: "हमारे प्रीमियम मार्ग",
      routesDescription: "आरामदायक यात्रा और प्रतिस्पर्धी मूल्य के साथ हमारे सबसे लोकप्रिय गंतव्यों की खोज करें",
      checkTimings: "समय देखें",
      bookRoute: "यात्रा बुक करें",
      liveAvailability: "लाइव उपलब्धता",
      seats: "सीटें",

      // Features Section
      whyChooseUs: "हमें क्यों चुनें",
      premiumExperience: "प्रीमियम यात्रा अनुभव",
      featuresDescription: "हम आपकी यात्रा को आरामदायक और यादगार बनाने के लिए विश्व स्तरीय सुविधाएं और सेवाएं प्रदान करते हैं",
      additionalAmenities: "अतिरिक्त सुविधाएं",
      
      // Feature Items
      acSleeperCoaches: "AC स्लीपर कोच",
      acSleeperDesc: "लंबी यात्राओं के लिए आरामदायक वातानुकूलित स्लीपर बसें",
      timelyDeparture: "समय पर प्रस्थान",
      timelyDepartureDesc: "समय पर प्रस्थान और आगमन के साथ सटीक सेवा",
      safeSecure: "सुरक्षित और संरक्षित",
      safeSecureDesc: "आपकी सुरक्षा के लिए GPS ट्रैकिंग और अनुभवी चालक",
      modernAmenities: "आधुनिक सुविधाएं",
      modernAmenitiesDesc: "WiFi, चार्जिंग पॉइंट, और मनोरंजन सिस्टम",
      
      // Amenities
      ac: "AC",
      wifi: "WiFi",
      meals: "भोजन",
      entertainment: "मनोरंजन",
      snacks: "नाश्ता",
      usbCharging: "USB चार्जिंग",
      refreshments: "जलपान",
      blankets: "कंबल",

      // Contact Section
      getInTouch: "संपर्क में रहें",
      beginJourney: "अपनी यात्रा बुक करें",
      contactDescription:
        "यात्रा के लिए तैयार हैं? अभी हमसे संपर्क करें या अपनी आरामदायक यात्रा बुक करने के लिए नीचे दिया गया फॉर्म भरें",
      sendMessage: "हमें संदेश भेजें",
      formDescription: "फॉर्म भरें और हम 24 घंटे के भीतर आपसे संपर्क करेंगे",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      email: "ईमेल",
      phone: "फोन",
      route: "मार्ग",
      message: "संदेश",
      travelRequirements: "हमें अपनी यात्रा आवश्यकताओं के बारे में बताएं...",
      sendMessageBtn: "संदेश भेजें",

      // Contact Info
      contactInfo: "संपर्क जानकारी",
      helpline: "हेल्पलाइन",
      support24x7: "24/7 सहायता",
      whatsappService: "व्हाट्सऐप सेवा",
      instantResponse: "तत्काल प्रतिक्रिया",
      emailService: "ईमेल सेवा",
      correspondence: "व्यावसायिक पत्राचार",

      // App Section
      mobileApp: "नंदीघोष मोबाइल ऐप",
      appDescription: "टिकट बुक करें, बसों को ट्रैक करें, और चलते-फिरते अपनी यात्राओं का प्रबंधन करें",
      appStore: "ऐप स्टोर",
      googlePlay: "गूगल प्ले",

      // Footer
      footerDescription: "2008 से आरामदायक और विश्वसनीय बस सेवाओं के साथ ओडिशा को जोड़ना।",
      quickLinks: "त्वरित लिंक",
      services: "सेवाएं",
      onlineBooking: "ऑनलाइन बुकिंग",
      acSleeper: "AC स्लीपर",
      gpsTracking: "GPS ट्रैकिंग",
      support: "24/7 सहायता",
      contactInfoFooter: "संपर्क जानकारी",
      service24x7: "24/7 सेवा",
      rightsReserved: "सभी अधिकार सुरक्षित।",
      madeWith: "ओडिशा में ❤️ के साथ बनाया गया",
    },
    or: {
      // Navigation
      home: "ଘର",
      routes: "ମାର୍ଗ",
      features: "ସୁବିଧା",
      contact: "ଯୋଗାଯୋଗ",
      bookNow: "ବୁକ୍ କରନ୍ତୁ",
      stops: "ଷ୍ଟପ୍",
      next: "ପରବର୍ତ୍ତୀ:",
      popularRoute: "ଲୋକପ୍ରିୟ ମାର୍ଗ",

      // Hero Section
      tagline: "ଓଡ଼ିଶାକୁ ଯୋଡ଼ିବା, ଆରାମରେ",
      subtitle: "ଓଡ଼ିଶାରେ ପ୍ରିମିୟମ୍ ଯାତ୍ରା ଅଭିଜ୍ଞତା",
      premiumSubtitle: "ଆମର ବିଶ୍ୱମାନର ଜାହାଜ ଏବଂ ଅସାଧାରଣ ସେବା ସହିତ ବିଳାସପୂର୍ଣ୍ଣ ଯାତ୍ରାର ଅଭିଜ୍ଞତା ନିଅନ୍ତୁ",
      bookSeat: "ଆପଣଙ୍କ ଯାତ୍ରା ସଂରକ୍ଷଣ କରନ୍ତୁ",
      exploreRoutes: "ଗନ୍ତବ୍ୟ ଦେଖନ୍ତୁ",
      dailyRoutes: "ଦୈନିକ ମାର୍ଗ",
      happyCustomers: "ଖୁସି ଗ୍ରାହକ",
      yearsExperience: "ବର୍ଷର ଅଭିଜ୍ଞତା",
      onTime: "ସମୟରେ",

      // Booking Section
      quickBooking: "ଶୀଘ୍ର ବୁକିଂ",
      bookJourney: "ଆପଣଙ୍କ ଯାତ୍ରା ବୁକ୍ କରନ୍ତୁ",
      search: "ଖୋଜନ୍ତୁ",
      track: "ଟ୍ରାକ୍ କରନ୍ତୁ",
      qrScan: "QR ସ୍କାନ୍",
      from: "ରୁ",
      to: "କୁ",
      date: "ତାରିଖ",
      passengers: "ଯାତ୍ରୀ",
      departureCity: "ପ୍ରସ୍ଥାନ ସହର",
      destinationCity: "ଗନ୍ତବ୍ୟ ସହର",
      searchRoutes: "ମାର୍ଗ ଖୋଜନ୍ତୁ",
      liveTracking: "ଲାଇଭ୍ ବସ୍ ଟ୍ରାକିଂ",
      enterTicket: "ଆପଣଙ୍କ ଟିକେଟ୍ ନମ୍ବର ଦିଅନ୍ତୁ",
      trackBus: "ମୋ ବସ୍ ଟ୍ରାକ୍ କରନ୍ତୁ",
      qrBooking: "QR କୋଡ୍ ବୁକିଂ",
      qrDescription: "ତୁରନ୍ତ ବୁକିଂ ପାଇଁ ବସ୍ ଷ୍ଟପ୍‌ରେ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ",
      openScanner: "QR ସ୍କାନର୍ ଖୋଲନ୍ତୁ",

      // Routes Section
      popularRoutes: "ଲୋକପ୍ରିୟ ମାର୍ଗ",
      premiumRoutes: "ଆମର ପ୍ରିମିୟମ୍ ମାର୍ଗ",
      routesDescription: "ଆରାମଦାୟକ ଯାତ୍ରା ଏବଂ ପ୍ରତିଯୋଗିତାମୂଳକ ମୂଲ୍ୟ ସହିତ ଆମର ସବୁଠାରୁ ଲୋକପ୍ରିୟ ଗନ୍ତବ୍ୟଗୁଡ଼ିକ ଆବିଷ୍କାର କରନ୍ତୁ",
      checkTimings: "ସମୟ ଦେଖନ୍ତୁ",
      bookRoute: "ଯାତ୍ରା ବୁକ୍ କରନ୍ତୁ",
      liveAvailability: "ଲାଇଭ୍ ଉପଲବ୍ଧତା",
      seats: "ସିଟ୍",

      // Features Section
      whyChooseUs: "ଆମକୁ କାହିଁକି ବାଛନ୍ତୁ",
      premiumExperience: "ପ୍ରିମିୟମ୍ ଯାତ୍ରା ଅଭିଜ୍ଞତା",
      featuresDescription: "ଆପଣଙ୍କ ଯାତ୍ରାକୁ ଆରାମଦାୟକ ଏବଂ ସ୍ମରଣୀୟ କରିବା ପାଇଁ ଆମେ ବିଶ୍ୱମାନର ସୁବିଧା ଏବଂ ସେବା ପ୍ରଦାନ କରୁ",
      additionalAmenities: "ଅତିରିକ୍ତ ସୁବିଧା",
      
      // Feature Items
      acSleeperCoaches: "AC ସ୍ଲିପର କୋଚ୍",
      acSleeperDesc: "ଦୀର୍ଘ ଯାତ୍ରା ପାଇଁ ଆରାମଦାୟକ ଶୀତତାପ ନିୟନ୍ତ୍ରିତ ସ୍ଲିପର ବସ୍",
      timelyDeparture: "ସମୟମତ ପ୍ରସ୍ଥାନ",
      timelyDepartureDesc: "ସମୟମତ ପ୍ରସ୍ଥାନ ଏବଂ ଆଗମନ ସହିତ ସଠିକ୍ ସେବା",
      safeSecure: "ନିରାପଦ ଏବଂ ସୁରକ୍ଷିତ",
      safeSecureDesc: "ଆପଣଙ୍କ ସୁରକ୍ଷା ପାଇଁ GPS ଟ୍ରାକିଂ ଏବଂ ଅଭିଜ୍ଞ ଚାଳକ",
      modernAmenities: "ଆଧୁନିକ ସୁବିଧା",
      modernAmenitiesDesc: "WiFi, ଚାର୍ଜିଂ ପଏଣ୍ଟ, ଏବଂ ମନୋରଞ୍ଜନ ସିଷ୍ଟମ୍",
      
      // Amenities
      ac: "AC",
      wifi: "WiFi",
      meals: "ଭୋଜନ",
      entertainment: "ମନୋରଞ୍ଜନ",
      snacks: "ଲଘୁଆହାର",
      usbCharging: "USB ଚାର୍ଜିଂ",
      refreshments: "ପାନୀୟ",
      blankets: "କମ୍ବଳ",

      // Contact Section
      getInTouch: "ଯୋଗାଯୋଗ କରନ୍ତୁ",
      beginJourney: "ଆପଣଙ୍କ ଯାତ୍ରା ବୁକ୍ କରନ୍ତୁ",
      contactDescription: "ଯାତ୍ରା ପାଇଁ ପ୍ରସ୍ତୁତ? ଏବେ ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା ଆପଣଙ୍କ ଆରାମଦାୟକ ଯାତ୍ରା ବୁକ୍ କରିବା ପାଇଁ ନିମ୍ନରେ ଥିବା ଫର୍ମ ପୂରଣ କରନ୍ତୁ",
      sendMessage: "ଆମକୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
      formDescription: "ଫର୍ମ ପୂରଣ କରନ୍ତୁ ଏବଂ ଆମେ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଆପଣଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରିବୁ",
      firstName: "ପ୍ରଥମ ନାମ",
      lastName: "ଶେଷ ନାମ",
      email: "ଇମେଲ୍",
      phone: "ଫୋନ୍",
      route: "ମାର୍ଗ",
      message: "ବାର୍ତ୍ତା",
      travelRequirements: "ଆପଣଙ୍କ ଯାତ୍ରା ଆବଶ୍ୟକତା ବିଷୟରେ ଆମକୁ କୁହନ୍ତୁ...",
      sendMessageBtn: "ବାର୍ତ୍ତା ପଠାନ୍ତୁ",

      // Contact Info
      contactInfo: "ଯୋଗାଯୋଗ ସୂଚନା",
      helpline: "ହେଲ୍ପଲାଇନ୍",
      support24x7: "24/7 ସହାୟତା",
      whatsappService: "ହ୍ୱାଟସ୍‌ଆପ୍ ସେବା",
      instantResponse: "ତୁରନ୍ତ ପ୍ରତିକ୍ରିୟା",
      emailService: "ଇମେଲ୍ ସେବା",
      correspondence: "ବୃତ୍ତିଗତ ଚିଠି ବ୍ୟବହାର",

      // App Section
      mobileApp: "ନନ୍ଦୀଘୋଷ ମୋବାଇଲ୍ ଆପ୍",
      appDescription: "ଟିକେଟ୍ ବୁକ୍ କରନ୍ତୁ, ବସ୍ ଟ୍ରାକ୍ କରନ୍ତୁ, ଏବଂ ଚାଲିବା ସମୟରେ ଆପଣଙ୍କ ଯାତ୍ରା ପରିଚାଳନା କରନ୍ତୁ",
      appStore: "ଆପ୍ ଷ୍ଟୋର୍",
      googlePlay: "ଗୁଗଲ୍ ପ୍ଲେ",

      // Footer
      footerDescription: "2008 ଠାରୁ ଆରାମଦାୟକ ଏବଂ ବିଶ୍ୱସନୀୟ ବସ୍ ସେବା ସହିତ ଓଡ଼ିଶାକୁ ଯୋଡ଼ିବା।",
      quickLinks: "ଶୀଘ୍ର ଲିଙ୍କ",
      services: "ସେବା",
      onlineBooking: "ଅନଲାଇନ୍ ବୁକିଂ",
      acSleeper: "AC ସ୍ଲିପର୍",
      gpsTracking: "GPS ଟ୍ରାକିଂ",
      support: "24/7 ସହାୟତା",
      contactInfoFooter: "ଯୋଗାଯୋଗ ସୂଚନା",
      service24x7: "24/7 ସେବା",
      rightsReserved: "ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
      madeWith: "ଓଡ଼ିଶାରେ ❤️ ସହିତ ତିଆରି",
    },
  }

  useEffect(() => {
    // Real-time updates - update every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => observer.observe(el))

    // Simulate real-time seat availability
    const seatInterval = setInterval(() => {
      setSeatAvailability({
        "balasore-sambalpur": Math.floor(Math.random() * 20) + 5,
        "balasore-jamshedpur": Math.floor(Math.random() * 15) + 8,
        "balasore-berhampur": Math.floor(Math.random() * 25) + 10,
        "balasore-puri": Math.floor(Math.random() * 18) + 7,
      })
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(seatInterval)
      observer.disconnect()
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const routes = [
    {
      id: "balasore-sambalpur",
      from: {
        en: "Balasore",
        hi: "बालासोर",
        or: "ବାଲେଶ୍ୱର"
      },
      to: {
        en: "Sambalpur",
        hi: "संबलपुर", 
        or: "ସମ୍ବଲପୁର"
      },
      duration: "8 hours",
      price: "₹450",
      icon: "🏛️",
      distance: "320 km",
      stops: 8,
      nextDeparture: "2:30 PM",
      rating: 4.8,
      amenities: ["ac", "wifi", "meals", "entertainment"],
      description: {
        en: "Via Bhadrak - Cuttack Route",
        hi: "भद्रक - कटक मार्ग से",
        or: "ଭଦ୍ରକ - କଟକ ମାର୍ଗ ଦେଇ"
      },
    },
    {
      id: "balasore-jamshedpur",
      from: {
        en: "Balasore",
        hi: "बालासोर",
        or: "ବାଲେଶ୍ୱର"
      },
      to: {
        en: "Jamshedpur",
        hi: "जमशेदपुर",
        or: "ଜାମସେଦପୁର"
      },
      duration: "6 hours",
      price: "₹380",
      icon: "🏭",
      distance: "280 km",
      stops: 6,
      nextDeparture: "4:15 PM",
      rating: 4.7,
      amenities: ["ac", "wifi", "snacks", "usbCharging"],
      description: {
        en: "Direct Highway Route",
        hi: "सीधा राजमार्ग मार्ग",
        or: "ପ୍ରତ୍ୟକ୍ଷ ରାଜପଥ ମାର୍ଗ"
      },
    },
    {
      id: "balasore-berhampur",
      from: {
        en: "Balasore",
        hi: "बालासोर",
        or: "ବାଲେଶ୍ୱର"
      },
      to: {
        en: "Berhampur",
        hi: "बेरहामपुर",
        or: "ବ୍ରହ୍ମପୁର"
      },
      duration: "5 hours",
      price: "₹320",
      icon: "🏖️",
      distance: "240 km",
      stops: 5,
      nextDeparture: "6:00 PM",
      rating: 4.9,
      amenities: ["ac", "wifi", "refreshments", "blankets"],
      description: {
        en: "Coastal Highway Route",
        hi: "तटीय राजमार्ग मार्ग",
        or: "ଉପକୂଳ ରାଜପଥ ମାର୍ଗ"
      },
    },
    {
      id: "balasore-puri",
      from: {
        en: "Balasore",
        hi: "बालासोर",
        or: "ବାଲେଶ୍ୱର"
      },
      to: {
        en: "Puri",
        hi: "पुरी",
        or: "ପୁରୀ"
      },
      duration: "4 hours",
      price: "₹280",
      icon: "🏖️",
      distance: "200 km",
      stops: 4,
      nextDeparture: "5:00 AM",
      rating: 5.0,
      amenities: ["ac", "wifi", "refreshments", "entertainment"],
      description: {
        en: "Express Coastal Route",
        hi: "एक्सप्रेस तटीय मार्ग",
        or: "ଏକ୍ସପ୍ରେସ ଉପକୂଳ ମାର୍ଗ"
      },
      popular: true,
    },
  ]

  const features = [
    {
      icon: <Bus className="w-8 h-8 text-orange-600" />,
      titleKey: "acSleeperCoaches",
      descriptionKey: "acSleeperDesc",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      titleKey: "timelyDeparture",
      descriptionKey: "timelyDepartureDesc",
      color: "from-green-400 to-green-600",
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      titleKey: "safeSecure",
      descriptionKey: "safeSecureDesc",
      color: "from-red-400 to-red-600",
    },
    {
      icon: <Wifi className="w-8 h-8 text-orange-600" />,
      titleKey: "modernAmenities",
      descriptionKey: "modernAmenitiesDesc",
      color: "from-purple-400 to-purple-600",
    },
  ]

  const currentLang = languages[currentLanguage as keyof typeof languages]

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 z-[9999] flex items-center justify-center loading-container">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 loading-logo">
              <Image
                src="/images/nandighosh-logo-updated.png"
                alt="Nandighosh Logo"
                width={150}
                height={150}
                className="mx-auto object-contain animate-float"
              />
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-orange-600 mb-6 loading-text">
              Loading Nandighosh Experience...
            </h2>
            
            {/* Progress Bar Container */}
            <div className="w-80 mx-auto">
              <div className="bg-orange-100 rounded-full h-3 mb-3 overflow-hidden loading-progress shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out relative loading-progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-wave"></div>
                </div>
              </div>
              <p className="text-sm text-orange-600 font-semibold loading-text">{loadingProgress}%</p>
            </div>
            
            {/* Loading dots animation */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-1000"></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce animation-delay-2000"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 3;
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-300 rounded-full opacity-20 particle"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full navbar-glass z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4 hover-zone">
              <div className="relative">
                <Image
                  src="/images/nandighosh-logo-updated.png"
                  alt="Nandighosh Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain animate-pulse-glow"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-bounce"></div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white drop-shadow-lg">Nandighosh</span>
              </div>
            </div>

            {/* Language Selector & Time */}
            <div className="hidden lg:flex items-center space-x-6">
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                aria-label="Select language"
                title="Language selection"
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300 tilt-card"
              >
                <option value="en" className="text-gray-800">
                  🇬🇧 English
                </option>
                <option value="hi" className="text-gray-800">
                  🇮🇳 हिंदी
                </option>
                <option value="or" className="text-gray-800">
                  🏛️ ଓଡ଼ିଆ
                </option>
              </select>

              <div className="text-sm text-white/90 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 font-mono breathe">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-white/90 hover:text-white transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic"
              >
                {currentLang.home}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection("routes")}
                className="text-white/90 hover:text-white transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic"
              >
                {currentLang.routes}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-white/90 hover:text-white transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic"
              >
                {currentLang.features}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-white/90 hover:text-white transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic"
              >
                {currentLang.contact}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
              <Button
                onClick={() => scrollToSection("booking")}
                className="btn-interactive bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold ripple"
              >
                {currentLang.bookNow}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white hover:text-orange-200 transition-colors transform hover:scale-110 glitch"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20 backdrop-blur-sm">
              <div className="flex flex-col space-y-4 pt-4">
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  aria-label="Select language (mobile)"
                  title="Language selection"
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50"
                >
                  <option value="en" className="text-gray-800">
                    🇬🇧 English
                  </option>
                  <option value="hi" className="text-gray-800">
                    🇮🇳 हिंदी
                  </option>
                  <option value="or" className="text-gray-800">
                    🏛️ ଓଡ଼ିଆ
                  </option>
                </select>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="text-left text-white/90 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  🏠 {currentLang.home}
                </button>
                <button
                  onClick={() => scrollToSection("routes")}
                  className="text-left text-white/90 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  🛣️ {currentLang.routes}
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-white/90 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  ✨ {currentLang.features}
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-left text-white/90 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  📞 {currentLang.contact}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        className="pt-24 pb-20 hero-bg-livery1 relative overflow-hidden min-h-screen flex items-center parallax-hero"
        data-animate
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          {/* Enhanced Orange overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/85 via-orange-400/80 to-red-500/85"></div>
          {/* Additional Orange overlay */}
          <div className="absolute inset-0 bg-orange-600/25"></div>
          {/* Orange pattern overlay */}
          <div className="absolute inset-0 orange-pattern-overlay"></div>
          {/* Enhanced Orange Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/40 via-orange-300/30 to-red-200/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400/15 via-orange-300/20 to-orange-500/25"></div>

          {/* Animated Geometric Shapes */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse morph-bg"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000 morph-bg"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-gradient-to-r from-red-200/30 to-pink-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000 morph-bg"></div>

          {/* Premium Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid-pattern"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 hero-content-left">
              <div className="mb-6">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight stagger-child fade-in-up">
                  <span className="text-gradient-orange animate-text-glow animate-brand-bounce drop-shadow-2xl cursor-pointer">
                    Nandighosh
                  </span>
                </h1>

                <div className="space-y-3 mb-6">
                  <p className="text-xl lg:text-2xl text-white font-light tracking-wide stagger-child fade-in-up drop-shadow-md">{currentLang.tagline}</p>
                  <p className="text-lg lg:text-xl text-white/95 font-medium stagger-child fade-in-up drop-shadow-md">{currentLang.subtitle}</p>
                  <p className="text-sm lg:text-base text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed stagger-child fade-in-up drop-shadow-sm">
                    {currentLang.premiumSubtitle}
                  </p>
                </div>

                {/* Premium Features */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6 stagger-child fade-in-up">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-gray-800 font-medium">Award Winning</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-gray-800 font-medium">100% Safe</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <Star className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-gray-800 font-medium">5-Star Rated</span>
                  </div>
                </div>
              </div>

              {/* Premium CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 stagger-child fade-in-up">
                <Button
                  size="lg"
                  className="btn-interactive bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ripple"
                  onClick={() => scrollToSection("booking")}
                >
                  <Rocket className="mr-2 w-5 h-5 text-blue-600" />
                  {currentLang.bookSeat}
                  <ArrowRight className="ml-2 w-5 h-5 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/80 text-white hover:bg-white/20 hover:text-white px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm tilt-card shadow-lg"
                  onClick={() => scrollToSection("routes")}
                >
                  <MapPin className="mr-2 w-5 h-5" />
                  {currentLang.exploreRoutes}
                </Button>
              </div>

              {/* Premium Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0 stagger-child fade-in-up">
                <div className="text-center card-3d rounded-lg p-4 bg-white/95 backdrop-blur-sm border border-white/30 stagger-animation shadow-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1 breathe">50+</div>
                  <div className="text-xs text-gray-700 font-medium">{currentLang.dailyRoutes}</div>
                </div>
                <div className="text-center card-3d rounded-lg p-4 bg-white/95 backdrop-blur-sm border border-white/30 stagger-animation shadow-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1 breathe">10K+</div>
                  <div className="text-xs text-gray-700 font-medium">{currentLang.happyCustomers}</div>
                </div>
                <div className="text-center card-3d rounded-lg p-4 bg-white/95 backdrop-blur-sm border border-white/30 stagger-animation shadow-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1 breathe">15+</div>
                  <div className="text-xs text-gray-700 font-medium">{currentLang.yearsExperience}</div>
                </div>
                <div className="text-center card-3d rounded-lg p-4 bg-white/95 backdrop-blur-sm border border-white/30 stagger-animation shadow-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1 breathe">99.8%</div>
                  <div className="text-xs text-gray-700 font-medium">{currentLang.onTime}</div>
                </div>
              </div>
            </div>

            {/* Premium Bus Image */}
            <div className="lg:w-1/2 flex justify-center stagger-child fade-in-right hero-content-right">
              <div className="scale-in-container" data-animate>
                <div className="premium-bus-container">
                  {/* Image - now using simple positioning */}
                  <img 
                    src="/images/homepage.jpeg" 
                    alt="Premium Nandighosh Bus with Traditional Odisha Artwork"
                    className="premium-bus-image"
                  />
                </div>

                {/* Floating Elements */}
                <div className="floating-element floating-crown">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="floating-element floating-award">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 booking-bg-livery2" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100 magnetic stagger-child fade-in-up">
              {currentLang.quickBooking}
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-orange-400 stagger-child fade-in-up">{currentLang.bookJourney}</h2>
          </div>

          <Card className="max-w-4xl mx-auto card-ultra-3d border-0 booking-form stagger-child scale-in">
            <CardContent className="p-8">
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 card-3d">
                  <TabsTrigger value="search" className="ripple">
                    🔍 {currentLang.search}
                  </TabsTrigger>
                  <TabsTrigger value="track" className="ripple">
                    📍 {currentLang.track}
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="ripple">
                    📱 {currentLang.qrScan}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.from}</label>
                      <Input
                        placeholder={currentLang.departureCity}
                        className="border-orange-300 focus:border-orange-500 hover-lift"
                      />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.to}</label>
                      <Input
                        placeholder={currentLang.destinationCity}
                        className="border-orange-300 focus:border-orange-500 hover-lift"
                      />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.date}</label>
                      <Input type="date" className="border-orange-300 focus:border-orange-500 hover-lift" />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.passengers}</label>
                      <select 
                        aria-label="Number of passengers"
                        title="Select number of passengers"
                        className="w-full p-2 border border-orange-300 rounded-md focus:border-orange-500 hover-lift"
                      >
                        <option>1 Passenger</option>
                        <option>2 Passengers</option>
                        <option>3 Passengers</option>
                        <option>4+ Passengers</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full btn-interactive bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 text-lg font-semibold ripple">
                    <Navigation className="mr-2 w-5 h-5 text-blue-600" />
                    {currentLang.searchRoutes}
                  </Button>
                </TabsContent>

                <TabsContent value="track" className="space-y-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center card-3d">
                      <MapPin className="w-16 h-16 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{currentLang.liveTracking}</h3>
                    <Input placeholder={currentLang.enterTicket} className="max-w-md mx-auto mb-4 tilt-card" />
                    <Button className="bg-green-600 hover:bg-green-700 btn-interactive">
                      <Navigation className="mr-2 w-4 h-4 text-blue-600" />
                      {currentLang.trackBus}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center card-3d">
                      <QrCode className="w-16 h-16 text-blue-600 animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{currentLang.qrBooking}</h3>
                    <p className="text-gray-600 mb-4">{currentLang.qrDescription}</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 btn-interactive">
                      <QrCode className="mr-2 w-4 h-4 text-blue-600" />
                      {currentLang.openScanner}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Routes Section */}
      <section id="routes" className="py-20 bg-gradient-to-br from-orange-50 to-red-50" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-100 magnetic stagger-child fade-in-up">
              {currentLang.popularRoutes}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 stagger-child fade-in-up">{currentLang.premiumRoutes}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto stagger-child fade-in-up">{currentLang.routesDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {routes.map((route, index) => (
              <Card
                key={index}
                className="group card-ultra-3d border-0 shadow-lg overflow-hidden ring-2 ring-orange-300 hover:ring-orange-500 transition-all duration-500 stagger-child card-animate stagger-animation"
              >
                {route.popular && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-center py-2 text-sm font-semibold holographic">
                    ⭐ {currentLang.popularRoute} ⭐
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-4 animate-float">{route.icon}</div>
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {route.from[currentLanguage as keyof typeof route.from]} → {route.to[currentLanguage as keyof typeof route.to]}
                  </CardTitle>
                  <CardDescription className="text-orange-600 font-medium">{route.description[currentLanguage as keyof typeof route.description]}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Route Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 tilt-card">
                      <Clock className="w-4 h-4 mr-2 text-orange-600" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-600 tilt-card">
                      <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                      <span>{route.distance}</span>
                    </div>
                    <div className="flex items-center text-gray-600 tilt-card">
                      <Bus className="w-4 h-4 mr-2 text-orange-600" />
                      <span>
                        {route.stops} {currentLang.stops}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600 tilt-card">
                      <Clock className="w-4 h-4 mr-2 text-orange-600" />
                      <span>
                        {currentLang.next} {route.nextDeparture}
                      </span>
                    </div>
                  </div>

                  {/* Live Availability */}
                  <div className="card-3d rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{currentLang.liveAvailability}</span>
                      <span className="text-green-600 font-bold breathe">
                        {seatAvailability[route.id] || Math.floor(Math.random() * 20) + 5} {currentLang.seats}
                      </span>
                    </div>
                    <Progress value={((seatAvailability[route.id] || 15) / 40) * 100} className="h-2 bg-gray-200" />
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {route.amenities.map((amenity, i) => (
                      <Badge key={i} variant="secondary" className="text-xs magnetic">
                        {currentLang[amenity as keyof typeof currentLang]}
                      </Badge>
                    ))}
                  </div>

                  {/* Rating and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current animate-pulse" />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({route.rating})</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">{route.price}</div>
                  </div>

                  <Button
                    className={`w-full group-hover:shadow-lg transition-all duration-300 btn-interactive ${
                      route.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        : "bg-orange-600 hover:bg-orange-700"
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    {route.popular ? <Crown className="mr-2 w-4 h-4 text-orange-600" /> : <Bus className="mr-2 w-4 h-4 text-orange-600" />}
                    {currentLang.bookRoute}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-600" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 features-bg-livery2 relative" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 magnetic stagger-child fade-in-up">
              {currentLang.whyChooseUs}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-orange-400 stagger-child fade-in-up">{currentLang.premiumExperience}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto stagger-child fade-in-up">{currentLang.featuresDescription}</p>
          </div>

          <Card className="card-ultra-3d border-0 p-8 mb-16 stagger-child scale-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-105 transition-transform duration-300 tilt-card stagger-child fade-in-up stagger-animation"
                >
                  <div
                    className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300 card-3d`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {currentLang[feature.titleKey as keyof typeof currentLang]}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{currentLang[feature.descriptionKey as keyof typeof currentLang]}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Bus Fleet Showcase */}
          <div className="mt-16 modern-card">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Premium Fleet</h3>
            <div className="bus-fleet-container">
              {/* Fallback content */}
              <div className="bus-fleet-fallback">
                <div className="text-center">
                  <Bus className="w-16 h-16 mx-auto mb-2" />
                  <h4 className="text-xl font-bold">Bus Fleet</h4>
                  <p className="text-sm">Modern & Comfortable</p>
                </div>
              </div>
              
              {/* Image */}
              <img 
                src="/images/buses2.jpeg" 
                alt="Nandighosh Bus Fleet"
              />
              
              {/* Text Overlay */}
              <div className="bus-fleet-text-overlay">
                <h4 className="text-2xl font-bold mb-2">Modern & Comfortable Fleet</h4>
                <p className="text-lg opacity-90">Experience luxury travel with our state-of-the-art buses</p>
              </div>
            </div>
          </div>

          {/* Additional Features Grid with Interior Image */}
          <div className="mt-16 bg-gradient-to-br from-orange-900 to-red-900 rounded-3xl p-12 shadow-lg relative overflow-hidden">
            <h3 className="text-3xl font-bold text-center text-white mb-8">{currentLang.additionalAmenities}</h3>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Interior Image */}
              <div className="amenities-image-container">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/interior.jpeg"
                    alt="Luxury Bus Interior"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-xl font-bold mb-1">Luxury Interior</h4>
                    <p className="text-sm opacity-90">Premium comfort & style</p>
                  </div>
                </div>
              </div>

              {/* Right side - Amenities Grid */}
              <div>
                <p className="text-orange-200 mb-8 text-lg text-center lg:text-left">Experience luxury and comfort in our premium bus interiors</p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: <Coffee className="w-5 h-5 text-orange-400" />, text: "Refreshments" },
                    { icon: <Wifi className="w-5 h-5 text-orange-400" />, text: "Free WiFi" },
                    { icon: <CheckCircle className="w-5 h-5 text-orange-400" />, text: "Clean Toilets" },
                    { icon: <Shield className="w-5 h-5 text-orange-400" />, text: "GPS Tracking" },
                    { icon: <Bus className="w-5 h-5 text-orange-400" />, text: "Comfortable Seats" },
                    { icon: <Clock className="w-5 h-5 text-orange-400" />, text: "On-Time Service" },
                    { icon: <Phone className="w-5 h-5 text-orange-400" />, text: "24/7 Support" },
                    { icon: <Star className="w-5 h-5 text-orange-400" />, text: "Premium Service" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30 magnetic border border-white/20"
                    >
                      <div className="mb-2 flex justify-center">{item.icon}</div>
                      <div className="font-semibold text-white text-sm">{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-orange-50 to-red-50" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 magnetic stagger-child fade-in-up">
              {currentLang.getInTouch}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 stagger-child fade-in-up">{currentLang.beginJourney}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto stagger-child fade-in-up">{currentLang.contactDescription}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="card-ultra-3d border-0 stagger-child fade-in-left">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Mail className="mr-2 w-6 h-6 text-orange-600" />
                  {currentLang.sendMessage}
                </CardTitle>
                <CardDescription className="text-gray-600">{currentLang.formDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="tilt-card">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.firstName}</label>
                    <Input placeholder="John" className="border-orange-300 focus:border-orange-500 hover-lift" />
                  </div>
                  <div className="tilt-card">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.lastName}</label>
                    <Input placeholder="Doe" className="border-orange-300 focus:border-orange-500 hover-lift" />
                  </div>
                </div>
                <div className="tilt-card">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.email}</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="border-orange-300 focus:border-orange-500 hover-lift"
                  />
                </div>
                <div className="tilt-card">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.phone}</label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="border-orange-300 focus:border-orange-500 hover-lift"
                  />
                </div>
                <div className="tilt-card">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.route}</label>
                  <select 
                    aria-label="Select route"
                    title="Select your travel route"
                    className="w-full p-2 border border-orange-300 rounded-md focus:border-orange-500 hover-lift"
                  >
                    <option>Select your destination</option>
                    <option>Balasore to Puri</option>
                    <option>Balasore to Sambalpur</option>
                    <option>Balasore to Jamshedpur</option>
                    <option>Balasore to Berhampur</option>
                  </select>
                </div>
                <div className="tilt-card">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.message}</label>
                  <Textarea
                    placeholder={currentLang.travelRequirements}
                    className="border-orange-300 focus:border-orange-500 min-h-[120px] hover-lift"
                  />
                </div>
                <Button className="w-full btn-interactive bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 text-lg font-semibold ripple">
                  <Mail className="mr-2 w-5 h-5 text-orange-600" />
                  {currentLang.sendMessageBtn}
                  <ArrowRight className="ml-2 w-5 h-5 text-orange-600" />
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8 stagger-child fade-in-right">
              {/* Contact Information */}
              <Card className="card-ultra-3d border-0 stagger-animation">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">{currentLang.contactInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4 tilt-card">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center card-3d">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{currentLang.helpline}</div>
                      <div className="text-gray-600">+91 98765 43210</div>
                      <div className="text-sm text-green-600">{currentLang.support24x7}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 tilt-card">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center card-3d">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{currentLang.whatsappService}</div>
                      <div className="text-gray-600">+91 98765 43210</div>
                      <div className="text-sm text-green-600">{currentLang.instantResponse}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 tilt-card">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center card-3d">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{currentLang.emailService}</div>
                      <div className="text-gray-600">info@nandighoshbus.com</div>
                      <div className="text-sm text-blue-600">{currentLang.correspondence}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Download */}
              <Card className="card-ultra-3d border-0 text-gray-900">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 animate-float">📱</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{currentLang.mobileApp}</h3>
                  <p className="mb-6 text-gray-700">{currentLang.appDescription}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="bg-gray-900 rounded-lg px-6 py-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors tilt-card">
                      <div className="text-2xl">🍎</div>
                      <div className="text-white">
                        <div className="text-xs opacity-75">Download on the</div>
                        <div className="font-semibold">{currentLang.appStore}</div>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg px-6 py-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors tilt-card">
                      <div className="text-2xl">🤖</div>
                      <div className="text-white">
                        <div className="text-xs opacity-75">Get it on</div>
                        <div className="font-semibold">Google Play</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Status */}
              <Card className="card-ultra-3d border-0 text-gray-900">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                    Service Status
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center space-x-2 tilt-card">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>All routes operating normally</span>
                    </div>
                    <div className="flex items-center space-x-2 tilt-card">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>
                        Weather: {weatherData.condition}, {weatherData.temp}°C
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 tilt-card">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Next departure in 15 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-bg-livery1 text-white py-16 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-overlay">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-400/20 to-red-500/20 animate-pulse morph-bg"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Company Info */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/nandighosh-logo-updated.png"
                alt="Nandighosh Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain animate-pulse-glow"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Nandighosh</h3>
            <p className="text-orange-200">{currentLang.tagline}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="tilt-card">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/images/nandighosh-logo-updated.png"
                  alt="Nandighosh Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="text-xl font-bold text-white">Nandighosh</span>
                </div>
              </div>
              <p className="text-orange-200 mb-4">{currentLang.footerDescription}</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors magnetic">
                  <span className="text-sm">📘</span>
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors magnetic">
                  <span className="text-sm">🐦</span>
                </div>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors magnetic">
                  <span className="text-sm">📷</span>
                </div>
              </div>
            </div>

            <div className="tilt-card">
              <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Navigation className="mr-2 w-5 h-5 text-orange-600" />
                {currentLang.quickLinks}
              </h4>
              <ul className="space-y-2 text-orange-200">
                <li>
                  <button
                    onClick={() => scrollToSection("hero")}
                    className="hover:text-white transition-colors magnetic"
                  >
                    🏠 {currentLang.home}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("routes")}
                    className="hover:text-white transition-colors magnetic"
                  >
                    🛣️ {currentLang.routes}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors magnetic"
                  >
                    ✨ {currentLang.features}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="hover:text-white transition-colors magnetic"
                  >
                    📞 {currentLang.contact}
                  </button>
                </li>
              </ul>
            </div>

            <div className="tilt-card">
              <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
                {currentLang.services}
              </h4>
              <ul className="space-y-2 text-orange-200">
                <li className="hover:text-white transition-colors cursor-pointer magnetic">
                  🎫 {currentLang.onlineBooking}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer magnetic">
                  ❄️ {currentLang.acSleeper}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer magnetic">
                  📍 {currentLang.gpsTracking}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer magnetic">🕒 {currentLang.support}</li>
              </ul>
            </div>

            <div className="tilt-card">
              <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Phone className="mr-2 w-5 h-5" />
                {currentLang.contactInfoFooter}
              </h4>
              <ul className="space-y-2 text-orange-200">
                <li className="magnetic">📞 +91 98765 43210</li>
                <li className="magnetic">📧 info@nandighoshbus.com</li>
                <li className="magnetic">📍 Balasore, Odisha</li>
                <li className="magnetic">🕒 {currentLang.service24x7}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-orange-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-orange-200 mb-4 md:mb-0">
                <p>
                  &copy; {new Date().getFullYear()} Nandighosh. {currentLang.rightsReserved}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-orange-200">
                <span className="breathe">{currentLang.madeWith}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 card-3d animate-pulse-glow"
          onClick={() => window.open("https://wa.me/919876543210", "_blank")}
        >
          <MessageCircle className="w-8 h-8 text-orange-600" />
        </Button>
      </div>
      </div>
    </>
  )
}
