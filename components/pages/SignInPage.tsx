"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { THEME_CLASSES } from "@/lib/theme"

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-15">
        <Image
          src="/images/buses2.jpeg"
          alt="Bus Background"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-purple-900/30 to-blue-900/50"></div>

      <div className="relative z-10 w-full max-w-md">
        <Card className={THEME_CLASSES.CARD_GLASS + " shadow-2xl border-white/30"}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/images/nandighosh-logo-updated.png"
                  alt="Nandighosh Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
              {isLogin ? "Welcome Back" : "Join Nandighosh"}
            </CardTitle>
            <CardDescription className="text-white/90 text-lg font-medium drop-shadow-md">
              {isLogin 
                ? "Sign in to your account to continue your journey" 
                : "Create an account to start booking with us"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10 text-black placeholder:text-gray-500 border-white/30 focus:border-purple-300/60"}
                      required={!isLogin}
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10 text-black placeholder:text-gray-500 border-white/30 focus:border-purple-300/60"}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={THEME_CLASSES.INPUT_GLASS + " pl-10 text-black placeholder:text-gray-500 border-white/30 focus:border-purple-300/60"}
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={THEME_CLASSES.INPUT_GLASS + " pl-10 text-black placeholder:text-gray-500 border-white/30 focus:border-purple-300/60"}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={THEME_CLASSES.INPUT_GLASS + " pl-10 pr-10 text-black placeholder:text-gray-500 border-white/30 focus:border-purple-300/60"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-white font-medium cursor-pointer hover:text-white/90 transition-colors">
                    <input 
                      type="checkbox" 
                      className="mr-2 accent-purple-500 w-4 h-4 rounded border-white/30 bg-white/10" 
                    />
                    Remember me
                  </label>
                  <Link href="#" className="text-purple-300 hover:text-purple-200 font-semibold transition-colors underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className={THEME_CLASSES.BUTTON_AUTH + " w-full py-3"}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white font-medium text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-purple-300 hover:text-purple-200 font-bold transition-colors duration-200 underline hover:no-underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-white/80 font-medium backdrop-blur-sm">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className={THEME_CLASSES.BUTTON_SECONDARY + " text-white font-semibold hover:text-white"}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  className={THEME_CLASSES.BUTTON_SECONDARY + " text-white font-semibold hover:text-white"}
                >
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-white/80 hover:text-white text-sm font-medium underline hover:no-underline transition-all duration-200"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
