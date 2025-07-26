"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ArrowRight, Rocket, MapPin, Award, Shield, Star, Bus, Calendar as CalendarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

const languages = {
  en: {
    tagline: "Connecting Odisha Comfortably",
    subtitle: "Premium Bus Services Across Odisha",
    premiumSubtitle: "Experience luxury travel redefined with our world-class fleet and exceptional service",
    bookSeat: "Book Your Seat",
    exploreRoutes: "Explore Routes",
    dailyRoutes: "Daily Routes",
    happyCustomers: "Happy Customers", 
    yearsExperience: "Years Experience",
    onTime: "On Time",
  },
  hi: {
    tagline: "ओडिशा को आराम से जोड़ना",
    subtitle: "ओडिशा भर में प्रीमियम बस सेवाएं",
    premiumSubtitle: "हमारे विश्वस्तरीय बेड़े और असाधारण सेवा के साथ लक्जरी यात्रा का अनुभव करें",
    bookSeat: "अपनी सीट बुक करें",
    exploreRoutes: "मार्ग देखें",
    dailyRoutes: "दैनिक मार्ग",
    happyCustomers: "खुश ग्राहक",
    yearsExperience: "वर्षों का अनुभव",
    onTime: "समय पर",
  },
  or: {
    tagline: "ଓଡ଼ିଶାକୁ ଆରାମରେ ସଂଯୋଗ କରିବା",
    subtitle: "ଓଡ଼ିଶାର ସର୍ବତ୍ର ପ୍ରିମିୟମ୍ ବସ୍ ସେବା",
    premiumSubtitle: "ଆମର ବିଶ୍ୱମାନର ଜାହାଜ ଏବଂ ଅସାଧାରଣ ସେବା ସହିତ ବିଳାସପୂର୍ଣ୍ଣ ଯାତ୍ରାର ଅନୁଭବ କରନ୍ତୁ",
    bookSeat: "ଆପଣଙ୍କ ସିଟ୍ ବୁକ୍ କରନ୍ତୁ",
    exploreRoutes: "ମାର୍ଗ ଅନୁସନ୍ଧାନ କରନ୍ତୁ",
    dailyRoutes: "ଦୈନିକ ମାର୍ଗ",
    happyCustomers: "ଖୁସି ଗ୍ରାହକ",
    yearsExperience: "ବର୍ଷର ଅଭିଜ୍ଞତା",
    onTime: "ସମୟରେ",
  }
}

interface HomePageProps {
  currentLanguage: string
}

export default function HomePage({ currentLanguage }: HomePageProps) {
  const currentLang = languages[currentLanguage as keyof typeof languages]
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isMainBookingExpanded, setIsMainBookingExpanded] = useState(true)
  const [onwardDate, setOnwardDate] = useState<Date>(new Date(2025, 6, 25)) // July 25, 2025
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)
  const [linkTicketForm, setLinkTicketForm] = useState({ date: new Date(2025, 6, 25) })

  const handleSectionToggle = (section: string) => {
    console.log('Toggling section:', section, 'Current expanded:', expandedSection)
    // If clicking the same section that's already expanded, collapse it
    if (expandedSection === section) {
      setExpandedSection(null)
      console.log('Collapsed section:', section)
    } else {
      // Otherwise, expand the clicked section and collapse all others
      setExpandedSection(section)
      console.log('Expanded section:', section)
    }
    
    // Also ensure main booking section is closed when other sections are opened
    if (section !== 'mainBooking' && isMainBookingExpanded) {
      setIsMainBookingExpanded(false)
    }
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 min-h-screen flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/vdo/Bus video loop.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-600/30 z-10"></div>
        <div className="absolute inset-0 bg-black/1 z-20"></div>
        
        <div className="container mx-auto px-4 relative z-30">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Content */}
            <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
                Nandighosh
              </h1>
              
              <div className="space-y-4 mb-8">
                <p className="text-xl lg:text-2xl text-white/95 font-light">
                  {currentLang.tagline}
                </p>
                <p className="text-lg lg:text-xl text-white/90 font-medium">
                  {currentLang.subtitle}
                </p>
                <p className="text-base text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {currentLang.premiumSubtitle}
                </p>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-white font-medium">Award Winning</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white font-medium">100% Safe</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-white font-medium">5-Star Rated</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="/booking">
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
                  >
                    <Rocket className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    {currentLang.bookSeat}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </Button>
                </Link>
                <Link href="/routes">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 backdrop-blur-sm hover:scale-110 transition-all duration-300 hover:shadow-2xl"
                  >
                    <MapPin className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    {currentLang.exploreRoutes}
                  </Button>
                </Link>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">50+</div>
                  <div className="text-sm text-white/80">{currentLang.dailyRoutes}</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">10K+</div>
                  <div className="text-sm text-white/80">{currentLang.happyCustomers}</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">15+</div>
                  <div className="text-sm text-white/80">{currentLang.yearsExperience}</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">99.8%</div>
                  <div className="text-sm text-white/80">{currentLang.onTime}</div>
                </div>
              </div>
            </div>

            {/* Bus Booking Form */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <Card className="shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
                  {/* Bus Booking Header */}
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Bus className="w-6 h-6 text-white" />
                      <span className="text-xl font-bold text-white">BUS BOOKING</span>
                    </div>
                    <button 
                      className="text-white hover:scale-110 transition-all duration-200"
                      onClick={() => {
                        setIsMainBookingExpanded(!isMainBookingExpanded)
                        // Close other expanded sections when main booking is opened
                        if (!isMainBookingExpanded) {
                          setExpandedSection(null)
                        }
                      }}
                    >
                      <div className="text-white hover:scale-110 transition-all duration-200">
                        {isMainBookingExpanded ? (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-45">+</span>
                        ) : (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-0">+</span>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Booking Form */}
                  {isMainBookingExpanded && (
                    <CardContent className="p-6 space-y-4 bg-white/5 backdrop-blur-sm">
                      {/* From Field */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-white">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <label className="text-sm font-medium">From:</label>
                        </div>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select departure city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balasore">Balasore</SelectItem>
                            <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                            <SelectItem value="cuttack">Cuttack</SelectItem>
                            <SelectItem value="puri">Puri</SelectItem>
                            <SelectItem value="berhampur">Berhampur</SelectItem>
                            <SelectItem value="sambalpur">Sambalpur</SelectItem>
                            <SelectItem value="kolkata">Kolkata</SelectItem>
                            <SelectItem value="rourkela">Rourkela</SelectItem>
                            <SelectItem value="koraput">Koraput</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    {/* To Field */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-white">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <label className="text-sm font-medium">To:</label>
                      </div>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select destination city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balasore">Balasore</SelectItem>
                          <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                          <SelectItem value="cuttack">Cuttack</SelectItem>
                          <SelectItem value="puri">Puri</SelectItem>
                          <SelectItem value="berhampur">Berhampur</SelectItem>
                          <SelectItem value="sambalpur">Sambalpur</SelectItem>
                          <SelectItem value="kolkata">Kolkata</SelectItem>
                          <SelectItem value="rourkela">Rourkela</SelectItem>
                          <SelectItem value="koraput">Koraput</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Onward Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Onward:</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative cursor-pointer">
                            <Input 
                              type="text" 
                              value={format(onwardDate, "EEE, dd-MMM-yyyy")}
                              readOnly
                              className="pr-10 cursor-pointer"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={onwardDate}
                            onSelect={(date) => date && setOnwardDate(date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Return Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Return:</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative cursor-pointer">
                            <Input 
                              type="text" 
                              value={returnDate ? format(returnDate, "EEE, dd-MMM-yyyy") : "Optional"}
                              className="pr-10 cursor-pointer text-gray-500"
                              readOnly
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            disabled={(date) => date < onwardDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Search Button */}
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg font-semibold mt-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      SEARCH
                    </Button>
                  </CardContent>
                  )}

                  {/* Link Ticket Section */}
                  <div className="border-t border-white/10">
                    <button 
                      type="button"
                      className="w-full bg-white/20 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-all cursor-pointer focus:outline-none hover:scale-105 hover:shadow-lg"
                      onClick={() => handleSectionToggle('linkTicket')}
                    >
                      <div className="flex items-center space-x-2">
                        <Bus className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">Link Ticket</span>
                      </div>
                      <div className="text-white">
                        {expandedSection === 'linkTicket' ? (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-45">+</span>
                        ) : (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-0">+</span>
                        )}
                      </div>
                    </button>
                    
                    {/* Link Ticket Form */}
                    {expandedSection === 'linkTicket' && (
                      <div className="bg-white/10 backdrop-blur-sm px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-200">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">From:</span>
                                <SelectValue placeholder="select departure city" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="balasore">Balasore</SelectItem>
                              <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                              <SelectItem value="cuttack">Cuttack</SelectItem>
                              <SelectItem value="puri">Puri</SelectItem>
                              <SelectItem value="berhampur">Berhampur</SelectItem>
                              <SelectItem value="sambalpur">Sambalpur</SelectItem>
                              <SelectItem value="kolkata">Kolkata</SelectItem>
                              <SelectItem value="rourkela">Rourkela</SelectItem>
                              <SelectItem value="koraput">Koraput</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-200">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">To:</span>
                                <SelectValue placeholder="select destination city" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="balasore">Balasore</SelectItem>
                              <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                              <SelectItem value="cuttack">Cuttack</SelectItem>
                              <SelectItem value="puri">Puri</SelectItem>
                              <SelectItem value="berhampur">Berhampur</SelectItem>
                              <SelectItem value="sambalpur">Sambalpur</SelectItem>
                              <SelectItem value="kolkata">Kolkata</SelectItem>
                              <SelectItem value="rourkela">Rourkela</SelectItem>
                              <SelectItem value="koraput">Koraput</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="relative cursor-pointer">
                                <Input 
                                  type="text" 
                                  value={`Date: ${format(linkTicketForm.date, "EEE, dd-MMM-yyyy")}`}
                                  readOnly
                                  className="pr-10 cursor-pointer border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={linkTicketForm.date}
                                onSelect={(date) => date && setLinkTicketForm({...linkTicketForm, date})}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-sm font-semibold mt-4">
                          SEARCH
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bus Hire Section */}
                  <div className="border-t border-white/10">
                    <button 
                      type="button"
                      className="w-full bg-white/20 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-all cursor-pointer focus:outline-none hover:scale-105 hover:shadow-lg"
                      onClick={() => handleSectionToggle('busHire')}
                    >
                      <div className="flex items-center space-x-2">
                        <Bus className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">BUS HIRE</span>
                      </div>
                      <div className="text-white">
                        {expandedSection === 'busHire' ? (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-45">+</span>
                        ) : (
                          <span className="text-xl inline-block transition-all duration-300 transform rotate-0">+</span>
                        )}
                      </div>
                    </button>
                    
                    {/* Bus Hire Form */}
                    {expandedSection === 'busHire' && (
                      <div className="bg-white/10 backdrop-blur-sm px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">City of Hire eg: Bangalore</label>
                          <Input 
                            type="text" 
                            placeholder="Enter city of hire"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Starting Point eg: Railway station</label>
                          <Input 
                            type="text" 
                            placeholder="Enter starting point"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Destination: eg: Airport/Pune</label>
                          <Input 
                            type="text" 
                            placeholder="Enter destination"
                            className="w-full"
                          />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 text-sm font-semibold mt-4">
                          HIRE BUSES
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Nandighosh?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our premium features and exceptional service quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Award Winning Service</h3>
                <p className="text-white/90 drop-shadow-md">
                  Recognized for excellence in passenger service and safety standards across Odisha
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">100% Safe Travel</h3>
                <p className="text-white/90 drop-shadow-md">
                  Advanced safety features, GPS tracking, and experienced drivers ensure secure journeys
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">5-Star Comfort</h3>
                <p className="text-white/90 drop-shadow-md">
                  Luxury AC coaches with reclining seats, entertainment, and premium amenities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Our Premium Fleet
            </h2>
            <p className="text-xl text-white/90 drop-shadow-md">
              Modern buses equipped with the latest amenities for your comfort
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-xl backdrop-blur-sm border border-white/10"></div>
              <img 
                src="/images/bus-fleet.jpg" 
                alt="Nandighosh Bus Fleet"
                className="w-full h-96 object-cover rounded-xl shadow-2xl relative z-10"
              />
            </div>
            <div className="space-y-6 backdrop-blur-sm bg-white/10 p-8 rounded-xl border border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                Experience Luxury Travel
              </h3>
              <p className="text-lg text-white/90 drop-shadow-md">
                Our fleet features state-of-the-art buses with traditional Odisha artwork, 
                combining cultural heritage with modern comfort.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg"></div>
                  <span className="text-white/95 drop-shadow-sm">Premium AC Sleeper & Semi-Sleeper coaches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg"></div>
                  <span className="text-white/95 drop-shadow-sm">GPS tracking and real-time updates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg"></div>
                  <span className="text-white/95 drop-shadow-sm">Entertainment systems and WiFi</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg"></div>
                  <span className="text-white/95 drop-shadow-sm">24/7 customer support</span>
                </li>
              </ul>
              <Link href="/features">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg shadow-lg border border-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                  Learn More About Our Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
