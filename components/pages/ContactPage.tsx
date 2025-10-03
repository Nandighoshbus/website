"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageCircle, ArrowRight, Shield, Clock } from "lucide-react"
import { sendContactEmail, sendEmailFallback } from "@/lib/emailService"

const languages = {
  en: {
    getInTouch: "Get In Touch",
    beginJourney: "Let's Begin Your Journey Together",
    contactDescription: "Have questions or need assistance? We're here to help you plan the perfect journey with Nandighosh.",
    sendMessage: "Send us a Message",
    formDescription: "Fill out the form below and we'll get back to you as soon as possible. Fields marked with * are required.",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
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
    refundPolicy: "Refund & Cancellation Policy",
    refundPolicyDescription: "Our commitment to transparent and fair refund practices",
    refundRules: [
      "Full refund for cancellations made 24 hours before departure",
      "75% refund for cancellations made 12-24 hours before departure",
      "50% refund for cancellations made 6-12 hours before departure",
      "25% refund for cancellations made 2-6 hours before departure",
      "No refund for cancellations made within 2 hours of departure",
      "Refunds will be processed within 5-7 business days",
      "Service charges and convenience fees are non-refundable",
      "In case of bus breakdown or service cancellation by us, full refund will be provided"
    ],
  },
  hi: {
    getInTouch: "संपर्क में रहें",
    beginJourney: "आइए साथ मिलकर अपनी यात्रा शुरू करें",
    contactDescription: "कोई प्रश्न है या सहायता चाहिए? हम नंदीघोष के साथ आपकी परफेक्ट यात्रा की योजना बनाने में मदद करने के लिए यहां हैं।",
    sendMessage: "हमें संदेश भेजें",
    formDescription: "नीचे दिया गया फॉर्म भरें और हम जल्द से जल्द आपसे संपर्क करेंगे। * से चिह्नित फील्ड आवश्यक हैं।",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    email: "ईमेल पता",
    phone: "फोन नंबर",
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
    refundPolicy: "रिफंड और रद्दीकरण नीति",
    refundPolicyDescription: "पारदर्शी और निष्पक्ष रिफंड प्रथाओं के लिए हमारी प्रतिबद्धता",
    refundRules: [
      "प्रस्थान से 24 घंटे पहले रद्दीकरण के लिए पूर्ण रिफंड",
      "प्रस्थान से 12-24 घंटे पहले रद्दीकरण के लिए 75% रिफंड",
      "प्रस्थान से 6-12 घंटे पहले रद्दीकरण के लिए 50% रिफंड",
      "प्रस्थान से 2-6 घंटे पहले रद्दीकरण के लिए 25% रिफंड",
      "प्रस्थान से 2 घंटे के भीतर रद्दीकरण के लिए कोई रिफंड नहीं",
      "रिफंड 5-7 कार्य दिवसों में प्रोसेस किया जाएगा",
      "सेवा शुल्क और सुविधा शुल्क गैर-वापसी योग्य हैं",
      "हमारी तरफ से बस खराबी या सेवा रद्दीकरण के मामले में पूर्ण रिफंड प्रदान किया जाएगा"
    ],
  },
  or: {
    getInTouch: "ସମ୍ପର୍କରେ ରୁହନ୍ତୁ",
    beginJourney: "ଆସନ୍ତୁ ମିଳିତ ଭାବରେ ଆପଣଙ୍କ ଯାତ୍ରା ଆରମ୍ଭ କରିବା",
    contactDescription: "କୌଣସି ପ୍ରଶ୍ନ ଅଛି କି ସହାୟତା ଦରକାର? ନନ୍ଦିଘୋଷ ସହିତ ଆପଣଙ୍କର ସମ୍ପୂର୍ଣ୍ଣ ଯାତ୍ରା ଯୋଜନା କରିବାରେ ସାହାଯ୍ୟ କରିବାକୁ ଆମେ ଏଠାରେ ଅଛୁ।",
    sendMessage: "ଆମକୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    formDescription: "ନିମ୍ନରେ ଥିବା ଫର୍ମ ପୂରଣ କରନ୍ତୁ ଏବଂ ଆମେ ଯଥାଶୀଘ୍ର ଆପଣଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରିବୁ। * ଚିହ୍ନିତ ଫିଲ୍ଡଗୁଡ଼ିକ ଆବଶ୍ୟକ।",
    firstName: "ପ୍ରଥମ ନାମ",
    lastName: "ଶେଷ ନାମ",
    email: "ଇମେଲ ଠିକଣା",
    phone: "ଫୋନ ନମ୍ବର",
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
    refundPolicy: "ରିଫଣ୍ଡ ଏବଂ ବାତିଲ ନୀତି",
    refundPolicyDescription: "ସ୍ୱଚ୍ଛ ଏବଂ ନ୍ୟାୟସଙ୍ଗତ ରିଫଣ୍ଡ ପ୍ରଥା ପାଇଁ ଆମର ପ୍ରତିବଦ୍ଧତା",
    refundRules: [
      "ଯାତ୍ରା ଆରମ୍ଭର 24 ଘଣ୍ଟା ପୂର୍ବରୁ ବାତିଲ କଲେ ସମ୍ପୂର୍ଣ୍ଣ ରିଫଣ୍ଡ",
      "ଯାତ୍ରା ଆରମ୍ଭର 12-24 ଘଣ୍ଟା ପୂର୍ବରୁ ବାତିଲ କଲେ 75% ରିଫଣ୍ଡ",
      "ଯାତ୍ରା ଆରମ୍ଭର 6-12 ଘଣ୍ଟା ପୂର୍ବରୁ ବାତିଲ କଲେ 50% ରିଫଣ୍ଡ",
      "ଯାତ୍ରା ଆରମ୍ଭର 2-6 ଘଣ୍ଟା ପୂର୍ବରୁ ବାତିଲ କଲେ 25% ରିଫଣ୍ଡ",
      "ଯାତ୍ରା ଆରମ୍ଭର 2 ଘଣ୍ଟା ମଧ୍ୟରେ ବାତିଲ କଲେ କୌଣସି ରିଫଣ୍ଡ ନାହିଁ",
      "ରିଫଣ୍ଡ 5-7 କାର୍ଯ୍ୟ ଦିନ ମଧ୍ୟରେ ପ୍ରକ୍ରିୟା ହେବ",
      "ସେବା ଶୁଳ୍କ ଏବଂ ସୁବିଧା ଶୁଳ୍କ ଫେରସ୍ତ ଯୋଗ୍ୟ ନୁହେଁ",
      "ଆମ ପକ୍ଷରୁ ବସ ଖରାପ କିମ୍ବା ସେବା ବାତିଲ ହେଲେ ସମ୍ପୂର୍ଣ୍ଣ ରିଫଣ୍ଡ ପ୍ରଦାନ କରାଯିବ"
    ],
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
    message: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    message: ''
  })

  const currentLang = languages[currentLanguage as keyof typeof languages]

  const validateForm = () => {
    const newErrors = {
      email: '',
      phone: '',
      message: ''
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.phone && !newErrors.message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        // Use EmailJS to send email
        const result = await sendContactEmail(formData)

        if (result.success) {
          alert(result.message)
          // Reset form after successful submission
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: ''
          })
          setErrors({
            email: '',
            phone: '',
            message: ''
          })
        } else {
          // Show error and offer fallback option
          const useEmailClient = confirm(
            `${result.message}\n\nWould you like to open your email client instead?`
          )
          
          if (useEmailClient) {
            sendEmailFallback(formData)
          }
        }
      } catch (error) {
        console.error('Error submitting contact form:', error)
        
        // Offer email client fallback
        const useEmailClient = confirm(
          'Failed to send message through our contact form.\n\nWould you like to open your email client instead?'
        )
        
        if (useEmailClient) {
          sendEmailFallback(formData)
        }
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  return (
    <div className="pt-24 py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 mt-8">
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
                      className="border border-gray-300 focus:border-orange-500 bg-white focus:bg-white"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang.lastName}</label>
                    <Input 
                      name="lastName"
                      placeholder="Doe" 
                      className="border border-gray-300 focus:border-orange-500 bg-white focus:bg-white"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLang.email} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className={`border border-gray-300 focus:border-orange-500 bg-white focus:bg-white ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLang.phone} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+91 12345 67890"
                    className={`border border-gray-300 focus:border-orange-500 bg-white focus:bg-white ${errors.phone ? 'border-red-500' : ''}`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLang.message} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    name="message"
                    placeholder={currentLang.travelRequirements}
                    className={`border border-gray-300 focus:border-orange-500 bg-white focus:bg-white min-h-[100px] ${errors.message ? 'border-red-500' : ''}`}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed py-2 text-base font-medium transition-all duration-200 ease-in-out text-white"
                  disabled={!formData.email.trim() || !formData.phone.trim() || !formData.message.trim()}
                  style={{
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
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
              <CardDescription className="text-sm text-gray-600">
                This website is operated by <span className="font-semibold">Saurav Nanda</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentLang.helpline}</div>
                  <div className="text-gray-600">+91 9778835361</div>
                  <div className="text-sm text-green-600">{currentLang.support24x7}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentLang.whatsappService}</div>
                  <div className="text-gray-600">+91 9778835361</div>
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
              
              {/* Registered Address Section */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Registered Address</h4>
                <p className="text-sm text-gray-700">
                  As per Aadhar: 938449720041<br />
                  Balasore, Odisha, India
                </p>
              </div>
              
              {/* Business Information */}
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Business Contact</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Mobile:</span> +91 9778835361</p>
                  <p><span className="font-medium">Email:</span> info@nandighoshbus.com</p>
                  <p><span className="font-medium">Proprietor:</span> Saurav Nanda</p>
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
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-md">
                  Coming Soon!
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
                  <span>Have any query, reach out to us</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
