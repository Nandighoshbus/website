"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Percent, Gift, Calendar, MapPin, Users, Star, Clock, Phone } from "lucide-react"

interface OffersPageProps {
  currentLang: any
}

const offers = [
  {
    id: 1,
    title: {
      en: "Early Bird Special",
      hi: "अर्ली बर्ड स्पेशल",
      or: "ଅର୍ଲି ବାର୍ଡ ସ୍ପେଶାଲ"
    },
    description: {
      en: "Book 7 days in advance and save up to 20% on your journey",
      hi: "7 दिन पहले बुक करें और अपनी यात्रा पर 20% तक की बचत करें",
      or: "୭ ଦିନ ଆଗରୁ ବୁକ କରନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଯାତ୍ରାରେ ୨୦% ପର୍ଯ୍ୟନ୍ତ ସଞ୍ଚୟ କରନ୍ତୁ"
    },
    discount: "20%",
    validTill: "31st Dec 2025",
    routes: ["Bhubaneswar - Cuttack", "Puri - Berhampur", "All Routes"],
    icon: <Calendar className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    badge: "LIMITED TIME"
  },
  {
    id: 2,
    title: {
      en: "Student Discount",
      hi: "छात्र छूट",
      or: "ଛାତ୍ର ରିହାତି"
    },
    description: {
      en: "Valid student ID holders get 15% off on all routes",
      hi: "वैध छात्र आईडी धारकों को सभी रूट पर 15% छूट",
      or: "ବୈଧ ଛାତ୍ର ଆଇଡି ଧାରୀମାନେ ସମସ୍ତ ରୁଟରେ ୧୫% ରିହାତି ପାଇବେ"
    },
    discount: "15%",
    validTill: "Ongoing",
    routes: ["All Educational Routes", "Weekend Specials"],
    icon: <Users className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    badge: "STUDENT SPECIAL"
  },
  {
    id: 3,
    title: {
      en: "Weekend Getaway",
      hi: "वीकेंड गेटअवे",
      or: "ୱିକଏଣ୍ଡ ଗେଟଆୱେ"
    },
    description: {
      en: "Special weekend packages with 25% off on return journeys",
      hi: "रिटर्न जर्नी पर 25% छूट के साथ विशेष वीकेंड पैकेज",
      or: "ରିଟର୍ନ ଯାତ୍ରାରେ ୨୫% ରିହାତି ସହିତ ସ୍ପେଶାଲ ୱିକଏଣ୍ଡ ପ୍ୟାକେଜ"
    },
    discount: "25%",
    validTill: "Every Weekend",
    routes: ["Tourist Destinations", "Hill Stations", "Beach Routes"],
    icon: <MapPin className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    badge: "WEEKEND ONLY"
  },
  {
    id: 4,
    title: {
      en: "Senior Citizens",
      hi: "वरिष्ठ नागरिक",
      or: "ବରିଷ୍ଠ ନାଗରିକ"
    },
    description: {
      en: "Citizens above 60 years get special 10% discount on all bookings",
      hi: "60 वर्ष से अधिक नागरिकों को सभी बुकिंग पर विशेष 10% छूट",
      or: "୬୦ ବର୍ଷରୁ ଅଧିକ ନାଗରିକମାନେ ସମସ୍ତ ବୁକିଂରେ ବିଶେଷ ୧୦% ରିହାତି ପାଇବେ"
    },
    discount: "10%",
    validTill: "Permanent",
    routes: ["All Routes", "Priority Seating"],
    icon: <Star className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    badge: "SENIOR CARE"
  },
  {
    id: 5,
    title: {
      en: "Group Booking",
      hi: "ग्रुप बुकिंग",
      or: "ଗ୍ରୁପ ବୁକିଂ"
    },
    description: {
      en: "Book for 10+ passengers and get up to 30% group discount",
      hi: "10+ यात्रियों के लिए बुक करें और 30% तक ग्रुप डिस्काउंट पाएं",
      or: "୧୦+ ଯାତ୍ରୀଙ୍କ ପାଇଁ ବୁକ କରନ୍ତୁ ଏବଂ ୩୦% ପର୍ଯ୍ୟନ୍ତ ଗ୍ରୁପ ରିହାତି ପାଆନ୍ତୁ"
    },
    discount: "30%",
    validTill: "Year Round",
    routes: ["Corporate Travel", "Family Tours", "School Trips"],
    icon: <Users className="w-6 h-6" />,
    color: "from-teal-500 to-blue-500",
    badge: "GROUP SPECIAL"
  },
  {
    id: 6,
    title: {
      en: "Festival Special",
      hi: "त्योहार विशेष",
      or: "ପର୍ବ ବିଶେଷ"
    },
    description: {
      en: "Special discounts during festivals and holiday seasons",
      hi: "त्योहारों और छुट्टियों के मौसम में विशेष छूट",
      or: "ପର୍ବ ଏବଂ ଛୁଟିଦିନ ସମୟରେ ସ୍ପେଶାଲ ରିହାତି"
    },
    discount: "Up to 35%",
    validTill: "During Festivals",
    routes: ["Festival Routes", "Pilgrimage", "Special Occasions"],
    icon: <Gift className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    badge: "FESTIVAL OFFER"
  }
]

export default function OffersPage({ currentLang }: OffersPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {currentLang.offersTitle || "Special Offers"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {currentLang.offersDescription || "Discover amazing deals and save more on your journey with Nandighosh Travels. From early bird specials to group discounts, we have something for everyone."}
          </p>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <Percent className="w-6 h-6" />
            <span className="text-lg font-semibold">{currentLang.saveMore || "Save More, Travel More"}</span>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${offer.color}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${offer.color} text-white`}>
                    {offer.icon}
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-semibold">
                    {offer.badge}
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                  {offer.title.en}
                </CardTitle>
                
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {offer.description.en}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Discount Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Percent className="w-5 h-5 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">{offer.discount}</span>
                    <span className="text-gray-500">OFF</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{currentLang.validTill || "Valid Till"}</p>
                    <p className="text-sm font-semibold text-gray-800">{offer.validTill}</p>
                  </div>
                </div>

                {/* Routes */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentLang.applicableRoutes || "Applicable Routes"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {offer.routes.map((route, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button className={`flex-1 bg-gradient-to-r ${offer.color} hover:shadow-lg transition-all duration-300 text-white`}>
                    {currentLang.bookNow || "Book Now"}
                  </Button>
                  <Button variant="outline" className="px-4 hover:bg-gray-50">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-16">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {currentLang.dontMissOut || "Don't Miss Out on These Amazing Deals!"}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            {currentLang.limitedTime || "Limited time offers that make your journey more affordable and comfortable."}
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-12 py-4 text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
              {currentLang.bookYourJourney || "Book Your Journey"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
