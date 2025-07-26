"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react"

const languages = {
  en: {
    getInTouch: "Get In Touch",
    beginJourney: "Let's Begin Your Journey Together",
    contactDescription: "Have questions or need assistance? We're here to help you plan the perfect journey with Nandighosh.",
    sendMessage: "Send us a Message",
    formDescription: "Fill out the form below and we'll get back to you as soon as possible",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    route: "Preferred Route",
    message: "Message",
    travelRequirements: "Tell us about your travel requirements...",
    sendMessageBtn: "Send Message",
    contactInfo: "Contact Information",
    helpline: "24/7 Helpline",
    support24x7: "Available 24/7",
    whatsappService: "WhatsApp Service",
    instantResponse: "Instant Response",
    emailService: "Email Service",
    correspondence: "For general correspondence",
    mobileApp: "Download Our Mobile App",
    appDescription: "Get easy access to booking, tracking, and customer support on your mobile device",
    appStore: "App Store",
  },
  hi: {
    getInTouch: "संपर्क में रहें",
    beginJourney: "आइए साथ मिलकर अपनी यात्रा शुरू करें",
    contactDescription: "कोई प्रश्न है या सहायता चाहिए? हम नंदीघोष के साथ आपकी परफेक्ट यात्रा की योजना बनाने में मदद करने के लिए यहां हैं।",
    sendMessage: "हमें संदेश भेजें",
    formDescription: "नीचे दिया गया फॉर्म भरें और हम जल्द से जल्द आपसे संपर्क करेंगे",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    email: "ईमेल पता",
    phone: "फोन नंबर",
    route: "पसंदीदा मार्ग",
    message: "संदेश",
    travelRequirements: "हमें अपनी यात्रा की आवश्यकताओं के बारे में बताएं...",
    sendMessageBtn: "संदेश भेजें",
    contactInfo: "संपर्क जानकारी",
    helpline: "24/7 हेल्पलाइन",
    support24x7: "24/7 उपलब्ध",
    whatsappService: "व्हाट्सऐप सेवा",
    instantResponse: "तत्काल प्रतिक्रिया",
    emailService: "ईमेल सेवा",
    correspondence: "सामान्य पत्राचार के लिए",
    mobileApp: "हमारा मोबाइल ऐप डाउनलोड करें",
    appDescription: "अपने मोबाइल डिवाइस पर बुकिंग, ट्रैकिंग और कस्टमर सपोर्ट तक आसान पहुंच प्राप्त करें",
    appStore: "ऐप स्टोर",
  },
  or: {
    getInTouch: "ସମ୍ପର୍କରେ ରୁହନ୍ତୁ",
    beginJourney: "ଆସନ୍ତୁ ମିଳିତ ଭାବରେ ଆପଣଙ୍କ ଯାତ୍ରା ଆରମ୍ଭ କରିବା",
    contactDescription: "କୌଣସି ପ୍ରଶ୍ନ ଅଛି କି ସହାୟତା ଦରକାର? ନନ୍ଦିଘୋଷ ସହିତ ଆପଣଙ୍କର ସମ୍ପୂର୍ଣ୍ଣ ଯାତ୍ରା ଯୋଜନା କରିବାରେ ସାହାଯ୍ୟ କରିବାକୁ ଆମେ ଏଠାରେ ଅଛୁ।",
    sendMessage: "ଆମକୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    formDescription: "ନିମ୍ନରେ ଥିବା ଫର୍ମ ପୂରଣ କରନ୍ତୁ ଏବଂ ଆମେ ଯଥାଶୀଘ୍ର ଆପଣଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରିବୁ",
    firstName: "ପ୍ରଥମ ନାମ",
    lastName: "ଶେଷ ନାମ",
    email: "ଇମେଲ ଠିକଣା",
    phone: "ଫୋନ ନମ୍ବର",
    route: "ପସନ୍ଦର ମାର୍ଗ",
    message: "ବାର୍ତ୍ତା",
    travelRequirements: "ଆପଣଙ୍କର ଯାତ୍ରା ଆବଶ୍ୟକତା ବିଷୟରେ ଆମକୁ କୁହନ୍ତୁ...",
    sendMessageBtn: "ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    contactInfo: "ଯୋଗାଯୋଗ ସୂଚନା",
    helpline: "24/7 ହେଲ୍ପଲାଇନ",
    support24x7: "24/7 ଉପଲବ୍ଧ",
    whatsappService: "ହ୍ୱାଟସଆପ ସେବା",
    instantResponse: "ତତକ୍ଷଣାତ ପ୍ରତିକ୍ରିୟା",
    emailService: "ଇମେଲ ସେବା",
    correspondence: "ସାଧାରଣ ଚିଠିପତ୍ର ପାଇଁ",
    mobileApp: "ଆମର ମୋବାଇଲ ଆପ ଡାଉନଲୋଡ କରନ୍ତୁ",
    appDescription: "ଆପଣଙ୍କ ମୋବାଇଲ ଡିଭାଇସରେ ବୁକିଂ, ଟ୍ରାକିଂ ଏବଂ ଗ୍ରାହକ ସହାୟତାର ସହଜ ଅଭିଗମ ପାଆନ୍ତୁ",
    appStore: "ଆପ ଷ୍ଟୋର",
  }
}

interface ContactPageProps {
  currentLanguage: string
}

export default function ContactPage({ currentLanguage }: ContactPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    route: '',
    message: ''
  })

  const currentLang = languages[currentLanguage as keyof typeof languages]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // You can add actual form submission logic here
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="pt-24 py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            {currentLang.getInTouch}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{currentLang.beginJourney}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{currentLang.contactDescription}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Mail className="mr-2 w-5 h-5 text-orange-600" />
                {currentLang.sendMessage}
              </CardTitle>
              <CardDescription className="text-gray-600">{currentLang.formDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.firstName}</label>
                    <Input 
                      name="firstName"
                      placeholder="John" 
                      className="border-gray-300 focus:border-orange-500"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.lastName}</label>
                    <Input 
                      name="lastName"
                      placeholder="Doe" 
                      className="border-gray-300 focus:border-orange-500"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.email}</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="border-gray-300 focus:border-orange-500"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.phone}</label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="border-gray-300 focus:border-orange-500"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.route}</label>
                  <select 
                    name="route"
                    aria-label="Select route"
                    title="Select your travel route"
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-orange-500"
                    value={formData.route}
                    onChange={handleInputChange}
                  >
                    <option value="">Select your destination</option>
                    <option value="balasore-puri">Balasore to Puri</option>
                    <option value="balasore-sambalpur">Balasore to Sambalpur</option>
                    <option value="balasore-jamshedpur">Balasore to Jamshedpur</option>
                    <option value="balasore-berhampur">Balasore to Berhampur</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.message}</label>
                  <Textarea
                    name="message"
                    placeholder={currentLang.travelRequirements}
                    className="border-gray-300 focus:border-orange-500 min-h-[100px]"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 py-2 text-base font-medium transition-all duration-200 ease-in-out"
                  style={{
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Mail className="mr-2 w-4 h-4" />
                  {currentLang.sendMessageBtn}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">{currentLang.contactInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentLang.helpline}</div>
                  <div className="text-gray-600">+91 98765 43210</div>
                  <div className="text-sm text-green-600">{currentLang.support24x7}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentLang.whatsappService}</div>
                  <div className="text-gray-600">+91 98765 43210</div>
                  <div className="text-sm text-green-600">{currentLang.instantResponse}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentLang.emailService}</div>
                  <div className="text-gray-600">info@nandighoshbus.com</div>
                  <div className="text-sm text-orange-600">{currentLang.correspondence}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Download */}
          <Card className="shadow-sm border">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">{currentLang.mobileApp}</h3>
              <p className="mb-4 text-gray-600 text-sm">{currentLang.appDescription}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 ease-in-out">
                  <div className="text-lg">🍎</div>
                  <div className="text-white text-sm">
                    <div className="text-xs opacity-75">Download on the</div>
                    <div className="font-medium">{currentLang.appStore}</div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 ease-in-out">
                  <div className="text-lg">🤖</div>
                  <div className="text-white text-sm">
                    <div className="text-xs opacity-75">Get it on</div>
                    <div className="font-medium">Google Play</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card className="shadow-sm border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">
                Service Status
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All routes operating normally</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Weather: Sunny, 28°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Next departure in 15 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
