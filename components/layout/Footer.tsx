"use client"

import { Facebook, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FooterProps {
  currentLang: any
  currentTime: Date
}

export default function Footer({ currentLang, currentTime }: FooterProps) {
  return (
    <>
      <footer className="bg-white text-gray-900 py-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-overlay">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-400/20 to-red-500/20 animate-pulse morph-bg"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            <div className="tilt-card md:pr-8">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/images/nandighosh-logo.png"
                  alt="Nandighosh Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="text-2xl font-extrabold text-gray-800">Nandighosh Travels</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-4">{currentLang.footerDescription}</p>
              <div className="flex space-x-4">
                <Link 
                  href="https://www.facebook.com/nandighoshbus" 
                  target="_blank" 
                  className="cursor-pointer hover:scale-110 transition-all magnetic"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-300 hover:bg-orange-400 transition-colors duration-300 flex items-center justify-center shadow-md">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                </Link>
                <Link 
                  href="https://www.instagram.com/nandighoshbus" 
                  target="_blank" 
                  className="cursor-pointer hover:scale-110 transition-all magnetic"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-300 hover:bg-orange-400 transition-colors duration-300 flex items-center justify-center shadow-md">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                </Link>
                <Link 
                  href="https://www.linkedin.com/company/nandighoshbus" 
                  target="_blank" 
                  className="cursor-pointer hover:scale-110 transition-all magnetic"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-300 hover:bg-orange-400 transition-colors duration-300 flex items-center justify-center shadow-md">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="tilt-card">
              <h4 className="text-xl font-bold mb-4 text-gray-800">
                {currentLang.quickLinks}
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <Link href="/" className="text-base font-semibold hover:scale-105 transition-all magnetic">
                    {currentLang.home}
                  </Link>
                </li>
                <li>
                  <Link href="/routes" className="text-base font-semibold hover:text-gray-800 transition-colors magnetic">
                    {currentLang.routes}
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-base font-semibold hover:text-gray-800 transition-colors magnetic">
                    {currentLang.features}
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="text-base font-semibold hover:text-gray-800 transition-colors magnetic">
                    Book Now
                  </Link>
                </li>
              </ul>
            </div>

            <div className="tilt-card">
              <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                {currentLang.services}
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">
                  {currentLang.onlineBooking}
                </li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">
                  {currentLang.acSleeper}
                </li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">
                   {currentLang.gpsTracking}
                </li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">{currentLang.support}</li>
              </ul>
            </div>

            <div className="tilt-card">
              <h4 className="text-xl font-bold mb-4 text-gray-800">
                {currentLang.contactInfoFooter}
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">+91 98765 43210</li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">info@nandighoshbus.com</li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">Balasore, Odisha</li>
                <li className="text-base font-semibold hover:text-gray-800 transition-colors cursor-pointer magnetic">{currentLang.service24x7}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 mb-4 md:mb-0">
                <p>
                  &copy; {new Date().getFullYear()} Nandighosh. {currentLang.rightsReserved}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="breathe">{currentLang.madeWith}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
