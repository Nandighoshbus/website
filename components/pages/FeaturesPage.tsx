
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, Clock, Shield, Wifi, Coffee, CheckCircle, Phone, Star, ChevronLeft, ChevronRight, Crown, Zap, Heart, Eye } from "lucide-react"
import Image from "next/image"

const languages = {
  en: {
    whyChooseUs: "Why Choose Us",
    premiumExperience: "Premium Travel Experience",
    featuresDescription: "Discover the luxury and comfort that makes Nandighosh the preferred choice for travelers",
    acSleeperCoaches: "AC Sleeper Coaches",
    acSleeperDesc: "Luxurious sleeper coaches with individual berths and premium amenities for a comfortable overnight journey",
    timelyDeparture: "Timely Departure",
    timelyDepartureDesc: "99.8% on-time performance with real-time tracking and professional drivers ensuring punctual service",
    safeSecure: "Safe & Secure",
    safeSecureDesc: "Advanced safety features, GPS tracking, and trained drivers ensure your journey is completely secure",
    modernAmenities: "Modern Amenities",
    modernAmenitiesDesc: "Free WiFi, charging ports, entertainment systems, and refreshments for a premium travel experience",
    additionalAmenities: "Additional Amenities & Features",
  },
  hi: {
    whyChooseUs: "हमें क्यों चुनें",
    premiumExperience: "प्रीमियम यात्रा अनुभव",
    featuresDescription: "उस लक्जरी और आराम की खोज करें जो नंदीघोष को यात्रियों की पसंदीदा पसंद बनाती है",
    acSleeperCoaches: "एसी स्लीपर कोच",
    acSleeperDesc: "आरामदायक रात्रि यात्रा के लिए व्यक्तिगत बर्थ और प्रीमियम सुविधाओं के साथ लक्जरी स्लीपर कोच",
    timelyDeparture: "समय पर प्रस्थान",
    timelyDepartureDesc: "वास्तविक समय ट्रैकिंग और पेशेवर ड्राइवरों के साथ 99.8% समय पर प्रदर्शन",
    safeSecure: "सुरक्षित और संरक्षित",
    safeSecureDesc: "उन्नत सुरक्षा सुविधाएं, जीपीएस ट्रैकिंग, और प्रशिक्षित ड्राइवर आपकी यात्रा को पूरी तरह सुरक्षित बनाते हैं",
    modernAmenities: "आधुनिक सुविधाएं",
    modernAmenitiesDesc: "प्रीमियम यात्रा अनुभव के लिए मुफ्त वाईफाई, चार्जिंग पोर्ट, मनोरंजन सिस्टम और जलपान",
    additionalAmenities: "अतिरिक्त सुविधाएं और विशेषताएं",
  },
  or: {
    whyChooseUs: "ଆମକୁ କାହିଁକି ବାଛନ୍ତୁ",
    premiumExperience: "ପ୍ରିମିୟମ୍ ଯାତ୍ରା ଅଭିଜ୍ଞତା",
    featuresDescription: "ସେହି ବିଳାସ ଏବଂ ଆରାମ ଆବିଷ୍କାର କରନ୍ତୁ ଯାହା ନନ୍ଦିଘୋଷକୁ ଯାତ୍ରୀମାନଙ୍କର ପସନ୍ଦିତ ପସନ୍ଦ କରେ",
    acSleeperCoaches: "ଏସି ସ୍ଲିପର କୋଚ୍",
    acSleeperDesc: "ଆରାମଦାୟକ ରାତିର ଯାତ୍ରା ପାଇଁ ବ୍ୟକ୍ତିଗତ ବର୍ଥ ଏବଂ ପ୍ରିମିୟମ୍ ସୁବିଧା ସହିତ ବିଳାସପୂର୍ଣ୍ଣ ସ୍ଲିପର କୋଚ୍",
    timelyDeparture: "ସମୟରେ ପ୍ରସ୍ଥାନ",
    timelyDepartureDesc: "ରିଅଲ୍ ଟାଇମ୍ ଟ୍ରାକିଂ ଏବଂ ପେସାଦାର ଡ୍ରାଇଭରମାନଙ୍କ ସହିତ 99.8% ସମୟରେ କାର୍ଯ୍ୟଦକ୍ଷତା",
    safeSecure: "ନିରାପଦ ଏବଂ ସୁରକ୍ଷିତ",
    safeSecureDesc: "ଉନ୍ନତ ସୁରକ୍ଷା ବ୍ୟବସ୍ଥା, ଜିପିଏସ୍ ଟ୍ରାକିଂ, ଏବଂ ତାଲିମପ୍ରାପ୍ତ ଡ୍ରାଇଭରମାନେ ଆପଣଙ୍କ ଯାତ୍ରାକୁ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ କରନ୍ତି",
    modernAmenities: "ଆଧୁନିକ ସୁବିଧା",
    modernAmenitiesDesc: "ପ୍ରିମିୟମ୍ ଯାତ୍ରା ଅଭିଜ୍ଞତା ପାଇଁ ମାଗଣା ୱାଇଫାଇ, ଚାର୍ଜିଂ ପୋର୍ଟ, ମନୋରଞ୍ଜନ ସିଷ୍ଟମ୍ ଏବଂ ସତେଜ",
    additionalAmenities: "ଅତିରିକ୍ତ ସୁବିଧା ଏବଂ ବିଶେଷତା",
  }
}

const features = [
  {
    icon: <Bus className="w-8 h-8 text-orange-600" />,
    titleKey: "acSleeperCoaches",
    descriptionKey: "acSleeperDesc",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: <Clock className="w-8 h-8 text-orange-600" />,
    titleKey: "timelyDeparture",
    descriptionKey: "timelyDepartureDesc",
    color: "from-green-400 to-green-600",
  },
  {
    icon: <Shield className="w-8 h-8 text-orange-600" />,
    titleKey: "safeSecure",
    descriptionKey: "safeSecureDesc",
    color: "from-red-400 to-red-600",
  },
  {
    icon: <Wifi className="w-8 h-8 text-orange-600" />,
    titleKey: "modernAmenities",
    descriptionKey: "modernAmenitiesDesc",
    color: "from-purple-400 to-purple-600",
  },
]

interface FeaturesPageProps {
  currentLanguage: string
}

export default function FeaturesPage({ currentLanguage }: FeaturesPageProps) {
  const currentLang = languages[currentLanguage as keyof typeof languages]

  return (
    <div className="pt-24 py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {currentLang.whyChooseUs}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-orange-600">{currentLang.premiumExperience}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{currentLang.featuresDescription}</p>
        </div>

        <Card className="border-0 p-8 mb-16 shadow-lg">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {currentLang[feature.titleKey as keyof typeof currentLang]}
                </h3>
                <p className="text-gray-600 leading-relaxed">{currentLang[feature.descriptionKey as keyof typeof currentLang]}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Bus Fleet Showcase */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Premium Fleet</h3>
          
          <div className="relative">
            {/* Fleet Cards Container */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AC Sleeper Bus */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src="/images/bus-fleet.jpg"
                    alt="AC Sleeper Bus"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white rounded-full p-2">
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">AC Sleeper</h4>
                  <p className="text-gray-600 text-sm">Premium overnight comfort</p>
                </div>
              </div>

              {/* Premium Bus */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src="/images/premium-bus.jpg"
                    alt="Premium Bus"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-2">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">Premium Express</h4>
                  <p className="text-gray-600 text-sm">Luxury travel experience</p>
                </div>
              </div>

              {/* Express Bus */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src="/images/buses2.jpeg"
                    alt="Express Bus"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">Express Service</h4>
                  <p className="text-gray-600 text-sm">Fast and efficient</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16 bg-gradient-to-br from-orange-900 to-red-900 rounded-3xl p-12 shadow-lg relative overflow-hidden">
          <h3 className="text-3xl font-bold text-center text-white mb-8">{currentLang.additionalAmenities}</h3>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Interior Image */}
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/interior.jpeg"
                  alt="Luxury Bus Interior"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-bold mb-1">Luxury Interior</h4>
                  <p className="text-sm opacity-90">Premium comfort & style</p>
                </div>
              </div>
            </div>

            {/* Right side - Amenities Grid */}
            <div>
              <p className="text-orange-200 mb-8 text-lg text-center lg:text-left">Experience luxury and comfort in our premium bus interiors</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: <Coffee className="w-5 h-5 text-orange-400" />, text: "Refreshments" },
                  { icon: <Wifi className="w-5 h-5 text-orange-400" />, text: "Free WiFi" },
                  { icon: <CheckCircle className="w-5 h-5 text-orange-400" />, text: "Clean Toilets" },
                  { icon: <Shield className="w-5 h-5 text-orange-400" />, text: "GPS Tracking" },
                  { icon: <Bus className="w-5 h-5 text-orange-400" />, text: "Comfortable Seats" },
                  { icon: <Clock className="w-5 h-5 text-orange-400" />, text: "On-Time Service" },
                  { icon: <Phone className="w-5 h-5 text-orange-400" />, text: "24/7 Support" },
                  { icon: <Star className="w-5 h-5 text-orange-400" />, text: "Premium Service" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30 border border-white/20"
                  >
                    <div className="mb-2 flex justify-center">{item.icon}</div>
                    <div className="font-semibold text-white text-sm">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
