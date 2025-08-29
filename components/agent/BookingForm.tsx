'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Clock, Users, CreditCard, Phone, User, AlertCircle, ArrowUpDown } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

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
  id_type: 'aadhar' | 'pan' | 'passport' | 'driving_license'
  id_number: string
}

interface BookingData {
  route_id: string
  schedule_id: string
  journey_date: string
  passengers: Passenger[]
  contact_name: string
  contact_phone: string
  contact_email: string
  payment_method: 'cash' | 'upi' | 'card'
  special_requests?: string
}

export default function BookingForm() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [cities, setCities] = useState<string[]>([])
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
      const { data: routes, error } = await supabase
        .from('routes')
        .select('source_city, destination_city')
        .eq('is_active', true)
      
      if (error) throw error
      
      if (routes) {
        const citySet = new Set<string>()
        routes.forEach((route: any) => {
          if (route.source_city) citySet.add(route.source_city)
          if (route.destination_city) citySet.add(route.destination_city)
        })
        
        const uniqueCities = Array.from(citySet).sort()
        setCities(uniqueCities)
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      setError('Failed to load cities')
    }
  }

  const searchBusSchedules = async (from: string, to: string, date: string, passengers: number) => {
    try {
      setSearching(true)
      setError('')

      const selectedDate = new Date(date)
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

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
        .gte('available_seats', passengers)

      const { data: schedules, error } = await query.order('departure_time')
      
      if (error) throw error

      const filteredSchedules = (schedules || []).filter((schedule: any) => {
        const route = Array.isArray(schedule.routes) ? schedule.routes[0] : schedule.routes;
        const operatingDays = route?.operating_days || [];
        
        if (!operatingDays || operatingDays.length === 0) return true;
        return operatingDays.includes(dayName);
      });

      const transformedSchedules: Schedule[] = filteredSchedules.map((schedule: any) => {
        const bus = Array.isArray(schedule.buses) ? schedule.buses[0] : schedule.buses;
        const route = Array.isArray(schedule.routes) ? schedule.routes[0] : schedule.routes;
        
        return {
          id: schedule.id,
          route_id: schedule.route_id,
          bus_id: schedule.bus_id,
          departure_time: schedule.departure_time,
          arrival_time: schedule.arrival_time,
          fare: schedule.base_fare,
          operating_days: route?.operating_days || [],
          is_active: schedule.is_active,
          buses: {
            id: bus?.id || '',
            bus_number: bus?.bus_number || '',
            bus_type: bus?.bus_type || 'non_ac',
            total_seats: bus?.total_seats || 0,
            amenities: bus?.amenities || []
          }
        }
      })

      // Create route with schedules
      if (transformedSchedules.length > 0) {
        const firstSchedule = filteredSchedules[0]
        const route = Array.isArray(firstSchedule.routes) ? firstSchedule.routes[0] : firstSchedule.routes;
        
        const routeWithSchedules: Route = {
          id: route?.id || '',
          route_code: route?.route_code || '',
          name: route?.name || '',
          source_city: route?.source_city || '',
          destination_city: route?.destination_city || '',
          distance_km: route?.distance_km || 0,
          estimated_duration: route?.estimated_duration || '',
          base_fare: route?.base_fare || 0,
          is_active: route?.is_active || false,
          schedules: transformedSchedules
        }

        setRoutes([routeWithSchedules])
      } else {
        setRoutes([])
        setError('No buses available for selected route and date')
      }
      
    } catch (error) {
      console.error('Schedule search failed:', error)
      setError('Failed to search schedules. Please try again.')
      setRoutes([])
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
      const token = localStorage.getItem('agent_token')
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
        seatNumbers: Array.from({length: passengers.length}, (_, i) => `A${i + 1}`), // Generate seat numbers
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
                <h3 className="text-lg font-semibold text-blue-900">
                  Available Routes ({routes.length} found)
                </h3>
                <div className="grid gap-4">
                  {routes.map((route) => (
                    <Card key={route.id} className="border-2 hover:border-orange-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{route.name}</h4>
                            <p className="text-sm text-gray-600">{route.source_city} → {route.destination_city}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-semibold">{route.distance_km} km</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-blue-800">Select Schedule</Label>
                          <Select onValueChange={(value) => {
                            const schedule = route.schedules.find(s => s.id === value)
                            setSelectedRoute(route)
                            setSelectedSchedule(schedule || null)
                          }}>
                            <SelectTrigger className="border-blue-200 focus:border-blue-400">
                              <SelectValue placeholder="Choose departure time" />
                            </SelectTrigger>
                            <SelectContent>
                              {route.schedules.map((schedule) => (
                                <SelectItem key={schedule.id} value={schedule.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{schedule.departure_time} - {schedule.arrival_time}</span>
                                    <span className="ml-4 font-semibold">₹{schedule.fare}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedSchedule && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-indigo-900 mb-2">Selected Bus Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-indigo-700">
                  <div>Bus: {selectedSchedule.buses.bus_number}</div>
                  <div>Type: {selectedSchedule.buses.bus_type}</div>
                  <div>Seats: {selectedSchedule.buses.total_seats}</div>
                  <div>Fare: ₹{selectedSchedule.fare}</div>
                </div>
              </div>
            )}

            {/* Journey Date */}
            {selectedSchedule && (
              <div>
                <Label htmlFor="journeyDate" className="text-blue-800">Journey Date</Label>
                <Input
                  id="journeyDate"
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            )}

            {/* Passenger Details */}
            {selectedSchedule && journeyDate && (
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
                  <Card key={index} className="border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-blue-900">
                          Passenger {index + 1}
                        </CardTitle>
                        {passengers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePassenger(index)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-blue-800">Full Name</Label>
                        <Input
                          value={passenger.name}
                          onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-blue-800">Age</Label>
                        <Input
                          type="number"
                          value={passenger.age || ''}
                          onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                          min="1"
                          max="120"
                          required
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-blue-800">Gender</Label>
                        <Select
                          value={passenger.gender}
                          onValueChange={(value) => updatePassenger(index, 'gender', value)}
                        >
                          <SelectTrigger className="border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-blue-800">Phone</Label>
                        <Input
                          value={passenger.phone}
                          onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-blue-800">Email</Label>
                        <Input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-blue-800">ID Type</Label>
                        <Select
                          value={passenger.id_type}
                          onValueChange={(value) => updatePassenger(index, 'id_type', value)}
                        >
                          <SelectTrigger className="border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aadhar">Aadhar Card</SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-blue-800">ID Number</Label>
                        <Input
                          value={passenger.id_number}
                          onChange={(e) => updatePassenger(index, 'id_number', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Contact Details */}
            {passengers.length > 0 && passengers[0].name && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-blue-800">Contact Name</Label>
                    <Input
                      value={contactDetails.name}
                      onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800">Contact Phone</Label>
                    <Input
                      value={contactDetails.phone}
                      onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800">Contact Email</Label>
                    <Input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
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
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
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
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 w-full">
                      <div className="text-green-800 font-semibold">
                        Total Fare: ₹{calculateTotalFare()}
                      </div>
                      <div className="text-green-600 text-sm">
                        {passengers.length} passenger(s) × ₹{selectedSchedule?.fare || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-blue-800">Special Requests (Optional)</Label>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3"
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
