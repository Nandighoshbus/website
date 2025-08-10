"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, Building, MapPin, IdCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { THEME_CLASSES } from "@/lib/theme"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface AdminFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  employeeId: string
  department: string
  branch: string
  address: string
  emergencyContact: string
  adminLevel: 'admin' | 'super_admin'
}

export default function AdminSignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const router = useRouter()

  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    employeeId: "",
    department: "",
    branch: "",
    address: "",
    emergencyContact: "",
    adminLevel: 'admin'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone || !formData.employeeId) {
      return "Please fill in all required fields"
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
      // Call backend API for admin registration
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.adminLevel,
          metadata: {
            employee_id: formData.employeeId,
            department: formData.department,
            branch: formData.branch,
            address: formData.address,
            emergency_contact: formData.emergencyContact,
            admin_level: formData.adminLevel
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("Admin account created successfully! Please check your email for verification.")
        setMessageType("success")
        setTimeout(() => {
          router.push('/agent/login')
        }, 2000)
      } else {
        setMessage(data.message || "Failed to create admin account")
        setMessageType("error")
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred while creating the account")
      setMessageType("error")
    }

    setLoading(false)
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

      <div className="relative z-10 w-full max-w-2xl">
        <Card className={THEME_CLASSES.CARD_GLASS + " shadow-2xl border-white/30"}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Building className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Admin Registration
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Create a new administrator account for Nandighosh Bus Service
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
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
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
                      placeholder="admin@nandighosh.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
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
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-white">Employee ID *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      placeholder="ADM001"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
                    />
                  </div>
                </div>
              </div>

              {/* Department and Branch */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">Department</Label>
                  <Select onValueChange={(value) => handleSelectChange('department', value)}>
                    <SelectTrigger className={THEME_CLASSES.INPUT_GLASS}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="booking">Booking & Reservations</SelectItem>
                      <SelectItem value="finance">Finance & Accounts</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="it">Information Technology</SelectItem>
                      <SelectItem value="maintenance">Fleet Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-white">Branch Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                    <Input
                      id="branch"
                      name="branch"
                      type="text"
                      placeholder="Bhubaneswar"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
                    />
                  </div>
                </div>
              </div>

              {/* Admin Level */}
              <div className="space-y-2">
                <Label htmlFor="adminLevel" className="text-white">Admin Level</Label>
                <Select onValueChange={(value) => handleSelectChange('adminLevel', value)} defaultValue="admin">
                  <SelectTrigger className={THEME_CLASSES.INPUT_GLASS}>
                    <SelectValue placeholder="Select admin level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="super_admin">Super Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">Office Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter office address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={THEME_CLASSES.INPUT_GLASS}
                />
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
                    className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
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
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10 pr-10"}
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
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10 pr-10"}
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
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-2xl"
              >
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-blue-100">
                Already have an admin account?{" "}
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