"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  Phone, 
  Mail, 
  Edit, 
  LogOut,
  Bus,
  Receipt,
  Settings,
  Bell,
  Shield
} from "lucide-react"
import { useAuth } from "@/components/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const { user, userProfile, loading: authLoading, signOut } = useAuth()

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?redirect=dashboard')
      return
    }
  }, [user, authLoading, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  const getFirstName = () => {
    if (userProfile?.first_name) return userProfile.first_name
    if (userProfile?.full_name) return userProfile.full_name.split(' ')[0]
    return user?.email?.split('@')[0] || 'User'
  }

  const getFullName = () => {
    if (userProfile?.full_name) return userProfile.full_name
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    return user?.email?.split('@')[0] || 'User'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-20">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-white/20">
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xl font-bold">
                {getFirstName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {getFirstName()}!</h1>
              <p className="text-white/80">Manage your bookings and profile</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              <Bus className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-white/20">
              <Receipt className="w-4 h-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/20">
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Bus className="w-5 h-5 mr-2 text-blue-400" />
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-white/70 text-sm">All time bookings</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-400" />
                    Upcoming Trips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-white/70 text-sm">Confirmed bookings</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹0</div>
                  <p className="text-white/70 text-sm">Lifetime spending</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-white/70">
                  Get started with your travel planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/booking">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Bus className="w-4 h-4 mr-2" />
                    Book a New Trip
                  </Button>
                </Link>
                <Link href="/routes">
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Routes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription className="text-white/70">
                  View and manage your travel bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bus className="w-16 h-16 mx-auto text-white/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-white/70 mb-6">Start your journey by booking your first trip</p>
                  <Link href="/booking">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Book Your First Trip
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Full Name</label>
                    <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <User className="w-4 h-4 text-white/70" />
                      <span>{getFullName()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Email</label>
                    <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Mail className="w-4 h-4 text-white/70" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Phone</label>
                    <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Phone className="w-4 h-4 text-white/70" />
                      <span>{userProfile?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Account Status</label>
                    <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
