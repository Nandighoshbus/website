"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, MapPin, Clock, Star, ArrowRight, Navigation, Percent, Gift, Calendar, Users } from "lucide-react"
import RouteMap from "@/components/ui/RouteMap"

const languages = {
  en: {
    ourRoutes: "Our Routes",
    popularDestinations: "Popular Destinations",
    routesDescription: "Discover our extensive network of routes connecting major cities across Odisha and beyond",
    departure: "Departure",
    arrival: "Arrival",
    duration: "Duration",
    fare: "Starting Fare",
    bookNow: "Book Now",
    daily: "Daily",
    acSleeper: "AC Sleeper",
    semiSleeper: "Semi Sleeper",
    specialOffers: "Special Offers",
    offersDescription: "Save more on your journey with our exclusive deals and discounts",
    validTill: "Valid Till",
  },
  hi: {
    ourRoutes: "हमारे रूट्स",
    popularDestinations: "लोकप्रिय गंतव्य",
    routesDescription: "ओडिशा और उसके आसपास के प्रमुख शहरों को जोड़ने वाले हमारे व्यापक नेटवर्क की खोज करें",
    departure: "प्रस्थान",
    arrival: "आगमन",
    duration: "अवधि",
    fare: "शुरुआती किराया",
    bookNow: "बुक करें",
    daily: "दैनिक",
    acSleeper: "एसी स्लीपर",
    semiSleeper: "सेमी स्लीपर",
    specialOffers: "विशेष ऑफर",
    offersDescription: "हमारे एक्सक्लूसिव डील्स और छूट के साथ अपनी यात्रा पर अधिक बचत करें",
    validTill: "तक वैध",
  },
  or: {
    ourRoutes: "ଆମର ମାର୍ଗ",
    popularDestinations: "ଲୋକପ୍ରିୟ ଗନ୍ତବ୍ୟ",
    routesDescription: "ଓଡ଼ିଶା ଏବଂ ଏହାର ଆଖପାଖ ମୁଖ୍ୟ ସହରଗୁଡ଼ିକୁ ସଂଯୋଗ କରୁଥିବା ଆମର ବ୍ୟାପକ ନେଟୱାର୍କ ଆବିଷ୍କାର କରନ୍ତୁ",
    departure: "ପ୍ରସ୍ଥାନ",
    arrival: "ଆଗମନ",
    duration: "ଅବଧି",
    fare: "ପ୍ରାରମ୍ଭିକ ଭଡ଼ା",
    bookNow: "ବୁକ୍ କରନ୍ତୁ",
    daily: "ଦୈନିକ",
    acSleeper: "ଏସି ସ୍ଲିପର",
    semiSleeper: "ସେମି ସ୍ଲିପର",
    specialOffers: "ସ୍ପେଶାଲ ଅଫର",
    offersDescription: "ଆମର ଏକ୍ସକ୍ଲୁସିଭ ଡିଲ ଏବଂ ରିହାତି ସହିତ ଆପଣଙ୍କ ଯାତ୍ରାରେ ଅଧିକ ସଞ୍ଚୟ କରନ୍ତୁ",
    validTill: "ପର୍ଯ୍ୟନ୍ତ ବୈଧ",
  }
}

const routes = [
  {
    from: "Balasore",
    to: "Bhubaneswar",
    duration: "3h 30m",
    fare: "₹450",
    frequency: "6 times daily",
    busType: "AC Sleeper",
    popularity: "high"
  },
  {
    from: "Bhubaneswar", 
    to: "Cuttack",
    duration: "1h 15m",
    fare: "₹150",
    frequency: "12 times daily",
    busType: "Semi Sleeper",
    popularity: "high"
  },
  {
    from: "Bhubaneswar",
    to: "Puri",
    duration: "1h 45m",
    fare: "₹200",
    frequency: "8 times daily", 
    busType: "AC Sleeper",
    popularity: "high"
  },
  {
    from: "Balasore",
    to: "Kolkata",
    duration: "4h 30m",
    fare: "₹650",
    frequency: "4 times daily",
    busType: "AC Sleeper",
    popularity: "medium"
  },
  {
    from: "Bhubaneswar",
    to: "Berhampur",
    duration: "4h 00m", 
    fare: "₹400",
    frequency: "5 times daily",
    busType: "Semi Sleeper",
    popularity: "medium"
  },
  {
    from: "Cuttack",
    to: "Sambalpur",
    duration: "5h 30m",
    fare: "₹500",
    frequency: "3 times daily",
    busType: "AC Sleeper", 
    popularity: "medium"
  },
  {
    from: "Bhubaneswar",
    to: "Rourkela",
    duration: "6h 00m",
    fare: "₹550",
    frequency: "3 times daily",
    busType: "AC Sleeper",
    popularity: "medium"
  },
  {
    from: "Berhampur",
    to: "Koraput",
    duration: "3h 45m",
    fare: "₹350",
    frequency: "4 times daily",
    busType: "Semi Sleeper",
    popularity: "medium"
  }
]

const topOffers = [
  {
    id: 1,
    title: "Early Bird Special",
    description: "Book 7 days in advance and save up to 20%",
    discount: "20%",
    validTill: "31st Dec 2025",
    icon: <Calendar className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    badge: "LIMITED TIME"
  },
  {
    id: 2,
    title: "Weekend Getaway",
    description: "Special weekend packages with 25% off on return journeys",
    discount: "25%",
    validTill: "Every Weekend",
    icon: <MapPin className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
    badge: "WEEKEND ONLY"
  },
  {
    id: 3,
    title: "Group Booking",
    description: "Book for 10+ passengers and get up to 30% group discount",
    discount: "30%",
    validTill: "Year Round",
    icon: <Users className="w-5 h-5" />,
    color: "from-teal-500 to-blue-500",
    badge: "GROUP SPECIAL"
  },
  {
    id: 4,
    title: "Festival Special",
    description: "Special discounts during festivals and holiday seasons",
    discount: "Up to 35%",
    validTill: "During Festivals",
    icon: <Gift className="w-5 h-5" />,
    color: "from-yellow-500 to-orange-500",
    badge: "FESTIVAL OFFER"
  }
]

interface RoutesPageProps {
  currentLanguage: string
}

export default function RoutesPage({ currentLanguage }: RoutesPageProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const currentLang = languages[currentLanguage as keyof typeof languages]

  // Handle hash navigation to scroll to offers section
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#offers') {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        const offersSection = document.getElementById('offers')
        if (offersSection) {
          offersSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 100)
    }
  }, [])

  const filteredRoutes = routes.filter(route => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "popular") return route.popularity === "high"
    if (selectedFilter === "ac") return route.busType === "AC Sleeper"
    if (selectedFilter === "semi") return route.busType === "Semi Sleeper"
    return true
  })

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {currentLang.ourRoutes}
          </h1>
          <p className="text-xl mb-2">{currentLang.popularDestinations}</p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            {currentLang.routesDescription}
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-gray-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedFilter === "all"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Routes
            </button>
            <button
              onClick={() => setSelectedFilter("popular")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedFilter === "popular"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSelectedFilter("ac")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedFilter === "ac"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {currentLang.acSleeper}
            </button>
            <button
              onClick={() => setSelectedFilter("semi")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedFilter === "semi"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {currentLang.semiSleeper}
            </button>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map((route, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={`${
                        route.popularity === "high" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {route.popularity === "high" ? "Popular" : route.busType}
                    </Badge>
                    <div className="flex items-center text-orange-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{route.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{route.from}</div>
                        <div className="text-xs text-gray-500">{currentLang.departure}</div>
                      </div>
                      
                      <div className="flex items-center px-3">
                        <ArrowRight className="w-5 h-5 text-orange-500" />
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{route.to}</div>
                        <div className="text-xs text-gray-500">{currentLang.arrival}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{route.fare}</div>
                      <div className="text-sm text-gray-500">{currentLang.fare}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700">{route.frequency}</div>
                      <div className="text-sm text-gray-500">Frequency</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Bus className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{route.busType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    {currentLang.bookNow}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section id="offers" className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentLang.specialOffers}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {currentLang.offersDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topOffers.map((offer) => (
              <Card key={offer.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${offer.color}`}></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${offer.color} text-white`}>
                      {offer.icon}
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs font-semibold">
                      {offer.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {offer.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {offer.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Discount Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Percent className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{offer.discount}</span>
                      <span className="text-gray-500 text-sm">OFF</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{currentLang.validTill}</p>
                      <p className="text-xs font-semibold text-gray-800">{offer.validTill}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Route Map */}
      <RouteMap currentLanguage={currentLanguage} />

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Route Network
            </h2>
            <p className="text-xl text-gray-600">
              Connecting major cities across Odisha and neighboring states
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["Balasore", "Bhubaneswar", "Cuttack", "Puri", "Berhampur", "Sambalpur", "Kolkata", "Rourkela", "Koraput"].map((city, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 hover:bg-white/90 transition-all cursor-pointer"
                  >
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-700">{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
