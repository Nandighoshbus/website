"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavbarProps {
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
  currentLang: any
}

export default function Navbar({ currentLanguage, setCurrentLanguage, currentLang }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: currentLang.home, id: "home" },
    { href: "/about", label: currentLang.about, id: "about" },
    { href: "/routes", label: currentLang.routes, id: "routes" },
    { href: "/features", label: currentLang.features, id: "features" },
    { href: "/offers", label: currentLang.offers, id: "offers" },
    { href: "/contact", label: currentLang.contact, id: "contact" },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 w-full navbar-glass z-50 shadow-2xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 hover-zone">
            <div className="relative">
              <Image
                src="/images/nandighosh-logo-updated.png"
                alt="Nandighosh Logo"
                width={64}
                height={64}
                className="w-16 h-16 object-contain animate-pulse-glow"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-bounce"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">Nandighosh Travels</span>
            </div>
          </Link>

          {/* Language Selector */}
          <div className="hidden lg:flex items-center space-x-6">
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              aria-label="Select language"
              title="Language selection"
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300 tilt-card"
            >
              <option value="en" className="text-gray-800">
                🇬🇧 English
              </option>
              <option value="hi" className="text-gray-800">
                🇮🇳 हिंदी
              </option>
              <option value="or" className="text-gray-800">
                🏛️ ଓଡ଼ିଆ
              </option>
            </select>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic ${
                  pathname === link.href 
                    ? 'text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg' 
                    : 'text-white/90 hover:text-white px-2 py-1'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/booking">
              <Button className="btn-interactive bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold ripple">
                {currentLang.bookNow}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-orange-200 transition-colors transform hover:scale-110 glitch"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 backdrop-blur-sm">
            <div className="flex flex-col space-y-4 pt-4">
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                aria-label="Select language (mobile)"
                title="Language selection"
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50"
              >
                <option value="en" className="text-gray-800">
                  🇬🇧 English
                </option>
                <option value="hi" className="text-gray-800">
                  🇮🇳 हिंदी
                </option>
                <option value="or" className="text-gray-800">
                  🏛️ ଓଡ଼ିଆ
                </option>
              </select>
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`text-white/90 hover:text-white transition-colors px-2 py-1 rounded ${
                    isActive(link.href) ? 'text-white bg-white/10' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/booking" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full btn-interactive bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 mt-3">
                  {currentLang.bookNow}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
