"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, MapPin, Award, Shield, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
        <div className="absolute inset-0 bg-black/30 z-20"></div>
        
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
                    className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    {currentLang.bookSeat}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/routes">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <MapPin className="mr-2 w-5 h-5" />
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

            {/* Bus Image */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <img 
                  src="/images/homepage.jpeg" 
                  alt="Premium Nandighosh Bus"
                  className="w-full max-w-lg h-96 object-cover rounded-xl shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-orange-800 rounded-full p-3">
                  <Award className="w-6 h-6" />
                </div>
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
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Award Winning Service</h3>
              <p className="text-gray-600">
                Recognized for excellence in passenger service and safety standards across Odisha
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">100% Safe Travel</h3>
              <p className="text-gray-600">
                Advanced safety features, GPS tracking, and experienced drivers ensure secure journeys
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">5-Star Comfort</h3>
              <p className="text-gray-600">
                Luxury AC coaches with reclining seats, entertainment, and premium amenities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Premium Fleet
            </h2>
            <p className="text-xl text-gray-600">
              Modern buses equipped with the latest amenities for your comfort
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/bus-fleet.jpg" 
                alt="Nandighosh Bus Fleet"
                className="w-full h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-800">
                Experience Luxury Travel
              </h3>
              <p className="text-lg text-gray-600">
                Our fleet features state-of-the-art buses with traditional Odisha artwork, 
                combining cultural heritage with modern comfort.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Premium AC Sleeper & Semi-Sleeper coaches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>GPS tracking and real-time updates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Entertainment systems and WiFi</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>24/7 customer support</span>
                </li>
              </ul>
              <Link href="/features">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg">
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
