"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation, MapPin, QrCode } from "lucide-react"

const languages = {
  en: {
    quickBooking: "Quick Booking",
    bookJourney: "Book Your Journey",
    search: "Search",
    track: "Track",
    qrScan: "QR Scan",
    from: "From",
    to: "To", 
    date: "Date",
    passengers: "Passengers",
    departureCity: "Departure City",
    destinationCity: "Destination City",
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
    from: "ଠାରୁ",
    to: "ପର୍ଯ୍ୟନ୍ତ",
    date: "ତାରିଖ",
    passengers: "ଯାତ୍ରୀ",
    departureCity: "ପ୍ରସ୍ଥାନ ସହର",
    destinationCity: "ଗନ୍ତବ୍ୟ ସହର",
    searchRoutes: "ମାର୍ଗ ଖୋଜନ୍ତୁ",
    liveTracking: "ଲାଇଭ୍ ବସ୍ ଟ୍ରାକିଂ",
    enterTicket: "ଆପଣଙ୍କର ଟିକେଟ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ",
    trackBus: "ମୋର ବସ୍ ଟ୍ରାକ୍ କରନ୍ତୁ",
    qrBooking: "କ୍ୟୁଆର୍ କୋଡ୍ ବୁକିଂ",
    qrDescription: "ତତକ୍ଷଣାତ ବୁକିଂ ଏବଂ ଆପଣଙ୍କ ଟିକେଟଗୁଡ଼ିକର ସହଜ ପ୍ରବେଶ ପାଇଁ କ୍ୟୁଆର୍ କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ",
    openScanner: "କ୍ୟୁଆର୍ ସ୍କାନର୍ ଖୋଲନ୍ତୁ",
  }
}

interface BookingPageProps {
  currentLanguage: string
}

export default function BookingPage({ currentLanguage }: BookingPageProps) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    ticketNumber: ''
  })

  const currentLang = languages[currentLanguage as keyof typeof languages]

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

  return (
    <div className="pt-24 py-20 booking-bg-livery2">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
            {currentLang.quickBooking}
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-orange-400">{currentLang.bookJourney}</h1>
        </div>

        <Card className="max-w-4xl mx-auto card-ultra-3d border-0 booking-form">
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
                <form onSubmit={handleSearch}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.from}</label>
                      <Input
                        name="from"
                        placeholder={currentLang.departureCity}
                        className="border-orange-300 focus:border-orange-500 hover-lift"
                        value={formData.from}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.to}</label>
                      <Input
                        name="to"
                        placeholder={currentLang.destinationCity}
                        className="border-orange-300 focus:border-orange-500 hover-lift"
                        value={formData.to}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.date}</label>
                      <Input 
                        name="date"
                        type="date" 
                        className="border-orange-300 focus:border-orange-500 hover-lift"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="tilt-card">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{currentLang.passengers}</label>
                      <select 
                        name="passengers"
                        aria-label="Number of passengers"
                        title="Select number of passengers"
                        className="w-full p-2 border border-orange-300 rounded-md focus:border-orange-500 hover-lift"
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
                  <Button 
                    type="submit"
                    className="w-full btn-interactive bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 text-lg font-semibold ripple"
                  >
                    <Navigation className="mr-2 w-5 h-5" />
                    {currentLang.searchRoutes}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="track" className="space-y-6">
                <form onSubmit={handleTrack}>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center card-3d">
                      <MapPin className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{currentLang.liveTracking}</h3>
                    <Input 
                      name="ticketNumber"
                      placeholder={currentLang.enterTicket} 
                      className="max-w-md mx-auto mb-4 tilt-card"
                      value={formData.ticketNumber}
                      onChange={handleInputChange}
                    />
                    <Button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 btn-interactive"
                    >
                      <Navigation className="mr-2 w-4 h-4" />
                      {currentLang.trackBus}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="qr" className="space-y-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center card-3d">
                    <QrCode className="w-16 h-16 text-white animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{currentLang.qrBooking}</h3>
                  <p className="text-gray-600 mb-4">{currentLang.qrDescription}</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 btn-interactive">
                    <QrCode className="mr-2 w-4 h-4" />
                    {currentLang.openScanner}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Booking Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="card-3d border-0 text-center">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-lg font-bold mb-2">Easy Booking</h3>
              <p className="text-gray-600 text-sm">Book your tickets in just a few clicks with our user-friendly interface</p>
            </CardContent>
          </Card>
          <Card className="card-3d border-0 text-center">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold mb-2">Mobile Tickets</h3>
              <p className="text-gray-600 text-sm">Get your tickets instantly on your mobile device - no printing required</p>
            </CardContent>
          </Card>
          <Card className="card-3d border-0 text-center">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Your payment information is protected with bank-level security</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
