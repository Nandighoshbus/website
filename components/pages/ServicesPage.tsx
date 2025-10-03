"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, Clock, Shield, Star, Users, Wifi, Coffee, Music, Phone, MapPin } from "lucide-react"
import Link from "next/link"

const languages = {
  en: {
    pageTitle: "Our Services",
    subtitle: "Comprehensive Transportation Solutions Across Odisha",
    description: "Discover our range of premium bus services designed to make your journey comfortable, safe, and memorable.",
    busServices: "Bus Services",
    additionalServices: "Additional Services",
    bookNow: "Book Now",
    contactUs: "Contact Us",
    startingFrom: "Starting from",
    perPerson: "per person",
    operatedBy: "Operated by Saurav Nanda"
  }
}

interface ServicesPageProps {
  currentLanguage: string
}

export default function ServicesPage({ currentLanguage }: ServicesPageProps) {
  const currentLang = languages[currentLanguage as keyof typeof languages] || languages.en

  const busServices = [
    {
      id: 1,
      name: "AC Sleeper Coach",
      description: "Premium air-conditioned sleeper buses with comfortable berths, individual reading lights, and charging points. Perfect for overnight journeys.",
      features: ["2+1 seating configuration", "Individual AC vents", "Reading lights", "Mobile charging points", "Clean bedding", "Privacy curtains"],
      routes: ["Balasore - Bhubaneswar", "Balasore - Cuttack", "Balasore - Puri"],
      price: "₹800 - ₹1,200",
      duration: "4-8 hours",
      icon: <Bus className="w-8 h-8 text-blue-600" />
    },
    {
      id: 2,
      name: "AC Semi-Sleeper",
      description: "Comfortable semi-sleeper buses with reclining seats and air conditioning. Ideal for day and evening travels.",
      features: ["Reclining push-back seats", "Air conditioning", "Entertainment system", "Onboard restroom", "Professional driver", "GPS tracking"],
      routes: ["Balasore - Kolkata", "Balasore - Berhampur", "Balasore - Sambalpur"],
      price: "₹500 - ₹800",
      duration: "3-6 hours",
      icon: <Bus className="w-8 h-8 text-green-600" />
    },
    {
      id: 3,
      name: "Deluxe Non-AC",
      description: "Economical yet comfortable non-AC buses with cushioned seats and large windows for scenic views.",
      features: ["Comfortable seating", "Large windows", "Music system", "Safe driving", "Affordable pricing", "Regular service"],
      routes: ["Local Balasore routes", "Balasore - Mayurbhanj", "Balasore - Jaleswar"],
      price: "₹150 - ₹400",
      duration: "1-4 hours",
      icon: <Bus className="w-8 h-8 text-orange-600" />
    },
    {
      id: 4,
      name: "Luxury Coach",
      description: "Premium luxury buses with leather seats, entertainment systems, and complimentary refreshments.",
      features: ["Leather seats", "Entertainment system", "WiFi connectivity", "Complimentary snacks", "Attendant service", "Premium comfort"],
      routes: ["Balasore - Bhubaneswar Express", "Special tourist routes"],
      price: "₹1,200 - ₹1,800",
      duration: "3-5 hours",
      icon: <Star className="w-8 h-8 text-purple-600" />
    }
  ]

  const additionalServices = [
    {
      name: "Group Bookings",
      description: "Special rates for groups of 15+ passengers. Perfect for corporate trips, family functions, and educational tours.",
      price: "₹100 - ₹300 per person",
      features: ["Bulk booking discounts", "Flexible scheduling", "Dedicated support", "Custom routes"],
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      name: "Parcel Service",
      description: "Safe and reliable parcel delivery service across our network routes with door-to-door pickup and delivery.",
      price: "₹50 - ₹200 per kg",
      features: ["Door-to-door service", "Tracking facility", "Insurance coverage", "Same day delivery"],
      icon: <MapPin className="w-6 h-6 text-green-600" />
    },
    {
      name: "Charter Services",
      description: "Exclusive bus charter for events, weddings, corporate outings, and special occasions.",
      price: "₹15,000 - ₹25,000 per day",
      features: ["Dedicated bus", "Custom itinerary", "Professional driver", "Fuel included"],
      icon: <Bus className="w-6 h-6 text-orange-600" />
    },
    {
      name: "24/7 Customer Support",
      description: "Round-the-clock customer assistance for bookings, queries, and emergency support.",
      price: "Free service",
      features: ["Phone support", "WhatsApp assistance", "Live chat", "Emergency helpline"],
      icon: <Phone className="w-6 h-6 text-purple-600" />
    }
  ]

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 min-h-[50vh] flex items-center section-glass">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white text-lg px-6 py-2 hover:bg-white/20">
              {currentLang.operatedBy}
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {currentLang.pageTitle}
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 font-light mb-4">
              {currentLang.subtitle}
            </p>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {currentLang.description}
            </p>
          </div>
        </div>
      </section>

      {/* Bus Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentLang.busServices}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our range of comfortable and reliable bus services
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {busServices.map((service) => (
              <Card key={service.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {service.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{service.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold text-orange-600">{service.price}</span>
                        <span className="text-sm text-gray-600">{currentLang.perPerson}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Popular Routes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.routes.map((route, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {route}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <Link href="/booking">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                        {currentLang.bookNow}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentLang.additionalServices}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Beyond transportation - comprehensive services for all your travel needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="shadow-sm border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{service.name}</CardTitle>
                  <div className="text-lg font-semibold text-orange-600">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4 text-center">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Guarantees */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Service Guarantees</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your satisfaction and safety are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safety First</h3>
              <p className="text-gray-600">All buses undergo regular maintenance and safety checks. Professional drivers with clean records.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">On-Time Service</h3>
              <p className="text-gray-600">99.8% on-time performance. Real-time tracking and updates for all journeys.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600">Highest standards of cleanliness, comfort, and customer service on every journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 section-glass">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Ready to Travel with Us?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your journey today or contact us for custom travel solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Book Your Journey
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg font-semibold">
                {currentLang.contactUs}
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-white/80">
            <p className="text-sm">24/7 Customer Support: +91 9778835361</p>
            <p className="text-xs mt-1">Operated by Saurav Nanda | Balasore, Odisha</p>
          </div>
        </div>
      </section>
    </div>
  )
}
