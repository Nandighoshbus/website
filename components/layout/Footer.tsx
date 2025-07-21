"use client"

import { Phone, Mail, MessageCircle, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FooterProps {
  currentLang: any
  currentTime: Date
}

export default function Footer({ currentLang, currentTime }: FooterProps) {
  return (
    <footer className="footer-bg-livery1 text-white py-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-overlay">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-400/20 to-red-500/20 animate-pulse morph-bg"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Company Info */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/nandighosh-logo-updated.png"
              alt="Nandighosh Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain animate-pulse-glow"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Nandighosh</h3>
          <p className="text-orange-200">{currentLang.tagline}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="tilt-card">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/nandighosh-logo-updated.png"
                alt="Nandighosh Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="text-xl font-bold text-white">Nandighosh</span>
              </div>
            </div>
            <p className="text-orange-200 mb-4">{currentLang.footerDescription}</p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors magnetic">
                <span className="text-sm">📘</span>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors magnetic">
                <span className="text-sm">🐦</span>
              </div>
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors magnetic">
                <span className="text-sm">📷</span>
              </div>
            </div>
          </div>

          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Navigation className="mr-2 w-5 h-5 text-orange-600" />
              {currentLang.quickLinks}
            </h4>
            <ul className="space-y-2 text-orange-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors magnetic">
                  🏠 {currentLang.home}
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors magnetic">
                  🛣️ {currentLang.routes}
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors magnetic">
                  ✨ {currentLang.features}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors magnetic">
                  📞 {currentLang.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
              {currentLang.services}
            </h4>
            <ul className="space-y-2 text-orange-200">
              <li className="hover:text-white transition-colors cursor-pointer magnetic">
                🎫 {currentLang.onlineBooking}
              </li>
              <li className="hover:text-white transition-colors cursor-pointer magnetic">
                ❄️ {currentLang.acSleeper}
              </li>
              <li className="hover:text-white transition-colors cursor-pointer magnetic">
                📍 {currentLang.gpsTracking}
              </li>
              <li className="hover:text-white transition-colors cursor-pointer magnetic">🕒 {currentLang.support}</li>
            </ul>
          </div>

          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Phone className="mr-2 w-5 h-5" />
              {currentLang.contactInfoFooter}
            </h4>
            <ul className="space-y-2 text-orange-200">
              <li className="magnetic">📞 +91 98765 43210</li>
              <li className="magnetic">📧 info@nandighoshbus.com</li>
              <li className="magnetic">📍 Balasore, Odisha</li>
              <li className="magnetic">🕒 {currentLang.service24x7}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-orange-200 mb-4 md:mb-0">
              <p>
                &copy; {new Date().getFullYear()} Nandighosh. {currentLang.rightsReserved}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-orange-200">
              <span className="breathe">{currentLang.madeWith}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 card-3d animate-pulse-glow flex items-center justify-center"
          onClick={() => window.open("https://wa.me/919876543210", "_blank")}
          title="Contact us on WhatsApp"
          aria-label="Contact us on WhatsApp"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </button>
      </div>
    </footer>
  )
}
