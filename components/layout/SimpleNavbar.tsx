"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SimpleNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const navLinks = [
    { href: "/", label: "Home", id: "home" },
    { href: "/routes", label: "Routes", id: "routes" },
    { href: "/features", label: "Features", id: "features" },
    { href: "/contact", label: "Contact", id: "contact" },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const formatTime = (date: Date) => {
    if (!mounted) return "--:--:--"
    try {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    } catch (error) {
      return "--:--:--"
    }
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
              <span className="text-3xl font-bold text-white drop-shadow-lg">Nandighosh</span>
              <div className="text-sm text-orange-200 font-medium">Bus Service</div>
            </div>
          </Link>

          {/* Time Display */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-sm text-white/90 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 font-mono breathe">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`text-white/90 hover:text-white transition-all duration-300 font-semibold hover:scale-110 transform relative group magnetic ${
                  isActive(link.href) ? 'text-white' : ''
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
            <Link href="/booking">
              <Button className="btn-interactive bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold ripple">
                Book Now
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
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
