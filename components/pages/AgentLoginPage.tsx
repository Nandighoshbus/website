"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Shield, UserCheck, Building, Phone, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { THEME_CLASSES } from "@/lib/theme"

export default function AgentLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<'agent' | 'admin'>('agent')
  const [formData, setFormData] = useState({
    agentId: "",
    password: "",
    branchCode: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Agent login submitted:", { ...formData, loginType })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/bus-fleet.jpg"
          alt="Bus Fleet Background"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-slate-900/60"></div>

      <div className="relative z-10 w-full max-w-lg">
        <Card className={THEME_CLASSES.CARD_GLASS + " shadow-2xl border-white/20"}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
              Agent Portal
            </CardTitle>
            <CardDescription className="text-white/90 text-lg font-medium drop-shadow-md">
              Secure access for Nandighosh agents and administrators
            </CardDescription>

            {/* Login Type Toggle */}
            <div className="mt-6 flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              <button
                type="button"
                onClick={() => setLoginType('agent')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'agent'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                Agent
              </button>
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'admin'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Agent ID Field */}
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  type="text"
                  name="agentId"
                  placeholder={loginType === 'admin' ? "Admin ID" : "Agent ID"}
                  value={formData.agentId}
                  onChange={handleInputChange}
                  className={THEME_CLASSES.INPUT_GLASS + " pl-10 text-white placeholder:text-white/70 border-white/30 focus:border-blue-300/60"}
                  required
                />
              </div>

              {/* Branch Code Field removed as requested */}

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={THEME_CLASSES.INPUT_GLASS + " pl-10 pr-10 text-white placeholder:text-white/70 border-white/30 focus:border-blue-300/60"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white font-medium cursor-pointer hover:text-white/90 transition-colors">
                  <input 
                    type="checkbox" 
                    className="mr-2 accent-blue-500 w-4 h-4 rounded border-white/30 bg-white/10" 
                  />
                  Remember me
                </label>
                <Link href="#" className="text-blue-300 hover:text-blue-200 font-semibold transition-colors underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-400/30 hover:border-blue-300/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-6 rounded-xl font-semibold btn-interactive ripple"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loginType === 'admin' ? 'Admin Sign In' : 'Agent Sign In'}
              </Button>
            </form>

            {/* Agent Registration */}
            <div className="mt-6 text-center">
              <p className="text-white/80 font-medium text-sm">
                New agent?
                <Link 
                  href="/agent/register" 
                  className="ml-2 text-blue-300 hover:text-blue-200 font-bold transition-colors duration-200 underline hover:no-underline"
                >
                  Request Access
                </Link>
              </p>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-white/70 font-medium backdrop-blur-sm">Need Help?</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center space-x-4">
                <Link
                  href="tel:+918000000000"
                  className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Support: +91-8000-000-000
                </Link>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-white/60 hover:text-white/80 text-sm font-medium underline hover:no-underline transition-all duration-200"
              >
                ← Back to Customer Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
