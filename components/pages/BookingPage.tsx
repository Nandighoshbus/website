"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation, MapPin, QrCode, Calendar, Users, ArrowRight, Clock, Shield, Smartphone, ArrowUpDown, Wind, Bed, IndianRupee, Bus } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Types matching actual database structure
interface BusScheduleResult {
  id: string
  bus_id: string
  route_id: string
  departure_date: string
  departure_time: string
  arrival_date: string
  arrival_time: string
  base_fare: number
  available_seats: number
  booked_seats: string[]
  blocked_seats: string[]
  is_active: boolean
  bus: {
    id: string
    bus_number: string
    bus_name: string
    bus_type: 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury'
    total_seats: number
    amenities: string[]
    is_active: boolean
  }
  route: {
    id: string
    route_code: string
    name: string
    source_city: string
    destination_city: string
    distance_km: number
    estimated_duration: string
    base_fare: number
    is_active: boolean
  }
}

interface BusSearchResult {
  id: string
  bus_number: string
  bus_type: 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury'
  total_seats: number
  amenities: string[]
  is_active: boolean
}

interface RouteSearchResult {
  id: string
  route_code: string
  name: string
  source_city: string
  destination_city: string
  distance_km: number
  estimated_duration: string
  base_fare: number
  is_active: boolean
  bus: BusSearchResult
}

interface City {
  name: string
}

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

// Empty initial cities - will be populated from database
const fallbackCities: string[] = []

interface BookingPageProps {
  currentLanguage: string
}

export default function BookingPage({ currentLanguage }: BookingPageProps) {
  const router = useRouter()
  
  // State management
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    busType: 'ac', // ac or normal
    seatType: 'seat', // seat or sleeper
    ticketNumber: ''
  })

  // API data state
  const [cities, setCities] = useState<string[]>(fallbackCities)
  const [searchResults, setSearchResults] = useState<BusScheduleResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Handle route selection and navigation to payment page
  const handleSelectRoute = async (schedule: BusScheduleResult) => {
    // Check if user is authenticated
    if (!user) {
      // Store the selected route data in sessionStorage for after login
      const routeData = {
        scheduleId: schedule.id,
        busName: schedule.bus.bus_name,
        busNumber: schedule.bus.bus_number,
        busType: schedule.bus.bus_type,
        route: schedule.route.name,
        from: formData.from,
        to: formData.to,
        date: formData.date,
        departureTime: schedule.departure_time,
        arrivalTime: schedule.arrival_time,
        duration: schedule.route.estimated_duration,
        distance: `${schedule.route.distance_km} km`,
        passengers: formData.passengers,
        baseFare: schedule.base_fare.toString(),
        totalFare: (schedule.base_fare * parseInt(formData.passengers)).toString(),
        availableSeats: schedule.available_seats.toString()
      }
      
      sessionStorage.setItem('pendingBooking', JSON.stringify(routeData))
      router.push('/signin?redirect=payment')
      return
    }

    // User is authenticated, proceed to payment
    const params = new URLSearchParams({
      scheduleId: schedule.id,
      busName: schedule.bus.bus_name,
      busNumber: schedule.bus.bus_number,
      busType: schedule.bus.bus_type,
      route: schedule.route.name,
      from: formData.from,
      to: formData.to,
      date: formData.date,
      departureTime: schedule.departure_time,
      arrivalTime: schedule.arrival_time,
      duration: schedule.route.estimated_duration,
      distance: `${schedule.route.distance_km} km`,
      passengers: formData.passengers,
      baseFare: schedule.base_fare.toString(),
      totalFare: (schedule.base_fare * parseInt(formData.passengers)).toString(),
      availableSeats: schedule.available_seats.toString()
    })
    
    router.push(`/payment?${params.toString()}`)
  }

  const currentLang = languages[currentLanguage as keyof typeof languages]

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await auth.getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch cities from Supabase on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Get unique cities from routes table
        const { data: routes, error } = await supabase
          .from('routes')
          .select('source_city, destination_city')
          .eq('is_active', true)
        
        if (error) throw error
        
        if (routes) {
          // Extract unique cities from source and destination
          const citySet = new Set<string>()
          routes.forEach(route => {
            if (route.source_city) citySet.add(route.source_city)
            if (route.destination_city) citySet.add(route.destination_city)
          })
          
          const uniqueCities = Array.from(citySet).sort()
          setCities(uniqueCities)
        }
      } catch (error) {
        console.error('Failed to fetch cities from Supabase:', error)
        setCities([])
      }
    }

    fetchCities()
  }, [])

  // Supabase function to search bus schedules
  const searchRoutes = async (from: string, to: string, date: string) => {
    try {
      setSearching(true)
      setError(null)
      
      console.log('🔍 Search Parameters:', { from, to, date, busType: formData.busType, passengers: formData.passengers })

      // Get day name from the selected date
      const selectedDate = new Date(date)
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      console.log('📅 Day name:', dayName)

      // Build the query
      let query = supabase
        .from('bus_schedules')
        .select(`
          id,
          bus_id,
          route_id,
          departure_date,
          departure_time,
          arrival_date,
          arrival_time,
          base_fare,
          available_seats,
          booked_seats,
          blocked_seats,
          is_active,
          buses!inner (
            id,
            bus_number,
            bus_name,
            bus_type,
            total_seats,
            amenities,
            is_active
          ),
          routes!inner (
            id,
            route_code,
            name,
            source_city,
            destination_city,
            distance_km,
            estimated_duration,
            base_fare,
            is_active,
            operating_days
          )
        `)
        .eq('is_active', true)
        .eq('buses.is_active', true)
        .eq('routes.is_active', true)
        .eq('routes.source_city', from)
        .eq('routes.destination_city', to)
        .eq('departure_date', date)
        .gte('available_seats', parseInt(formData.passengers))

      // Add bus type filter if specified
      if (formData.busType === 'ac') {
        query = query.eq('buses.bus_type', 'ac')
      } else if (formData.busType === 'normal') {
        query = query.eq('buses.bus_type', 'non_ac')
      }

      const { data: schedules, error } = await query.order('departure_time')
      
      console.log('📊 Query result:', { schedules: schedules?.length || 0, error })
      
      if (error) {
        console.error('❌ Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Filter schedules based on route operating days
      const filteredSchedules = (schedules || []).filter((schedule: any) => {
        const route = Array.isArray(schedule.routes) ? schedule.routes[0] : schedule.routes;
        const operatingDays = route?.operating_days || [];
        
        // If no operating days specified, assume route operates all days
        if (!operatingDays || operatingDays.length === 0) {
          return true;
        }
        
        // Check if the route operates on the selected day
        return operatingDays.includes(dayName);
      });

      // Transform data to match expected interface
      const transformedSchedules: BusScheduleResult[] = filteredSchedules.map((schedule: any) => {
        const bus = Array.isArray(schedule.buses) ? schedule.buses[0] : schedule.buses;
        const route = Array.isArray(schedule.routes) ? schedule.routes[0] : schedule.routes;
        
        return {
          id: schedule.id,
          bus_id: schedule.bus_id,
          route_id: schedule.route_id,
          departure_date: schedule.departure_date,
          departure_time: schedule.departure_time,
          arrival_date: schedule.arrival_date,
          arrival_time: schedule.arrival_time,
          base_fare: schedule.base_fare,
          available_seats: schedule.available_seats,
          booked_seats: schedule.booked_seats || [],
          blocked_seats: schedule.blocked_seats || [],
          is_active: schedule.is_active,
          bus: {
            id: bus?.id || '',
            bus_number: bus?.bus_number || '',
            bus_name: bus?.bus_name || '',
            bus_type: (bus?.bus_type as 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury') || 'non_ac',
            total_seats: bus?.total_seats || 0,
            amenities: bus?.amenities || [],
            is_active: bus?.is_active || false
          },
          route: {
            id: route?.id || '',
            route_code: route?.route_code || '',
            name: route?.name || '',
            source_city: route?.source_city || '',
            destination_city: route?.destination_city || '',
            distance_km: route?.distance_km || 0,
            estimated_duration: route?.estimated_duration || '',
            base_fare: route?.base_fare || 0,
            is_active: route?.is_active || false
          }
        }
      })

      console.log('✅ Final results:', transformedSchedules.length, 'schedules')
      setSearchResults(transformedSchedules)
      setSearching(false)
    } catch (error) {
      console.error('❌ Schedule search failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to search schedules')
      setSearchResults([])
      setSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.from || !formData.to) {
      setError('Please select both departure and destination cities')
      return
    }

    if (formData.from === formData.to) {
      setError('Departure and destination cities cannot be the same')
      return
    }

    if (!formData.date) {
      setError('Please select a travel date')
      return
    }

    // Check if selected date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('Please select a date from today onwards')
      return
    }

    // Search for routes
    await searchRoutes(formData.from, formData.to, formData.date)
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
                    
                    <Button 
                      type="submit"
                      disabled={searching}
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    >
                      <Navigation className="mr-2 w-5 h-5" />
                      {searching ? 'Searching...' : currentLang.searchRoutes}
                    </Button>

                    {/* Error Display */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          Available Routes ({searchResults.length} found)
                        </h3>
                        
                        {searchResults.map((schedule) => (
                          <Card key={schedule.id} className="border-2 hover:border-orange-300 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {schedule.route?.name || `${schedule.route?.source_city} to ${schedule.route?.destination_city}`}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Bus: {schedule.bus?.bus_number} • {schedule.bus?.bus_name} • {schedule.bus?.bus_type.replace('_', '-').toUpperCase()}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  {schedule.available_seats} seats available
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                                  <p className="text-xs text-gray-500">Departure</p>
                                  <p className="font-semibold">{schedule.departure_time}</p>
                                  <p className="text-xs text-gray-400">{schedule.departure_date}</p>
                                </div>
                                <div className="text-center">
                                  <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                  <p className="text-xs text-gray-500">Arrival</p>
                                  <p className="font-semibold">{schedule.arrival_time}</p>
                                  <p className="text-xs text-gray-400">{schedule.arrival_date}</p>
                                </div>
                                <div className="text-center">
                                  <ArrowRight className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                                  <p className="text-xs text-gray-500">Duration</p>
                                  <p className="font-semibold">{schedule.route?.estimated_duration || 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                  <IndianRupee className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                                  <p className="text-xs text-gray-500">Base Fare</p>
                                  <p className="font-semibold">₹{schedule.base_fare}</p>
                                </div>
                              </div>

                              {schedule.bus?.amenities && schedule.bus.amenities.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 mb-2">Amenities:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {schedule.bus.amenities.map((amenity, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {schedule.route?.distance_km && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600">
                                    Distance: {schedule.route.distance_km} km
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="text-lg font-bold text-blue-600">
                                  Total: ₹{(schedule.base_fare * parseInt(formData.passengers)).toLocaleString('en-IN')}
                                  <span className="text-sm text-gray-500 font-normal ml-1">
                                    for {formData.passengers} passenger{parseInt(formData.passengers) > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <Button 
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                  onClick={() => handleSelectRoute(schedule)}
                                >
                                  Select Route
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {searchResults.length === 0 && searching === false && formData.from && formData.to && (
                      <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Bus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Found</h3>
                        <p className="text-gray-600">
                          No buses available for the selected route and date. Try different cities or dates.
                        </p>
                      </div>
                    )}
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
