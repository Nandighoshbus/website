"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation, MapPin, QrCode, Calendar, Users, ArrowRight, Clock, Shield, Smartphone, ArrowUpDown, Wind, Bed, IndianRupee, Bus } from "lucide-react"

const languages = {
  en: {
    quickBooking: "Quick Booking",
    bookJourney: "Book Your Journey",
    search: "Search",
    track: "Track",
    qrScan: "QR Scan",
    hireBus: "Hire Bus",
    from: "From",
    to: "To", 
    date: "Date",
    passengers: "Passengers",
    busType: "Bus Type",
    seatType: "Seat Type",
    departureCity: "Departure City",
    destinationCity: "Destination City",
    acBus: "AC Bus",
    normalBus: "Non-AC Bus",
    seater: "Seater",
    sleeper: "Sleeper",
    estimatedPrice: "Estimated Price",
    searchRoutes: "Search Routes",
    liveTracking: "Live Bus Tracking",
    enterTicket: "Enter your ticket number",
    trackBus: "Track My Bus",
    qrBooking: "QR Code Booking",
    qrDescription: "Scan QR code for instant booking and easy access to your tickets",
    openScanner: "Open QR Scanner",
  },
  hi: {
    quickBooking: "त्वरित बुकिंग",
    bookJourney: "अपनी यात्रा बुक करें",
    search: "खोजें",
    track: "ट्रैक करें",
    qrScan: "क्यूआर स्कैन",
    hireBus: "बस किराए पर लें",
    from: "से",
    to: "तक",
    date: "तारीख",
    passengers: "यात्री",
    busType: "बस प्रकार",
    seatType: "सीट प्रकार",
    departureCity: "प्रस्थान शहर",
    destinationCity: "गंतव्य शहर",
    acBus: "AC बस",
    normalBus: "नॉन-AC बस",
    seater: "सीटर",
    sleeper: "स्लीपर",
    estimatedPrice: "अनुमानित मूल्य",
    searchRoutes: "मार्ग खोजें",
    liveTracking: "लाइव बस ट्रैकिंग",
    enterTicket: "अपना टिकट नंबर दर्ज करें",
    trackBus: "मेरी बस ट्रैक करें",
    qrBooking: "क्यूआर कोड बुकिंग",
    qrDescription: "तत्काल बुकिंग और अपने टिकटों तक आसान पहुंच के लिए क्यूआर कोड स्कैन करें",
    openScanner: "क्यूआर स्कैनर खोलें",
  },
  or: {
    quickBooking: "ଦ୍ରୁତ ବୁକିଂ",
    bookJourney: "ଆପଣଙ୍କ ଯାତ୍ରା ବୁକ୍ କରନ୍ତୁ",
    search: "ଖୋଜନ୍ତୁ",
    track: "ଟ୍ରାକ୍ କରନ୍ତୁ",
    qrScan: "କ୍ୟୁଆର୍ ସ୍କାନ୍",
    hireBus: "ବସ୍ ଭଡ଼ାରେ ନିଅନ୍ତୁ",
    from: "ଠାରୁ",
    to: "ପର୍ଯ୍ୟନ୍ତ",
    date: "ତାରିଖ",
    passengers: "ଯାତ୍ରୀ",
    busType: "ବସ୍ ପ୍ରକାର",
    seatType: "ସିଟ୍ ପ୍ରକାର",
    departureCity: "ପ୍ରସ୍ଥାନ ସହର",
    destinationCity: "ଗନ୍ତବ୍ୟ ସହର",
    acBus: "AC ବସ୍",
    normalBus: "ନନ୍-AC ବସ୍",
    seater: "ସିଟର୍",
    sleeper: "ସ୍ଲିପର୍",
    estimatedPrice: "ଆନୁମାନିକ ମୂଲ୍ୟ",
    searchRoutes: "ମାର୍ଗ ଖୋଜନ୍ତୁ",
    liveTracking: "ଲାଇଭ୍ ବସ୍ ଟ୍ରାକିଂ",
    enterTicket: "ଆପଣଙ୍କର ଟିକେଟ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ",
    trackBus: "ମୋର ବସ୍ ଟ୍ରାକ୍ କରନ୍ତୁ",
    qrBooking: "କ୍ୟୁଆର୍ କୋଡ୍ ବୁକିଂ",
    qrDescription: "ତତକ୍ଷଣାତ ବୁକିଂ ଏବଂ ଆପଣଙ୍କ ଟିକେଟଗୁଡ଼ିକର ସହଜ ପ୍ରବେଶ ପାଇଁ କ୍ୟୁଆର୍ କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ",
    openScanner: "କ୍ୟୁଆର୍ ସ୍କାନର୍ ଖୋଲନ୍ତୁ",
  }
}

const cities = [
  "Balasore",
  "Bhubaneswar", 
  "Cuttack",
  "Puri",
  "Berhampur",
  "Sambalpur",
  "Kolkata",
  "Rourkela",
  "Koraput"
]

interface BookingPageProps {
  currentLanguage: string
}

export default function BookingPage({ currentLanguage }: BookingPageProps) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    busType: 'ac', // ac or normal
    seatType: 'seat', // seat or sleeper
    ticketNumber: ''
  })

  const currentLang = languages[currentLanguage as keyof typeof languages]

  // Route distances (in km) - approximate distances between cities
  const routeDistances: { [key: string]: number } = {
    'Balasore-Bhubaneswar': 210,
    'Balasore-Cuttack': 190,
    'Balasore-Puri': 260,
    'Balasore-Berhampur': 350,
    'Balasore-Sambalpur': 400,
    'Balasore-Kolkata': 240,
    'Balasore-Rourkela': 450,
    'Balasore-Koraput': 500,
    'Bhubaneswar-Cuttack': 25,
    'Bhubaneswar-Puri': 60,
    'Bhubaneswar-Berhampur': 170,
    'Bhubaneswar-Sambalpur': 280,
    'Bhubaneswar-Kolkata': 450,
    'Bhubaneswar-Rourkela': 340,
    'Bhubaneswar-Koraput': 450,
    'Cuttack-Puri': 80,
    'Cuttack-Berhampur': 190,
    'Cuttack-Sambalpur': 260,
    'Cuttack-Kolkata': 470,
    'Cuttack-Rourkela': 320,
    'Cuttack-Koraput': 430,
    'Puri-Berhampur': 140,
    'Puri-Sambalpur': 340,
    'Puri-Kolkata': 510,
    'Puri-Rourkela': 400,
    'Puri-Koraput': 390,
    'Berhampur-Sambalpur': 450,
    'Berhampur-Kolkata': 620,
    'Berhampur-Rourkela': 520,
    'Berhampur-Koraput': 250,
    'Sambalpur-Kolkata': 730,
    'Sambalpur-Rourkela': 160,
    'Sambalpur-Koraput': 600,
    'Kolkata-Rourkela': 570,
    'Kolkata-Koraput': 870,
    'Rourkela-Koraput': 740
  }

  const calculateEstimatedPrice = () => {
    if (!formData.from || !formData.to || formData.from === formData.to) {
      return 0
    }

    // Get route key (alphabetically sorted to handle both directions)
    const routeKey = [formData.from, formData.to].sort().join('-')
    const distance = routeDistances[routeKey] || 200 // Default distance if route not found

    // Base price per km
    let baseRatePerKm = 1.5 // Base rate for normal seater

    // Adjust for bus type
    if (formData.busType === 'ac') {
      baseRatePerKm *= 1.4 // AC buses cost 40% more
    }

    // Adjust for seat type
    if (formData.seatType === 'sleeper') {
      baseRatePerKm *= 1.6 // Sleeper costs 60% more
    }

    // Calculate base price
    const basePrice = distance * baseRatePerKm
    
    // Multiply by number of passengers
    const totalPrice = basePrice * parseInt(formData.passengers)

    return Math.round(totalPrice)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search submitted:', formData)
    // Add search logic here
  }

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Tracking ticket:', formData.ticketNumber)
    // Add tracking logic here
  }

  const handleSwapCities = () => {
    setFormData({
      ...formData,
      from: formData.to,
      to: formData.from
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="pt-20 pb-12 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mt-4 mb-3 bg-white/20 text-white hover:bg-white/20 backdrop-blur-sm border-white/30 px-4 py-2 text-sm font-medium">
              {currentLang.quickBooking}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {currentLang.bookJourney}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Book your comfortable journey with Nandighosh Bus Service - Simple, Fast, and Reliable
            </p>
          </div>
        </div>
      </div>

      {/* Main Booking Section */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-4 p-1 h-auto bg-gray-100 rounded-t-lg">
                <TabsTrigger 
                  value="search" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  {currentLang.search}
                </TabsTrigger>
                <TabsTrigger 
                  value="track" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  {currentLang.track}
                </TabsTrigger>
                <TabsTrigger 
                  value="hire" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Bus className="w-4 h-4" />
                  {currentLang.hireBus}
                </TabsTrigger>
                <TabsTrigger 
                  value="qr" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  {currentLang.qrScan}
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="search" className="mt-0">
                  <form onSubmit={handleSearch} className="space-y-6">
                    {/* From and To Cities Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          {currentLang.from}
                        </label>
                        <select
                          name="from"
                          title="Select departure city"
                          aria-label="Departure city"
                          className="w-full h-12 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 bg-white"
                          value={formData.from}
                          onChange={handleInputChange}
                        >
                          <option value="">{currentLang.departureCity}</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                          {currentLang.to}
                        </label>
                        <div className="flex gap-2">
                          <select
                            name="to"
                            title="Select destination city"
                            aria-label="Destination city"
                            className="w-full h-12 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 bg-white"
                            value={formData.to}
                            onChange={handleInputChange}
                          >
                            <option value="">{currentLang.destinationCity}</option>
                            {cities.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          {/* Swap Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleSwapCities}
                            className="h-12 w-12 border-orange-200 hover:border-orange-400 hover:bg-orange-50 flex-shrink-0"
                            title="Swap cities"
                            aria-label="Swap departure and destination cities"
                          >
                            <ArrowUpDown className="w-4 h-4 text-orange-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Date and Passengers Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          {currentLang.date}
                        </label>
                        <Input 
                          name="date"
                          type="date" 
                          className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-500" />
                          {currentLang.passengers}
                        </label>
                        <select 
                          name="passengers"
                          title="Select number of passengers"
                          aria-label="Number of passengers"
                          className="w-full h-12 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 bg-white"
                          value={formData.passengers}
                          onChange={handleInputChange}
                        >
                          <option value="1">1 Passenger</option>
                          <option value="2">2 Passengers</option>
                          <option value="3">3 Passengers</option>
                          <option value="4">4+ Passengers</option>
                        </select>
                      </div>
                    </div>

                    {/* Bus Preferences Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Wind className="w-4 h-4 text-orange-500" />
                          {currentLang.busType}
                        </label>
                        <select 
                          name="busType"
                          title="Select bus type"
                          aria-label="Bus type preference"
                          className="w-full h-12 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 bg-white"
                          value={formData.busType}
                          onChange={handleInputChange}
                        >
                          <option value="ac">{currentLang.acBus}</option>
                          <option value="normal">{currentLang.normalBus}</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Bed className="w-4 h-4 text-orange-500" />
                          {currentLang.seatType}
                        </label>
                        <select 
                          name="seatType"
                          title="Select seat type"
                          aria-label="Seat type preference"
                          className="w-full h-12 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 bg-white"
                          value={formData.seatType}
                          onChange={handleInputChange}
                        >
                          <option value="seat">{currentLang.seater}</option>
                          <option value="sleeper">{currentLang.sleeper}</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Estimated Price Display */}
                    {formData.from && formData.to && formData.from !== formData.to && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="w-5 h-5 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-900">
                              {currentLang.estimatedPrice}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ₹{calculateEstimatedPrice().toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-sm text-blue-700 mt-2">
                          {formData.passengers} passenger{parseInt(formData.passengers) > 1 ? 's' : ''} • {formData.busType.toUpperCase()} • {formData.seatType.charAt(0).toUpperCase() + formData.seatType.slice(1)}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg"
                    >
                      <Navigation className="mr-2 w-5 h-5" />
                      {currentLang.searchRoutes}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="track" className="mt-0">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {currentLang.liveTracking}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Enter your ticket number to track your bus location in real-time
                    </p>
                    <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
                      <Input 
                        name="ticketNumber"
                        placeholder={currentLang.enterTicket} 
                        className="h-12 text-center text-lg font-medium border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                        value={formData.ticketNumber}
                        onChange={handleInputChange}
                      />
                      <Button 
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg"
                      >
                        <Navigation className="mr-2 w-5 h-5" />
                        {currentLang.trackBus}
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="hire" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Bus className="w-10 h-10 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        Hire Bus for Events & Groups
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Need a bus for corporate events, school trips, or family gatherings? Get customized bus rental solutions.
                      </p>
                    </div>
                    
                    <form className="space-y-6 max-w-2xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Pickup Location
                          </label>
                          <Input 
                            placeholder="Enter pickup location" 
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Destination
                          </label>
                          <Input 
                            placeholder="Enter destination" 
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            Journey Date
                          </label>
                          <Input 
                            type="date" 
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            Number of Passengers
                          </label>
                          <select 
                            className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500"
                            aria-label="Number of passengers"
                          >
                            <option value="">Select passengers</option>
                            <option value="10-20">10-20 passengers</option>
                            <option value="21-35">21-35 passengers</option>
                            <option value="36-50">36-50 passengers</option>
                            <option value="50+">More than 50</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Bus className="w-4 h-4 text-orange-500" />
                            Bus Type
                          </label>
                          <select 
                            className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500"
                            aria-label="Bus type"
                          >
                            <option value="">Select bus type</option>
                            <option value="ac-seater">AC Seater</option>
                            <option value="non-ac-seater">Non-AC Seater</option>
                            <option value="ac-sleeper">AC Sleeper</option>
                            <option value="luxury">Luxury Coach</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            Duration
                          </label>
                          <select 
                            className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500"
                            aria-label="Duration"
                          >
                            <option value="">Select duration</option>
                            <option value="one-way">One Way</option>
                            <option value="round-trip">Round Trip</option>
                            <option value="multi-day">Multi-day Trip</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Additional Requirements
                        </label>
                        <textarea 
                          placeholder="Tell us about your specific requirements, event details, or any special requests..."
                          className="w-full h-24 px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 resize-none"
                        ></textarea>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold h-12">
                        <Bus className="mr-2 w-5 h-5" />
                        Get Quote for Bus Hire
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="mt-0">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {currentLang.qrBooking}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      {currentLang.qrDescription}
                    </p>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-3 h-12">
                      <QrCode className="mr-2 w-5 h-5" />
                      {currentLang.openScanner}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-16 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Nandighosh?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the best in bus travel with our premium services and customer-first approach</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Quick Booking</h3>
                <p className="text-gray-600 leading-relaxed">Book your tickets in just a few clicks with our streamlined booking process</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Digital Tickets</h3>
                <p className="text-gray-600 leading-relaxed">Get instant mobile tickets with QR codes - no printing required, eco-friendly travel</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Secure & Safe</h3>
                <p className="text-gray-600 leading-relaxed">Bank-level security for payments and GPS tracking for your peace of mind</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
