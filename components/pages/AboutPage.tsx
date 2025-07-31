"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Shield, Clock, Heart, Target, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const languages = {
  en: {
    pageTitle: "About Nandighosh Travels",
    subtitle: "Your Trusted Travel Partner Since 1998",
    ourStory: "Our Story",
    storyContent: "Nandighosh Travels began its journey in 1998 with a simple yet profound vision: to connect the beautiful state of Odisha through safe, comfortable, and reliable transportation. What started as a small family business has now grown into one of Odisha's most trusted and respected bus service providers.",
    storyContent2: "Named after the sacred chariot of Lord Jagannath, Nandighosh represents our deep connection to Odisha's rich cultural heritage. Just as the divine chariot carries devotees on their spiritual journey, we carry our passengers safely to their destinations.",
    ourMission: "Our Mission",
    missionContent: "To provide world-class transportation services that connect every corner of Odisha while preserving our cultural values and ensuring the highest standards of safety, comfort, and reliability.",
    ourVision: "Our Vision",
    visionContent: "To be the leading bus service provider in Eastern India, known for exceptional service quality, innovation, and our contribution to sustainable transportation.",
    ourValues: "Our Values",
    safetyFirst: "Safety First",
    safetyDesc: "Every journey begins with safety. We maintain the highest safety standards in our fleet and operations.",
    customerCentric: "Customer Centric",
    customerDesc: "Our passengers are at the heart of everything we do. Their comfort and satisfaction drive our service excellence.",
    culturalPride: "Cultural Pride",
    culturalDesc: "We celebrate and preserve Odisha's rich heritage through our services and community engagement.",
    innovation: "Innovation",
    innovationDesc: "We continuously adopt new technologies and practices to enhance our service quality.",
    achievements: "Our Achievements",
    achievement1: "Over 25 years of trusted service",
    achievement2: "Served more than 10 million passengers",
    achievement3: "99.8% on-time performance record",
    achievement4: "50+ daily routes across Odisha",
    achievement5: "Award-winning customer service",
    achievement6: "Zero major accident record",
    leadership: "Our Leadership",
    leadershipDesc: "Led by experienced professionals who are passionate about transportation excellence and customer service.",
    bookJourney: "Book Your Journey",
    bookJourneyDesc: "Experience the Nandighosh difference. Book your next journey with us and discover why thousands of passengers choose us every day.",
  },
  hi: {
    pageTitle: "नंदीघोष ट्रैवल्स के बारे में",
    subtitle: "1998 से आपका विश्वसनीय यात्रा साथी",
    ourStory: "हमारी कहानी",
    storyContent: "नंदीघोष ट्रैवल्स ने 1998 में एक सरल लेकिन गहरे दृष्टिकोण के साथ अपनी यात्रा शुरू की: सुरक्षित, आरामदायक और विश्वसनीय परिवहन के माध्यम से ओडिशा राज्य को जोड़ना।",
    storyContent2: "भगवान जगन्नाथ के पवित्र रथ के नाम पर, नंदीघोष ओडिशा की समृद्ध सांस्कृतिक विरासत के साथ हमारे गहरे संबंध का प्रतिनिधित्व करता है।",
    ourMission: "हमारा मिशन",
    missionContent: "विश्वस्तरीय परिवहन सेवाएं प्रदान करना जो ओडिशा के हर कोने को जोड़ती हैं।",
    ourVision: "हमारा दृष्टिकोण",
    visionContent: "पूर्वी भारत में अग्रणी बस सेवा प्रदाता बनना।",
    ourValues: "हमारे मूल्य",
    safetyFirst: "सुरक्षा पहले",
    safetyDesc: "हर यात्रा सुरक्षा के साथ शुरू होती है।",
    customerCentric: "ग्राहक केंद्रित",
    customerDesc: "हमारे यात्री हमारे काम के केंद्र में हैं।",
    culturalPride: "सांस्कृतिक गर्व",
    culturalDesc: "हम ओडिशा की समृद्ध विरासत का जश्न मनाते हैं।",
    innovation: "नवाचार",
    innovationDesc: "हम अपनी सेवा की गुणवत्ता बढ़ाने के लिए नई तकनीकों को अपनाते हैं।",
    achievements: "हमारी उपलब्धियां",
    achievement1: "25 से अधिक वर्षों की विश्वसनीय सेवा",
    achievement2: "10 मिलियन से अधिक यात्रियों की सेवा",
    achievement3: "99.8% समय पर प्रदर्शन रिकॉर्ड",
    achievement4: "ओडिशा भर में 50+ दैनिक मार्ग",
    achievement5: "पुरस्कार विजेता ग्राहक सेवा",
    achievement6: "शून्य बड़ी दुर्घटना रिकॉर्ड",
    leadership: "हमारा नेतृत्व",
    leadershipDesc: "अनुभवी पेशेवरों के नेतृत्व में जो परिवहन उत्कृष्टता के लिए जुनूनी हैं।",
    bookJourney: "अपनी यात्रा बुक करें",
    bookJourneyDesc: "नंदीघोष का अंतर अनुभव करें।",
  },
  or: {
    pageTitle: "ନନ୍ଦିଘୋଷ ଟ୍ରାଭେଲ୍ସ ବିଷୟରେ",
    subtitle: "1998 ଠାରୁ ଆପଣଙ୍କର ବିଶ୍ୱସ୍ତ ଯାତ୍ରା ସାଥୀ",
    ourStory: "ଆମର କାହାଣୀ",
    storyContent: "ନନ୍ଦିଘୋଷ ଟ୍ରାଭେଲ୍ସ 1998 ରେ ଏକ ସରଳ କିନ୍ତୁ ଗଭୀର ଦୃଷ୍ଟିଭଙ୍ଗୀ ସହିତ ଯାତ୍ରା ଆରମ୍ଭ କରିଥିଲା: ନିରାପଦ, ଆରାମଦାୟକ ଏବଂ ବିଶ୍ୱସନୀୟ ପରିବହନ ମାଧ୍ୟମରେ ଓଡ଼ିଶାକୁ ସଂଯୋଗ କରିବା।",
    storyContent2: "ଭଗବାନ ଜଗନ୍ନାଥଙ୍କ ପବିତ୍ର ରଥର ନାମରେ, ନନ୍ଦିଘୋଷ ଓଡ଼ିଶାର ସମୃଦ୍ଧ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ ସହିତ ଆମର ଗଭୀର ସଂଯୋଗର ପ୍ରତିନିଧିତ୍ୱ କରେ।",
    ourMission: "ଆମର ମିଶନ",
    missionContent: "ବିଶ୍ୱମାନର ପରିବହନ ସେବା ପ୍ରଦାନ କରିବା ଯାହା ଓଡ଼ିଶାର ପ୍ରତ୍ୟେକ କୋଣକୁ ସଂଯୋଗ କରେ।",
    ourVision: "ଆମର ଦୃଷ୍ଟିଭଙ୍ଗୀ",
    visionContent: "ପୂର୍ବ ଭାରତରେ ଅଗ୍ରଣୀ ବସ୍ ସେବା ପ୍ରଦାନକାରୀ ହେବା।",
    ourValues: "ଆମର ମୂଲ୍ୟବୋଧ",
    safetyFirst: "ନିରାପତ୍ତା ପ୍ରଥମ",
    safetyDesc: "ପ୍ରତ୍ୟେକ ଯାତ୍ରା ନିରାପତ୍ତା ସହିତ ଆରମ୍ଭ ହୁଏ।",
    customerCentric: "ଗ୍ରାହକ କେନ୍ଦ୍ରିତ",
    customerDesc: "ଆମର ଯାତ୍ରୀମାନେ ଆମର ସବୁ କାର୍ଯ୍ୟର କେନ୍ଦ୍ରରେ ଅଛନ୍ତି।",
    culturalPride: "ସାଂସ୍କୃତିକ ଗର୍ବ",
    culturalDesc: "ଆମେ ଓଡ଼ିଶାର ସମୃଦ୍ଧ ଐତିହ୍ୟକୁ ଉତ୍ସବ କରୁ।",
    innovation: "ନବାଚାର",
    innovationDesc: "ଆମେ ଆମର ସେବା ଗୁଣବତ୍ତା ବୃଦ୍ଧି ପାଇଁ ନୂତନ ପ୍ରଯୁକ୍ତି ଅପନାଉ।",
    achievements: "ଆମର ସଫଳତା",
    achievement1: "25 ବର୍ଷରୁ ଅଧିକ ବିଶ୍ୱସ୍ତ ସେବା",
    achievement2: "10 ମିଲିୟନରୁ ଅଧିକ ଯାତ୍ରୀଙ୍କ ସେବା",
    achievement3: "99.8% ସମୟ ଅନୁଯାୟୀ ପ୍ରଦର୍ଶନ ରେକର୍ଡ",
    achievement4: "ଓଡ଼ିଶା ଭରିରେ 50+ ଦୈନିକ ମାର୍ଗ",
    achievement5: "ପୁରସ୍କାର ବିଜେତା ଗ୍ରାହକ ସେବା",
    achievement6: "ଶୂନ୍ୟ ବଡ଼ ଦୁର୍ଘଟଣା ରେକର୍ଡ",
    leadership: "ଆମର ନେତୃତ୍ୱ",
    leadershipDesc: "ଅଭିଜ୍ଞ ପେଶାଦାରଙ୍କ ନେତୃତ୍ୱରେ ଯେଉଁମାନେ ପରିବହନ ଉତ୍କର୍ଷତା ପାଇଁ ଉତ୍ସାହୀ।",
    bookJourney: "ଆପଣଙ୍କ ଯାତ୍ରା ବୁକ୍ କରନ୍ତୁ",
    bookJourneyDesc: "ନନ୍ଦିଘୋଷ ପାର୍ଥକ୍ୟ ଅନୁଭବ କରନ୍ତୁ।",
  }
}

interface AboutPageProps {
  currentLanguage: string
}

export default function AboutPage({ currentLanguage }: AboutPageProps) {
  const currentLang = languages[currentLanguage as keyof typeof languages]

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 min-h-[60vh] flex items-center section-glass">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white text-lg px-6 py-2 hover:bg-white/20">
              About Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {currentLang.pageTitle}
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 font-light">
              {currentLang.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{currentLang.ourStory}</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {currentLang.storyContent}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentLang.storyContent2}
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-xl"></div>
                <Image
                  src="/images/bus-fleet.jpg"
                  alt="Nandighosh Fleet"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover rounded-xl shadow-2xl relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentLang.ourMission}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {currentLang.missionContent}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentLang.ourVision}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {currentLang.visionContent}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentLang.ourValues}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLang.safetyFirst}</h3>
                <p className="text-gray-600">{currentLang.safetyDesc}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLang.customerCentric}</h3>
                <p className="text-gray-600">{currentLang.customerDesc}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLang.culturalPride}</h3>
                <p className="text-gray-600">{currentLang.culturalDesc}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLang.innovation}</h3>
                <p className="text-gray-600">{currentLang.innovationDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 section-glass">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">{currentLang.achievements}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">25+</div>
                <p className="text-white/90">{currentLang.achievement1}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">10M+</div>
                <p className="text-white/90">{currentLang.achievement2}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">99.8%</div>
                <p className="text-white/90">{currentLang.achievement3}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <p className="text-white/90">{currentLang.achievement4}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">★★★★★</div>
                <p className="text-white/90">{currentLang.achievement5}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <p className="text-white/90">{currentLang.achievement6}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{currentLang.leadership}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {currentLang.leadershipDesc}
            </p>
            <div className="flex items-center justify-center">
              <Users className="w-16 h-16 text-orange-600" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{currentLang.bookJourney}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {currentLang.bookJourneyDesc}
            </p>
            <Link href="/booking">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Book Your Journey Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
