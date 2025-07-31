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
    aboutUsTitle: "About Nandighosh Travels",
    aboutUsShort: "Your trusted travel partner since 1998, connecting hearts across Odisha",
    aboutUsDescription: "Nandighosh Travels has been proudly serving the people of Odisha for over 25 years. We started with a vision to provide safe, comfortable, and reliable transportation services that connect every corner of our beautiful state. Today, we stand as one of Odisha's most trusted bus service providers.",
    readMore: "Read More About Us",
    testimonialsTitle: "What Our Passengers Say",
    testimonialsSubtitle: "Real experiences from thousands of satisfied travelers",
    testimonial1: "Nandighosh has been my go-to choice for business travels. Their punctuality and comfort are unmatched. The staff is courteous and the buses are well-maintained.",
    testimonial2: "I've been traveling with Nandighosh for my family trips for years. The safety measures and cleanliness give me peace of mind, especially when traveling with children.",
    testimonial3: "As a frequent traveler, I appreciate the modern amenities and reliable service. The online booking system is user-friendly and the customer support is excellent.",
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
    aboutUsTitle: "नंदीघोष ट्रैवल्स के बारे में",
    aboutUsShort: "1998 से आपका विश्वसनीय यात्रा साथी, ओडिशा भर में दिलों को जोड़ता है",
    aboutUsDescription: "नंदीघोष ट्रैवल्स 25 से अधिक वर्षों से ओडिशा के लोगों की गर्व से सेवा कर रहा है। हमने सुरक्षित, आरामदायक और विश्वसनीय परिवहन सेवाएं प्रदान करने के दृष्टिकोण के साथ शुरुआत की थी।",
    readMore: "हमारे बारे में और पढ़ें",
    testimonialsTitle: "हमारे यात्री क्या कहते हैं",
    testimonialsSubtitle: "हजारों संतुष्ट यात्रियों के वास्तविक अनुभव",
    testimonial1: "नंदीघोष मेरी व्यावसायिक यात्राओं के लिए मेरी पहली पसंद रहा है। उनकी समय की पाबंदी और आराम बेजोड़ है।",
    testimonial2: "मैं वर्षों से अपनी पारिवारिक यात्राओं के लिए नंदीघोष के साथ यात्रा कर रहा हूं। सुरक्षा उपाय और स्वच्छता मुझे मानसिक शांति देती है।",
    testimonial3: "एक नियमित यात्री के रूप में, मैं आधुनिक सुविधाओं और विश्वसनीय सेवा की सराहना करता हूं।",
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
    aboutUsTitle: "ନନ୍ଦିଘୋଷ ଟ୍ରାଭେଲ୍ସ ବିଷୟରେ",
    aboutUsShort: "1998 ଠାରୁ ଆପଣଙ୍କର ବିଶ୍ୱସ୍ତ ଯାତ୍ରା ସାଥୀ, ଓଡ଼ିଶା ଭରିରେ ହୃଦୟ ସଂଯୋଗ କରୁଛି",
    aboutUsDescription: "ନନ୍ଦିଘୋଷ ଟ୍ରାଭେଲ୍ସ 25 ବର୍ଷରୁ ଅଧିକ ସମୟ ଧରି ଓଡ଼ିଶାର ଲୋକମାନଙ୍କର ଗର୍ବର ସହିତ ସେବା କରିଆସୁଛି। ଆମେ ନିରାପଦ, ଆରାମଦାୟକ ଏବଂ ବିଶ୍ୱସନୀୟ ପରିବହନ ସେବା ପ୍ରଦାନ କରିବାର ଦୃଷ୍ଟିଭଙ୍ଗୀ ସହିତ ଆରମ୍ଭ କରିଥିଲୁ।",
    readMore: "ଆମ ବିଷୟରେ ଅଧିକ ପଢ଼ନ୍ତୁ",
    testimonialsTitle: "ଆମର ଯାତ୍ରୀମାନେ କ'ଣ କୁହନ୍ତି",
    testimonialsSubtitle: "ହଜାରେ ସନ୍ତୁଷ୍ଟ ଯାତ୍ରୀଙ୍କ ପ୍ରକୃତ ଅଭିଜ୍ଞତା",
    testimonial1: "ନନ୍ଦିଘୋଷ ମୋର ବ୍ୟବସାୟିକ ଯାତ୍ରା ପାଇଁ ମୋର ପ୍ରଥମ ପସନ୍ଦ। ସେମାନଙ୍କର ସମୟନିଷ୍ଠତା ଏବଂ ଆରାମ ଅତୁଳନୀୟ।",
    testimonial2: "ମୁଁ ବର୍ଷ ବର୍ଷ ଧରି ମୋର ପାରିବାରିକ ଯାତ୍ରା ପାଇଁ ନନ୍ଦିଘୋଷ ସହିତ ଯାତ୍ରା କରୁଛି। ନିରାପତ୍ତା ବ୍ୟବସ୍ଥା ଏବଂ ପରିଷ୍କାରତା ମୋତେ ମାନସିକ ଶାନ୍ତି ଦିଏ।",
    testimonial3: "ଜଣେ ନିୟମିତ ଯାତ୍ରୀ ଭାବରେ, ମୁଁ ଆଧୁନିକ ସୁବିଧା ଏବଂ ବିଶ୍ୱସନୀୟ ସେବାକୁ ପ୍ରଶଂସା କରେ।",
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
        
        <div className="container mx-auto px-4 relative z-30">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Content */}
            <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
                Welcome to Nandighosh Travels
              </h1>
              
              <div className="space-y-4 mb-8">
                <p className="text-xl lg:text-2xl text-white/95 font-light">
                  {currentLang.tagline}
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
                  <div className="text-2xl font-bold text-white mb-1">25+</div>
                  <div className="text-sm text-white/80">{currentLang.yearsExperience}</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">99.8%</div>
                  <div className="text-sm text-white/80">{currentLang.onTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Search Bar */}
      <section className="relative -mt-12 z-40 mb-12">
        <div className="container mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 border border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              {/* From City */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  From
                </label>
                <Select>
                  <SelectTrigger className="w-full h-10 border-orange-200 focus:border-orange-500 text-sm">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                    <SelectItem value="cuttack">Cuttack</SelectItem>
                    <SelectItem value="puri">Puri</SelectItem>
                    <SelectItem value="berhampur">Berhampur</SelectItem>
                    <SelectItem value="rourkela">Rourkela</SelectItem>
                    <SelectItem value="sambalpur">Sambalpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* To City */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  To
                </label>
                <Select>
                  <SelectTrigger className="w-full h-10 border-orange-200 focus:border-orange-500 text-sm">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                    <SelectItem value="cuttack">Cuttack</SelectItem>
                    <SelectItem value="puri">Puri</SelectItem>
                    <SelectItem value="berhampur">Berhampur</SelectItem>
                    <SelectItem value="rourkela">Rourkela</SelectItem>
                    <SelectItem value="sambalpur">Sambalpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-orange-500" />
                  Departure
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal border-orange-200 focus:border-orange-500 text-sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                      {format(new Date(), "dd MMM")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-orange-500" />
                  Return
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal border-orange-200 focus:border-orange-500 text-sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                      Optional
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <Button 
                  size="sm" 
                  className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                  SEARCH BUSES
                </Button>
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
            <div className="card-glass relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
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

            <div className="card-glass relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
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

            <div className="card-glass relative overflow-hidden rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
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
      <section className="py-20 section-glass relative overflow-hidden">
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

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentLang.aboutUsTitle}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{currentLang.aboutUsShort}</p>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {currentLang.aboutUsDescription}
            </p>
            <Link href="/about">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                {currentLang.readMore}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 section-glass relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">{currentLang.testimonialsTitle}</h2>
            <p className="text-xl text-white/90 drop-shadow-md">{currentLang.testimonialsSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Rajesh Kumar</h4>
                  <p className="text-white/70 text-sm">Business Executive</p>
                </div>
              </div>
              <p className="text-white/90 italic">"{currentLang.testimonial1}"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Priya Sharma</h4>
                  <p className="text-white/70 text-sm">Teacher</p>
                </div>
              </div>
              <p className="text-white/90 italic">"{currentLang.testimonial2}"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Amit Patel</h4>
                  <p className="text-white/70 text-sm">Software Engineer</p>
                </div>
              </div>
              <p className="text-white/90 italic">"{currentLang.testimonial3}"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
