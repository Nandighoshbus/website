'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, Shield, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { THEME_CLASSES } from '@/lib/theme'
import { useAdminAuth } from '@/components/context/AdminAuthContext'

interface LoginFormData {
  email: string
  password: string
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const router = useRouter()
  const { login } = useAdminAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      console.log('AdminLoginPage: Starting login process')
      await login(formData.email, formData.password)
      console.log('AdminLoginPage: Login successful, redirecting...')
      setMessage("Admin login successful!")
      setMessageType("success")
      
      // Small delay to allow auth context to update
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 500)
    } catch (error: any) {
      console.error('AdminLoginPage: Login failed:', error)
      setMessage(error.message || "Invalid email or password.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/bus-fleet.jpg"
          alt="Admin Background"
          fill
          className="object-cover"
        />
      </div>
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-slate-900/60"></div>
      <div className="relative z-10 w-full max-w-lg">
        <Card className={THEME_CLASSES.CARD_GLASS + " shadow-2xl border-white/30"}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Admin Login
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Sign in to access the Nandighosh Bus Service Admin Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-center ${
                messageType === "success" 
                  ? "bg-green-500/20 text-green-100 border border-green-500/30" 
                  : "bg-red-500/20 text-red-100 border border-red-500/30"
              }`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm font-medium block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter admin email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-900/95 border-gray-700/60 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-800/95 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-12 h-12"
                  />
                </div>
              </div>
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm font-medium block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-900/95 border-gray-700/60 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-800/95 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-semibold shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>
            </form>
            {/* Additional Links */}
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="text-center pt-4 border-t border-white/10">
                <Link
                  href="/"
                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
