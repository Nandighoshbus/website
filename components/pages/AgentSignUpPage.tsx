"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, Building, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { THEME_CLASSES } from "@/lib/theme"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface AgentFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  branch: string
  customBranch: string
  address: string
  city: string
  state: string
  pincode: string
  emergencyContact: string
  experience: string
  dateOfJoining: string
}

export default function AgentSignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [showCustomBranch, setShowCustomBranch] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<AgentFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    branch: "",
    customBranch: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    experience: "",
    dateOfJoining: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'branch') {
      if (value === 'other') {
        setShowCustomBranch(true)
        setFormData({ ...formData, [name]: value, customBranch: "" })
      } else {
        setShowCustomBranch(false)
        setFormData({ ...formData, [name]: value, customBranch: "" })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone) {
      return "Please fill in all required fields"
    }
    
    if (formData.branch === 'other' && !formData.customBranch.trim()) {
      return "Please enter a custom branch location"
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match"
    }
    
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    
    if (!formData.email.includes("@")) {
      return "Please enter a valid email address"
    }
    
    if (formData.phone.length < 10) {
      return "Please enter a valid phone number"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setMessage(validationError)
      setMessageType("error")
      return
    }
    
    setLoading(true)
    setMessage("")
    
    try {
      // Call agent registration API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/agent/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          business_name: '',
          business_type: 'individual',
          experience_years: formData.experience,
          documents: '',
          reason: `Interested in joining as agent. Experience: ${formData.experience}. Expected joining date: ${formData.dateOfJoining}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || "Agent registration request submitted successfully! Please check your email to verify your account.")
        setMessageType("success")
        setTimeout(() => {
          router.push('/agent/login')
        }, 3000)
      } else {
        console.error('Registration error:', data)
        setMessage(data.message || data.error || "Failed to submit agent registration request")
        setMessageType("error")
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred while submitting the registration request")
      setMessageType("error")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/bus-fleet.jpg"
          alt="Agent Background"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-teal-900/50 to-blue-900/60"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className={THEME_CLASSES.CARD_GLASS + " shadow-2xl border-white/30"}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Building className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Agent Registration
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Join our team as a booking agent for Nandighosh Bus Service
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <div className={`p-4 rounded-lg text-center ${
                messageType === "success" 
                  ? "bg-green-500/20 text-green-100 border border-green-500/30" 
                  : "bg-red-500/20 text-red-100 border border-red-500/30"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining" className="text-white">Expected Date of Joining *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="dateOfJoining"
                      name="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Branch and Experience */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-white">Branch Location *</Label>
                  <Select onValueChange={(value) => handleSelectChange('branch', value)}>
                    <SelectTrigger className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                      <SelectItem value="cuttack">Cuttack</SelectItem>
                      <SelectItem value="puri">Puri</SelectItem>
                      <SelectItem value="berhampur">Berhampur</SelectItem>
                      <SelectItem value="balasore">Balasore</SelectItem>
                      <SelectItem value="rourkela">Rourkela</SelectItem>
                      <SelectItem value="sambalpur">Sambalpur</SelectItem>
                      <SelectItem value="angul">Angul</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {showCustomBranch && (
                    <div className="mt-2">
                      <Input
                        id="customBranch"
                        name="customBranch"
                        type="text"
                        placeholder="Enter custom branch location"
                        value={formData.customBranch}
                        onChange={handleInputChange}
                        className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white">Experience</Label>
                  <Select onValueChange={(value) => handleSelectChange('experience', value)}>
                    <SelectTrigger className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="1-2">1-2 Years</SelectItem>
                      <SelectItem value="3-5">3-5 Years</SelectItem>
                      <SelectItem value="5+">5+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold">Address Details</Label>
                
                {/* Street Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter street address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">State</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-white">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-white">Emergency Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    placeholder="Emergency contact number"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-blue-300 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-800/90 border-gray-600/50 text-white font-medium placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg focus:shadow-xl pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-blue-300 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-2xl"
              >
                {loading ? "Creating Account..." : "Create Agent Account"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-blue-100">
                Already have an agent account?{" "}
                <Link
                  href="/agent/login"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  Sign In
                </Link>
              </p>
              <p className="text-blue-200 text-sm mt-2">
                <Link
                  href="/"
                  className="text-blue-300 hover:text-blue-200"
                >
                  ← Back to Home
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}