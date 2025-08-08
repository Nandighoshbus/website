"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { THEME_CLASSES } from "@/lib/theme"
import { useAuth } from "@/components/context/AuthContext"

interface NavbarProps {
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
  currentLang: any
}

export default function Navbar({ currentLanguage, setCurrentLanguage, currentLang }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Use actual authentication context
  const { user, signOut, loading } = useAuth()

  // Helper function to get first name only
  const getFirstName = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0]
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      console.log('Navbar: Starting signOut...')
      const { error } = await signOut()
      
      // Since we now handle "Auth session missing" as success in the auth layer,
      // we only treat it as an error if it's a different type of error
      if (error && !error.message?.includes('Auth session missing')) {
        console.error('SignOut error:', error.message)
        // Could add toast notification here for actual errors
      } else {
        console.log('Navbar: SignOut completed, redirecting...')
        setIsUserMenuOpen(false)
        router.push('/')
      }
    } catch (error) {
      console.error('SignOut failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navLinks = [
    { href: "/", label: currentLang.home, id: "home" },
    { href: "/about", label: currentLang.about, id: "about" },
    { href: "/routes", label: currentLang.routes, id: "routes" },
    { href: "/features", label: currentLang.features, id: "features" },
    { href: "/contact", label: currentLang.contact, id: "contact" },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 w-full navbar-glass z-40 shadow-2xl">
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
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all duration-300 tilt-card language-selector"
            >
              <option value="en" className="text-gray-800">
                EN
              </option>
              <option value="hi" className="text-gray-800">
                HIN
              </option>
              <option value="or" className="text-gray-800">
                OD
              </option>
            </select>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
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
              <Button className={THEME_CLASSES.BUTTON_SECONDARY}>
                {currentLang.bookNow}
              </Button>
            </Link>
            <Link href="/agent/login">
              <Button className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border border-orange-300/30 hover:border-orange-200/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold btn-interactive ripple">
                Agent Portal
              </Button>
            </Link>
            
            {/* User Profile or Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative z-10">
                    <User className="w-5 h-5 text-white stroke-2" />
                  </div>
                  <span className="font-medium text-sm">{getFirstName(user)}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200/50">
                      <p className="text-sm font-medium text-gray-800">{getFirstName(user)}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100/50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 stroke-2" />
                      <span className="text-sm">Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50/50 transition-colors w-full text-left disabled:opacity-50"
                    >
                      {isSigningOut ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <LogOut className="w-4 h-4 stroke-2" />
                      )}
                      <span className="text-sm">{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin">
                <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border border-orange-400/30 hover:border-orange-300/50 shadow-2xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold h-10 relative overflow-hidden">
                  <User className="w-4 h-4 mr-2 stroke-2 relative z-10" />
                  <span className="relative z-10">{currentLang.signIn}</span>
                </Button>
              </Link>
            )}
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
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 language-selector"
              >
                <option value="en" className="text-gray-800">
                  EN
                </option>
                <option value="hi" className="text-gray-800">
                  HIN
                </option>
                <option value="or" className="text-gray-800">
                  OD
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
                <Button className={THEME_CLASSES.BUTTON_SECONDARY + " w-full mt-3"}>
                  {currentLang.bookNow}
                </Button>
              </Link>
              <Link href="/agent/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full mt-3 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border border-orange-300/30 hover:border-orange-200/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold btn-interactive ripple">
                  Agent Portal
                </Button>
              </Link>
              
              {/* Mobile User Profile or Sign In */}
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative z-10">
                      <User className="w-5 h-5 text-white stroke-2" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{getFirstName(user)}</p>
                      <p className="text-white/70 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                      <Settings className="w-4 h-4 mr-2 stroke-2" />
                      Profile Settings
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    disabled={isSigningOut}
                    className="w-full bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-200 mr-2"></div>
                    ) : (
                      <LogOut className="w-4 h-4 mr-2 stroke-2" />
                    )}
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full mt-3 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border border-orange-400/30 hover:border-orange-300/50 shadow-2xl transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-xl font-semibold h-10 relative overflow-hidden">
                    <User className="w-4 h-4 mr-2 stroke-2 relative z-10" />
                    <span className="relative z-10">{currentLang.signIn}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
