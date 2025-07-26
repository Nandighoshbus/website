"use client"

import { Phone, Mail, MessageCircle, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SimpleFooter() {
  const currentTime = new Date()

  return (
    <footer className="bg-white text-gray-900 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-overlay">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-400/20 to-red-500/20 animate-pulse morph-bg"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
                <span className="text-xl font-bold text-gray-800">Nandighosh</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Your trusted partner for comfortable and safe bus travel across India.</p>
            <a 
              href="https://wa.me/1234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white hover:bg-white text-orange-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-orange-600"
              title="Contact us on WhatsApp"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-gray-800 transition-colors">
                <Link href="/" className="flex items-center space-x-2 magnetic">
                  🏠 Home
                </Link>
              </li>
              <li className="hover:text-gray-800 transition-colors">
                <Link href="/routes" className="flex items-center space-x-2 magnetic">
                  🛣️ Routes
                </Link>
              </li>
              <li className="hover:text-gray-800 transition-colors">
                <Link href="/features" className="flex items-center space-x-2 magnetic">
                  ✨ Features
                </Link>
              </li>
              <li className="hover:text-gray-800 transition-colors">
                <Link href="/contact" className="flex items-center space-x-2 magnetic">
                  📞 Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Our Services</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-gray-800 transition-colors cursor-pointer magnetic">
                🎫 Online Booking
              </li>
              <li className="hover:text-gray-800 transition-colors cursor-pointer magnetic">
                ❄️ AC Sleeper Buses
              </li>
              <li className="hover:text-gray-800 transition-colors cursor-pointer magnetic">
                📍 GPS Tracking
              </li>
              <li className="hover:text-gray-800 transition-colors cursor-pointer magnetic">
                🕒 24x7 Support
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="tilt-card">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Contact Info</h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2 magnetic">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>+91 1234-567-890</span>
              </li>
              <li className="flex items-center space-x-2 magnetic">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>info@nandighosh.com</span>
              </li>
              <li className="magnetic">🕒 24x7 Service Available</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-300 mt-12 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Nandighosh. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="breathe">Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
