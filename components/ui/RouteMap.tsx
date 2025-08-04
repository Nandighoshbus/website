"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bus, Clock, Navigation, Star, Route, ExternalLink } from "lucide-react"

interface City {
  id: string
  name: string
  lat: number
  lng: number
  isHub: boolean
  routes: string[]
  description: string
}

const cities: City[] = [
  {
    id: "balasore",
    name: "Balasore",
    lat: 21.4942,
    lng: 87.0349,
    isHub: true,
    routes: ["bhubaneswar", "kolkata"],
    description: "Northern hub with connections to Kolkata"
  },
  {
    id: "kolkata",
    name: "Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    isHub: false,
    routes: ["balasore"],
    description: "Major metropolitan connection"
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    lat: 20.2961,
    lng: 85.8245,
    isHub: true,
    routes: ["balasore", "cuttack", "puri", "berhampur", "rourkela"],
    description: "Capital city - Main hub"
  },
  {
    id: "cuttack",
    name: "Cuttack",
    lat: 20.4625,
    lng: 85.8828,
    isHub: true,
    routes: ["bhubaneswar", "sambalpur"],
    description: "Historic city with industrial connections"
  },
  {
    id: "puri",
    name: "Puri",
    lat: 19.8135,
    lng: 85.8312,
    isHub: false,
    routes: ["bhubaneswar"],
    description: "Sacred pilgrimage destination"
  },
  {
    id: "berhampur",
    name: "Berhampur",
    lat: 19.3149,
    lng: 84.7941,
    isHub: true,
    routes: ["bhubaneswar", "koraput"],
    description: "Southern commercial center"
  },
  {
    id: "sambalpur",
    name: "Sambalpur",
    lat: 21.4669,
    lng: 83.9812,
    isHub: false,
    routes: ["cuttack"],
    description: "Western Odisha connection"
  },
  {
    id: "rourkela",
    name: "Rourkela",
    lat: 22.2604,
    lng: 84.8536,
    isHub: false,
    routes: ["bhubaneswar"],
    description: "Steel city in northern Odisha"
  },
  {
    id: "koraput",
    name: "Koraput",
    lat: 18.8120,
    lng: 82.7102,
    isHub: false,
    routes: ["berhampur"],
    description: "Tribal district headquarters"
  }
]

interface RouteMapProps {
  currentLanguage: string
}

const languages = {
  en: {
    routeNetwork: "Interactive Route Map",
    networkDescription: "Explore our comprehensive bus network across Odisha and neighboring regions",
    mainHub: "Main Hub",
    connectingCity: "Connecting City",
    clickToExplore: "Click on any city to explore routes",
    directRoutes: "Direct Routes",
    selectCity: "Select a city to view routes"
  },
  hi: {
    routeNetwork: "इंटरैक्टिव रूट मैप",
    networkDescription: "ओडिशा और पड़ोसी क्षेत्रों में हमारे व्यापक बस नेटवर्क का अन्वेषण करें",
    mainHub: "मुख्य केंद्र",
    connectingCity: "कनेक्टिंग सिटी",
    clickToExplore: "रूट्स देखने के लिए किसी भी शहर पर क्लिक करें",
    directRoutes: "सीधे रूट्स",
    selectCity: "रूट्स देखने के लिए एक शहर चुनें"
  },
  or: {
    routeNetwork: "ଇଣ୍ଟରଆକ୍ଟିଭ ରୁଟ ମ୍ୟାପ",
    networkDescription: "ଓଡ଼ିଶା ଏବଂ ପଡ଼ୋଶୀ ଅଞ୍ଚଳରେ ଆମର ବ୍ୟାପକ ବସ ନେଟୱାର୍କ ଅନୁସନ୍ଧାନ କରନ୍ତୁ",
    mainHub: "ମୁଖ୍ୟ କେନ୍ଦ୍ର",
    connectingCity: "ସଂଯୋଗକାରୀ ସହର",
    clickToExplore: "ରୁଟ ଦେଖିବା ପାଇଁ କୌଣସି ସହରରେ କ୍ଲିକ କରନ୍ତୁ",
    directRoutes: "ସିଧା ରୁଟ",
    selectCity: "ରୁଟ ଦେଖିବା ପାଇଁ ଏକ ସହର ବାଛନ୍ତୁ"
  }
}

export default function RouteMap({ currentLanguage }: RouteMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [mapType, setMapType] = useState<'google' | 'osm' | 'custom'>('google')
  const [mapKey, setMapKey] = useState(0) // Key to force iframe refresh
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false)
  const currentLang = languages[currentLanguage as keyof typeof languages]

  const selectedCityData = selectedCity ? cities.find(city => city.id === selectedCity) : null

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsGettingLocation(false)
        setMapKey(prev => prev + 1) // Refresh map
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location."
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        setLocationError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Refresh map when selected city changes
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [selectedCity])

  // Refresh map when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapKey(prev => prev + 1)
    }
  }, [userLocation])

  // Auto-get location when OSM is selected
  useEffect(() => {
    if (mapType === 'osm' && !userLocation && !locationError) {
      getUserLocation()
    }
  }, [mapType, userLocation, locationError])

  const getConnectedCities = (cityId: string) => {
    const city = cities.find(c => c.id === cityId)
    if (!city) return []
    return city.routes.map(routeId => cities.find(c => c.id === routeId)).filter(Boolean)
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  // Get nearest cities to user location
  const getNearestCities = () => {
    if (!userLocation) return []
    
    return cities
      .map(city => ({
        ...city,
        distance: calculateDistance(userLocation.lat, userLocation.lng, city.lat, city.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Top 5 nearest cities
  }

  // Create Google Maps URL with multiple markers for all destinations
  const createGoogleMapsUrl = () => {
    if (selectedCity) {
      const selected = cities.find(c => c.id === selectedCity)
      if (selected) {
        // Show specific city centered on map
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(selected.name + ', Odisha, India')}&center=${selected.lat},${selected.lng}&zoom=10`
      }
    }
    
    // Use a simpler approach - show region with search query for all cities
    const searchQuery = cities.map(city => `${city.name}+Odisha`).join('+OR+')
    return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=bus+stations+in+${searchQuery}&center=20.5,85&zoom=7`
  }

  // Create OpenStreetMap URL based on user location
  const createOSMUrl = () => {
    if (userLocation) {
      // Center map on user's location with nearby bus service cities
      const zoom = 10
      const bbox = {
        minLng: userLocation.lng - 0.5,
        minLat: userLocation.lat - 0.3,
        maxLng: userLocation.lng + 0.5,
        maxLat: userLocation.lat + 0.3
      }
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`
    }
    
    // Fallback to Odisha region if no user location (not Chennai)
    return `https://www.openstreetmap.org/export/embed.html?bbox=82.0,18.0,88.0,23.0&layer=mapnik&marker=20.5,85.0`
  }

  // Create URL for View Full Map button
  const getFullMapUrl = () => {
    if (userLocation) {
      // If user location is available, center the map on their location
      return `https://www.google.com/maps/search/bus+stations/@${userLocation.lat},${userLocation.lng},12z`
    }
    
    // Fallback to Odisha region with bus stations
    return `https://www.google.com/maps/search/bus+stations+Odisha/@20.5,85.0,8z`
  }
  const getFallbackGoogleMapsUrl = () => {
    if (selectedCity) {
      const selected = cities.find(c => c.id === selectedCity)
      if (selected) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115830.83!2d${selected.lng}!3d${selected.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(selected.name + ', Odisha')}!5e0!3m2!1sen!2sin!4v1691234567890!5m2!1sen!2sin`
      }
    }
    
    // Default map showing Odisha region with major cities
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1897387.5436861162!2d84.0!3d20.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a259af1c5f944ab%3A0x5047b0db2c7bb0e1!2sOdisha%2C%20India!5e0!3m2!1sen!2sin!4v1691234567890!5m2!1sen!2sin&q=Balasore+Bhubaneswar+Cuttack+Puri+Berhampur+Sambalpur+Rourkela+Koraput+Odisha`
  }

  // Convert lat/lng to percentage for custom map
  const coordToPercent = (city: City) => {
    const bounds = {
      minLat: 18.0, maxLat: 23.0,
      minLng: 82.0, maxLng: 88.0
    }
    return {
      x: ((city.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100,
      y: 100 - ((city.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {currentLang.routeNetwork}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {currentLang.networkDescription}
          </p>
          <p className="text-sm text-gray-500">
            Explore our service areas with interactive maps
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Real Map Section */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center">
                      <Navigation className="w-6 h-6 mr-2 text-orange-600" />
                      Interactive Route Map
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setMapType('google')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          mapType === 'google' 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Google
                      </button>
                      <button
                        onClick={() => setMapType('osm')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          mapType === 'osm' 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        OpenMap
                      </button>
                      <button
                        onClick={() => setMapType('custom')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          mapType === 'custom' 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Routes
                      </button>
                      <Badge className="bg-green-100 text-green-800">
                        Live
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                {/* Map Embed */}
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-slate-100">
                  {mapType === 'google' ? (
                    <iframe
                      key={mapKey}
                      src={getFallbackGoogleMapsUrl()}
                      width="100%"
                      height="500"
                      className="border-0 rounded-lg"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Nandighosh Bus Service Route Map - All Destinations"
                    ></iframe>
                  ) : mapType === 'osm' ? (
                    <div className="relative">
                      <iframe
                        key={mapKey}
                        src={createOSMUrl()}
                        width="100%"
                        height="500"
                        className="border-0 rounded-lg"
                        title="Nandighosh Bus Service Route Map - Your Location"
                      ></iframe>
                      
                      {/* Location controls overlay */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={getUserLocation}
                            disabled={isGettingLocation}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isGettingLocation 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg'
                            }`}
                          >
                            <Navigation className="w-4 h-4" />
                            <span>{isGettingLocation ? 'Getting Location...' : 'Find My Location'}</span>
                          </button>
                          
                          {userLocation && (
                            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>Location found!</span>
                              </div>
                              <div className="mt-1 text-gray-600">
                                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                              </div>
                            </div>
                          )}
                          
                          {locationError && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              <div className="flex items-center space-x-1">
                                <ExternalLink className="w-3 h-3" />
                                <span>Error:</span>
                              </div>
                              <div className="mt-1">{locationError}</div>
                              <button
                                onClick={getUserLocation}
                                className="mt-2 text-orange-600 hover:text-orange-800 underline text-xs font-medium"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Custom Interactive Route Map
                    <div className="relative bg-gradient-to-br from-blue-100 via-green-50 to-indigo-100 h-[500px] rounded-lg overflow-hidden">
                      {/* Background Map Style */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-100 to-orange-100"></div>
                        {/* Grid pattern */}
                        <div className="absolute inset-0 bg-blue-50">
                        </div>
                      </div>

                      {/* Route Lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {cities.map(city => 
                          city.routes.map(routeId => {
                            const targetCity = cities.find(c => c.id === routeId)
                            if (!targetCity) return null
                            
                            const cityPos = coordToPercent(city)
                            const targetPos = coordToPercent(targetCity)
                            const isHighlighted = selectedCity === city.id || selectedCity === targetCity.id
                            
                            return (
                              <line
                                key={`${city.id}-${routeId}`}
                                x1={`${cityPos.x}%`}
                                y1={`${cityPos.y}%`}
                                x2={`${targetPos.x}%`}
                                y2={`${targetPos.y}%`}
                                stroke={isHighlighted ? "#f97316" : "#64748b"}
                                strokeWidth={isHighlighted ? "4" : "2"}
                                strokeDasharray={isHighlighted ? "0" : "8,4"}
                                className="transition-all duration-500"
                                opacity={isHighlighted ? "1" : "0.6"}
                              />
                            )
                          })
                        )}
                      </svg>

                      {/* City Markers */}
                      {cities.map(city => {
                        const position = coordToPercent(city)
                        const isSelected = selectedCity === city.id
                        const isConnected = selectedCity ? getConnectedCities(selectedCity).some(c => c?.id === city.id) : false
                        const isHighlighted = isSelected || isConnected
                        
                        return (
                          <div
                            key={city.id}
                            className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                              isSelected ? 'z-30' : isHighlighted ? 'z-20' : 'z-10'
                            }`}
                            style={{ 
                              left: `${position.x}%`, 
                              top: `${position.y}%`
                            }}
                            onClick={() => setSelectedCity(selectedCity === city.id ? null : city.id)}
                          >
                            {/* City Marker */}
                            <div className={`
                              relative flex items-center justify-center rounded-full transition-all duration-300 shadow-lg
                              ${city.isHub ? 'w-14 h-14' : 'w-10 h-10'}
                              ${isSelected ? 'ring-4 ring-orange-400 ring-opacity-75 scale-110' : ''}
                              ${isHighlighted ? 'bg-gradient-to-r from-orange-500 to-red-500 scale-105' : 
                                city.isHub ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}
                              hover:scale-110
                            `}>
                              {city.isHub ? (
                                <Bus className="w-6 h-6 text-white" />
                              ) : (
                                <MapPin className="w-4 h-4 text-white" />
                              )}
                              
                              {/* Pulse animation for selected city */}
                              {isSelected && (
                                <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                              )}
                            </div>

                            {/* City Label */}
                            <div className={`
                              absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                              px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg
                              ${isHighlighted ? 'bg-orange-500 text-white scale-105' : 'bg-white text-gray-700'}
                              ${isSelected ? 'bg-orange-600 text-white' : ''}
                            `}>
                              {city.name}
                              {city.isHub && (
                                <Badge className="ml-1 bg-green-500 text-white text-xs px-1 py-0">
                                  HUB
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* Map Legend */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Service Coverage</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <Bus className="w-2 h-2 text-white" />
                            </div>
                            <span className="text-gray-700">Major Hub ({cities.filter(c => c.isHub).length})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                              <MapPin className="w-2 h-2 text-white" />
                            </div>
                            <span className="text-gray-700">Service Point ({cities.filter(c => !c.isHub).length})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-1 bg-orange-500 rounded"></div>
                            <span className="text-gray-700">Active Route</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-1 bg-gray-400 rounded border-dashed border border-gray-400"></div>
                            <span className="text-gray-700">Available Route</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Map Overlay with Cities - Minimizable */}
                  {mapType === 'google' && (
                    <div className={`absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 ${
                      isOverlayMinimized ? 'max-w-fit' : 'max-w-sm'
                    }`}>
                      {/* Header with minimize button */}
                      <div className="flex items-center justify-between p-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                          <Bus className="w-4 h-4 mr-2 text-orange-600" />
                          {isOverlayMinimized ? 'Destinations' : 'Nandighosh Bus Destinations'}
                        </h4>
                        <button
                          onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={isOverlayMinimized ? 'Expand' : 'Minimize'}
                        >
                          {isOverlayMinimized ? (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* Collapsible content */}
                      {!isOverlayMinimized && (
                        <div className="p-3">
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            {cities.map(city => (
                              <div 
                                key={city.id} 
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                                  selectedCity === city.id 
                                    ? 'bg-orange-100 text-orange-800 font-medium' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedCity(selectedCity === city.id ? null : city.id)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    city.isHub ? 'bg-orange-500' : 'bg-blue-500'
                                  }`}></div>
                                  <span className="font-medium">{city.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {city.isHub ? 'HUB' : getConnectedCities(city.id).length + ' routes'}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              {selectedCity 
                                ? `Showing routes from ${cities.find(c => c.id === selectedCity)?.name}` 
                                : 'All destinations marked on map'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Minimized quick view */}
                      {isOverlayMinimized && (
                        <div className="p-2">
                          <div className="flex items-center space-x-1">
                            {cities.slice(0, 3).map(city => (
                              <div 
                                key={city.id}
                                className={`w-3 h-3 rounded-full cursor-pointer ${
                                  city.isHub ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                                title={city.name}
                                onClick={() => setSelectedCity(city.id)}
                              ></div>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">+{cities.length - 3}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Full Map Button */}
                  <div className="absolute bottom-4 right-4">
                    <a
                      href={getFullMapUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Full Map</span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* City Details */}
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  {mapType === 'osm' && userLocation ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Nearest Bus Services</h3>
                        <Badge className="bg-green-100 text-green-800">
                          <MapPin className="w-3 h-3 mr-1" />
                          Your Location
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm">
                        Based on your current location, here are the nearest Nandighosh bus stations:
                      </p>
                      
                      <div className="space-y-2">
                        {getNearestCities().map((nearestCity, index) => (
                          <div 
                            key={nearestCity.id}
                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                            onClick={() => setSelectedCity(nearestCity.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold shadow-sm">
                                {index + 1}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">{nearestCity.name}</span>
                                {nearestCity.isHub && (
                                  <Badge className="ml-1 bg-orange-500 text-white text-xs px-1 py-0">
                                    HUB
                                  </Badge>
                                )}
                                <div className="text-xs text-gray-500">{nearestCity.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-orange-600">
                                {nearestCity.distance.toFixed(1)} km
                              </div>
                              <div className="text-xs text-gray-500">
                                ~{Math.round(nearestCity.distance * 1.5)}min drive
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bus className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-800">
                            Tip: Click on any city above to see available routes
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : selectedCityData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{selectedCityData.name}</h3>
                        {selectedCityData.isHub && (
                          <Badge className="bg-orange-100 text-orange-800">{currentLang.mainHub}</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm">{selectedCityData.description}</p>
                      
                      {userLocation && (
                        <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                          <Navigation className="w-4 h-4" />
                          <span>
                            {calculateDistance(userLocation.lat, userLocation.lng, selectedCityData.lat, selectedCityData.lng).toFixed(1)} km from your location
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Route className="w-4 h-4 mr-2 text-orange-600" />
                          {currentLang.directRoutes} ({getConnectedCities(selectedCityData.id).length})
                        </h4>
                        <div className="space-y-2">
                          {getConnectedCities(selectedCityData.id).map(connectedCity => (
                            <div 
                              key={connectedCity?.id}
                              className="flex items-center justify-between p-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                              onClick={() => setSelectedCity(connectedCity?.id || null)}
                            >
                              <span className="text-sm font-medium text-gray-700">{connectedCity?.name}</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {connectedCity?.isHub ? "2-4h" : "1-3h"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">
                        {mapType === 'osm' 
                          ? 'Enable location to find nearest bus services' 
                          : currentLang.selectCity
                        }
                      </p>
                      {mapType === 'osm' && (
                        <button
                          onClick={getUserLocation}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg"
                        >
                          Get My Location
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}