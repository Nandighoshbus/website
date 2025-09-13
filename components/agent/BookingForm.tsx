'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users, CreditCard, Phone, User, AlertCircle, ArrowUpDown } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for fallback when API fails
const MOCK_CITIES = [
  'Balasore', 'Bhubaneswar', 'Cuttack', 'Puri', 'Berhampur', 
  'Sambalpur', 'Rourkela', 'Koraput', 'Kolkata'
]

const MOCK_ROUTES: Route[] = [
  {
    id: 'route-1',
    route_code: 'BBR-CTC',
    name: 'Bhubaneswar to Cuttack Express',
    source_city: 'Bhubaneswar',
    destination_city: 'Cuttack',
    distance_km: 28,
    estimated_duration: '1:30:00',
    base_fare: 150,
    is_active: true,
    schedules: [
      {
        id: 'schedule-1',
        route_id: 'route-1',
        bus_id: 'bus-1',
        departure_time: '06:00:00',
        arrival_time: '07:30:00',
        fare: 150,
        operating_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        is_active: true,
        buses: {
          id: 'bus-1',
          bus_number: 'OD-05-1234',
          bus_type: 'AC Sleeper',
          total_seats: 40,
          amenities: ['AC', 'Wi-Fi', 'Charging Port', 'Entertainment']
        }
      },
      {
        id: 'schedule-2',
        route_id: 'route-1',
        bus_id: 'bus-2',
        departure_time: '14:00:00',
        arrival_time: '15:30:00',
        fare: 150,
        operating_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        is_active: true,
        buses: {
          id: 'bus-2',
          bus_number: 'OD-05-5678',
          bus_type: 'AC Seater',
          total_seats: 45,
          amenities: ['AC', 'Wi-Fi', 'Charging Port']
        }
      }
    ]
  },
  {
    id: 'route-2',
    route_code: 'BBR-PUR',
    name: 'Bhubaneswar to Puri Express',
    source_city: 'Bhubaneswar',
    destination_city: 'Puri',
    distance_km: 60,
    estimated_duration: '2:00:00',
    base_fare: 200,
    is_active: true,
    schedules: [
      {
        id: 'schedule-3',
        route_id: 'route-2',
        bus_id: 'bus-3',
        departure_time: '08:00:00',
        arrival_time: '10:00:00',
        fare: 200,
        operating_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        is_active: true,
        buses: {
          id: 'bus-3',
          bus_number: 'OD-05-9012',
          bus_type: 'Luxury AC',
          total_seats: 35,
          amenities: ['AC', 'Wi-Fi', 'Charging Port', 'Entertainment', 'Snacks']
        }
      }
    ]
  },
  {
    id: 'route-3',
    route_code: 'BAL-BBR',
    name: 'Balasore to Bhubaneswar Express',
    source_city: 'Balasore',
    destination_city: 'Bhubaneswar',
    distance_km: 210,
    estimated_duration: '4:30:00',
    base_fare: 350,
    is_active: true,
    schedules: [
      {
        id: 'schedule-4',
        route_id: 'route-3',
        bus_id: 'bus-4',
        departure_time: '22:00:00',
        arrival_time: '02:30:00',
        fare: 350,
        operating_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        is_active: true,
        buses: {
          id: 'bus-4',
          bus_number: 'OD-05-3456',
          bus_type: 'Sleeper',
          total_seats: 30,
          amenities: ['Sleeper Berths', 'Blanket', 'Pillow']
        }
      }
    ]
  }
]

interface Route {
  id: string
  route_code: string
  name: string
  source_city: string
  destination_city: string
  distance_km: number
  estimated_duration: string
  base_fare: number
  is_active: boolean
  schedules: Schedule[]
}

interface Schedule {
  id: string
  route_id: string
  bus_id: string
  departure_time: string
  arrival_time: string
  fare: number
  operating_days: string[]
  is_active: boolean
  buses: {
    id: string
    bus_number: string
    bus_type: string
    total_seats: number
    amenities: string[]
  }
}

interface Passenger {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  id_type: 'aadhar' | 'passport' | 'driving_license' | 'voter_id'
  id_number: string
}

interface BookingData {
  scheduleId: string
  passengers: any[]
  journeyDate: string
  seatNumbers: string[]
  paymentMethod: string
  contactDetails: any
}

export default function BookingForm() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [cities, setCities] = useState<string[]>(MOCK_CITIES)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [journeyDate, setJourneyDate] = useState('')
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [passengers, setPassengers] = useState<Passenger[]>([{
    name: '',
    age: 0,
    gender: 'male',
    phone: '',
    email: '',
    id_type: 'aadhar',
    id_number: ''
  }])
  const [contactDetails, setContactDetails] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      console.log('BookingForm: Starting fetchCities...')
      
      // Get token for authenticated request
      const { jwtAuth } = await import('@/lib/jwtAuth')
      const token = jwtAuth.getToken('agent')
      
      console.log('BookingForm: Agent token exists:', !!token)
      
      if (!token) {
        console.error('BookingForm: No agent token found')
        setError('Agent authentication required. Please login again.')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const url = `${baseUrl}/api/v1/agents/routes`
      console.log('BookingForm: Fetching from URL:', url)
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('BookingForm: Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('BookingForm: API response data:', data)
        
        if (data.success && data.data) {
          const citySet = new Set<string>()
          data.data.forEach((route: any) => {
            if (route.source_city) citySet.add(route.source_city)
            if (route.destination_city) citySet.add(route.destination_city)
          })
          
          const uniqueCities = Array.from(citySet).sort()
          console.log('BookingForm: Extracted cities:', uniqueCities)
          setCities(uniqueCities)
        } else {
          console.error('BookingForm: Invalid data structure:', data)
          console.log('BookingForm: Using mock cities as fallback')
          setCities(MOCK_CITIES)
          setError('')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('BookingForm: API error:', response.status, errorData)
        console.log('BookingForm: Using mock cities as fallback')
        setCities(MOCK_CITIES)
        setError('')
      }
    } catch (error) {
      console.error('BookingForm: fetchCities error:', error)
      console.log('BookingForm: Using mock cities as fallback')
      setCities(MOCK_CITIES)
      setError('')
    }
  }

  const searchBusSchedules = async (from: string, to: string, date: string, passengers: number) => {
    try {
      setSearching(true)
      setError('')

      // Get token for authenticated request
      const { jwtAuth } = await import('@/lib/jwtAuth')
      const token = jwtAuth.getToken('agent')
      
      if (!token) {
        setError('Agent authentication required. Please login again.')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/v1/agents/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&passengers=${passengers}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setRoutes(data.data)
        } else {
          // Use mock data as fallback
          const mockRoutesForRoute = MOCK_ROUTES.filter(route => 
            route.source_city.toLowerCase() === from.toLowerCase() && 
            route.destination_city.toLowerCase() === to.toLowerCase()
          )
          setRoutes(mockRoutesForRoute)
          if (mockRoutesForRoute.length === 0) {
            setError('No schedules found for the selected route and date')
          } else {
            setError('')
          }
        }
      } else {
        // Use mock data as fallback
        const mockRoutesForRoute = MOCK_ROUTES.filter(route => 
          route.source_city.toLowerCase() === from.toLowerCase() && 
          route.destination_city.toLowerCase() === to.toLowerCase()
        )
        setRoutes(mockRoutesForRoute)
        if (mockRoutesForRoute.length === 0) {
          setError('No schedules found for the selected route and date')
        } else {
          setError('')
        }
      }
    } catch (error) {
      console.error('Failed to search schedules:', error)
      // Use mock data as fallback
      const mockRoutesForRoute = MOCK_ROUTES.filter(route => 
        route.source_city.toLowerCase() === from.toLowerCase() && 
        route.destination_city.toLowerCase() === to.toLowerCase()
      )
      setRoutes(mockRoutesForRoute)
      if (mockRoutesForRoute.length === 0) {
        setError('Failed to search schedules')
      } else {
        setError('')
      }
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = async () => {
    if (!fromCity || !toCity) {
      setError('Please select both departure and destination cities')
      return
    }
    if (fromCity === toCity) {
      setError('Departure and destination cities cannot be the same')
      return
    }
    if (!journeyDate) {
      setError('Please select a travel date')
      return
    }

    const selectedDate = new Date(journeyDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('Please select a date from today onwards')
      return
    }

    await searchBusSchedules(fromCity, toCity, journeyDate, passengers.length)
  }

  const handleSwapCities = () => {
    const temp = fromCity
    setFromCity(toCity)
    setToCity(temp)
  }

  const addPassenger = () => {
    setPassengers([...passengers, {
      name: '',
      age: 0,
      gender: 'male',
      phone: '',
      email: '',
      id_type: 'aadhar',
      id_number: ''
    }])
  }

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    const updated = passengers.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    )
    setPassengers(updated)
  }

  const calculateTotalFare = () => {
    if (!selectedSchedule) return 0
    return passengers.length * selectedSchedule.fare
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get token from jwtAuth
      const { jwtAuth } = await import('@/lib/jwtAuth')
      const token = jwtAuth.getToken('agent')
      
      if (!token) {
        setError('Agent authentication required. Please login again.')
        return
      }

      // Prepare booking data to match backend API structure
      const bookingData = {
        scheduleId: selectedSchedule!.id,
        passengers: passengers.map(passenger => ({
          fullName: passenger.name,
          phone: passenger.phone,
          email: passenger.email,
          age: passenger.age,
          gender: passenger.gender,
          idProofType: passenger.id_type,
          idProofNumber: passenger.id_number
        })),
        journeyDate: journeyDate,
        seatNumbers: Array.from({length: passengers.length}, (_, i) => `A${i + 1}`),
        paymentMethod: paymentMethod,
        contactDetails: contactDetails
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/v1/agents/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Booking created successfully! Booking Reference: ${result.data.bookingReference}`)
        // Reset form
        setSelectedRoute(null)
        setSelectedSchedule(null)
        setJourneyDate('')
        setPassengers([{
          name: '',
          age: 0,
          gender: 'male',
          phone: '',
          email: '',
          id_type: 'aadhar',
          id_number: ''
        }])
        setContactDetails({ name: '', phone: '', email: '' })
        setPaymentMethod('cash')
        setSpecialRequests('')
      } else {
        const errorData = await response.json()
        console.error('Booking submission failed:', errorData)
        setError(errorData.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      setError('An error occurred while creating the booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Agent Booking System
          </CardTitle>
          <CardDescription className="text-blue-100">
            Book tickets for passengers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* City Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Selection
              </h3>
              
              {/* From and To Cities Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    From
                  </Label>
                  <select
                    className="w-full h-12 px-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 bg-white"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    aria-label="Select departure city"
                  >
                    <option value="">Select departure city</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    To
                  </Label>
                  <div className="flex gap-2">
                    <select
                      className="w-full h-12 px-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 bg-white"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      aria-label="Select destination city"
                    >
                      <option value="">Select destination city</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleSwapCities}
                      className="h-12 w-12 border-blue-200 hover:border-blue-400 hover:bg-blue-50 flex-shrink-0"
                    >
                      <ArrowUpDown className="w-4 h-4 text-blue-500" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Journey Date
                  </Label>
                  <Input 
                    type="date" 
                    className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    Passengers ({passengers.length})
                  </Label>
                  <div className="flex items-center h-12 px-3 border border-blue-200 rounded-md bg-blue-50">
                    <span className="text-blue-800 font-medium">{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              
              {/* Search Button */}
              <Button 
                type="button"
                onClick={handleSearch}
                disabled={searching || !fromCity || !toCity || !journeyDate}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              >
                {searching ? 'Searching Routes...' : 'Search Available Routes'}
              </Button>
            </div>

            {/* Route Results */}
            {routes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  Available Routes ({routes.length} found)
                </h3>
                <div className="grid gap-4">
                  {routes.map((route) => (
                    <Card key={route.id} className="border-2 hover:border-orange-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{route.name}</h4>
                            <p className="text-sm text-gray-600">
                              {route.source_city} → {route.destination_city} • {route.distance_km} km
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {route.schedules.length} schedule{route.schedules.length !== 1 ? 's' : ''} available
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-blue-800 font-medium">Select Schedule</Label>
                          <div className="grid gap-3">
                            {route.schedules.map((schedule) => (
                              <div
                                key={schedule.id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedSchedule?.id === schedule.id
                                    ? 'border-orange-400 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-200 hover:bg-orange-25'
                                }`}
                                onClick={() => {
                                  setSelectedRoute(route)
                                  setSelectedSchedule(schedule)
                                }}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">
                                      {schedule.buses.bus_number} • {schedule.buses.bus_type}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {schedule.buses.total_seats} seats • {schedule.buses.amenities.join(', ')}
                                    </p>
                                  </div>
                                  {selectedSchedule?.id === schedule.id && (
                                    <Badge className="bg-green-500 text-white">Selected</Badge>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                                    <p className="text-xs text-gray-500">Departure</p>
                                    <p className="font-semibold">{schedule.departure_time}</p>
                                  </div>
                                  <div className="text-center">
                                    <Clock className="w-4 h-4 mx-auto mb-1 text-green-600" />
                                    <p className="text-xs text-gray-500">Arrival</p>
                                    <p className="font-semibold">{schedule.arrival_time}</p>
                                  </div>
                                  <div className="text-center">
                                    <ArrowUpDown className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="font-semibold">{route.estimated_duration}</p>
                                  </div>
                                  <div className="text-center">
                                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                                    <p className="text-xs text-gray-500">Fare</p>
                                    <p className="font-semibold">₹{schedule.fare}</p>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      Operating: {schedule.operating_days.join(', ')}
                                    </span>
                                    <div className="text-lg font-bold text-blue-600">
                                      Total: ₹{(schedule.fare * passengers.length).toLocaleString('en-IN')}
                                      <span className="text-sm text-gray-500 font-normal ml-1">
                                        for {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Routes Found */}
            {routes.length === 0 && !searching && fromCity && toCity && journeyDate && (
              <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Found</h3>
                <p className="text-gray-600">
                  No buses available for the selected route and date. Try different cities or dates.
                </p>
              </div>
            )}

            {selectedSchedule && (
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Selected Journey Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-500 text-xs">Bus</p>
                    <p className="font-semibold text-gray-900">{selectedSchedule.buses.bus_number}</p>
                    <p className="text-gray-600 text-xs">{selectedSchedule.buses.bus_type}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-500 text-xs">Schedule</p>
                    <p className="font-semibold text-gray-900">{selectedSchedule.departure_time} - {selectedSchedule.arrival_time}</p>
                    <p className="text-gray-600 text-xs">{journeyDate}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-500 text-xs">Total Fare</p>
                    <p className="font-semibold text-green-600 text-lg">₹{(selectedSchedule.fare * passengers.length).toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-xs">{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger Details */}
            {selectedSchedule && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Passenger Details ({passengers.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addPassenger}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Passenger
                  </Button>
                </div>

                {passengers.map((passenger, index) => (
                  <Card key={index} className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Passenger {index + 1}
                        </CardTitle>
                        {passengers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePassenger(index)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Full Name *
                          </Label>
                          <Input
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            placeholder="Enter full name"
                            required
                            className="h-11 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800">Age *</Label>
                          <Input
                            type="number"
                            value={passenger.age || ''}
                            onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                            placeholder="Enter age"
                            min="1"
                            max="120"
                            required
                            className="h-11 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800">Gender *</Label>
                          <Select
                            value={passenger.gender}
                            onValueChange={(value) => updatePassenger(index, 'gender', value)}
                          >
                            <SelectTrigger className="h-11 border-blue-200 focus:border-blue-400">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Phone Number *
                          </Label>
                          <Input
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                            placeholder="Enter phone number"
                            required
                            className="h-11 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800">Email Address *</Label>
                          <Input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            placeholder="Enter email address"
                            required
                            className="h-11 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-800">ID Type *</Label>
                          <Select
                            value={passenger.id_type}
                            onValueChange={(value) => updatePassenger(index, 'id_type', value)}
                          >
                            <SelectTrigger className="h-11 border-blue-200 focus:border-blue-400">
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aadhar">Aadhar Card</SelectItem>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="driving_license">Driving License</SelectItem>
                              <SelectItem value="voter_id">Voter ID</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Label className="text-sm font-medium text-blue-800">ID Number *</Label>
                        <Input
                          value={passenger.id_number}
                          onChange={(e) => updatePassenger(index, 'id_number', e.target.value)}
                          placeholder="Enter ID number"
                          required
                          className="h-11 mt-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Contact Details */}
            {passengers.length > 0 && passengers[0].name && (
              <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Primary contact for booking confirmation and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-800">Contact Name *</Label>
                      <Input
                        value={contactDetails.name}
                        onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                        placeholder="Enter contact name"
                        required
                        className="h-11 border-green-200 focus:border-green-400 focus:ring-green-400/20 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-800">Contact Phone *</Label>
                      <Input
                        value={contactDetails.phone}
                        onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                        placeholder="Enter phone number"
                        required
                        className="h-11 border-green-200 focus:border-green-400 focus:ring-green-400/20 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-800">Contact Email *</Label>
                      <Input
                        type="email"
                        value={contactDetails.email}
                        onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                        className="h-11 border-green-200 focus:border-green-400 focus:ring-green-400/20 bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment & Additional Details */}
            {contactDetails.name && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment & Additional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-blue-800">Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value: 'cash' | 'upi' | 'card') => setPaymentMethod(value)}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="w-full">
                      <Label className="text-blue-800">Total Fare</Label>
                      <div className="h-10 px-3 border border-blue-200 rounded-md bg-green-50 flex items-center">
                        <span className="text-green-800 font-bold text-lg">₹{calculateTotalFare()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-blue-800">Special Requests</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests..."
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            {contactDetails.name && selectedSchedule && journeyDate && (
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold text-lg"
                >
                  {loading ? 'Creating Booking...' : `Book ${passengers.length} Ticket(s) - ₹${calculateTotalFare()}`}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
