"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  DollarSign,
  LogOut,
  Settings,
  Bus,
  Users,
  TrendingUp,
  Calendar,
  Plus
} from "lucide-react"
import { useRouter } from "next/navigation"
import { THEME_CLASSES } from "@/lib/theme"
import BookingForm from "@/components/agent/BookingForm"
import { useAgentAuth } from "@/components/context/AgentAuthContext"

interface AgentStats {
  totalBookings: number
  monthlyBookings: number
  totalCommission: number
  monthlyCommission: number
  activeRoutes: number
}

export default function AgentDashboard() {
  const { user, isLoading: authLoading, logout } = useAgentAuth()
  const [stats, setStats] = useState<AgentStats>({
    totalBookings: 0,
    monthlyBookings: 0,
    totalCommission: 0,
    monthlyCommission: 0,
    activeRoutes: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/agent/login')
      return
    }

    if (user) {
      fetchAgentStats()
    }
  }, [user, authLoading, router])

  const fetchAgentStats = async () => {
    if (!user) return

    try {
      console.log('Fetching agent stats for user:', user.id)

      const { jwtAuth } = await import('@/lib/jwtAuth')
      const token = jwtAuth.getToken('agent')

      if (!token) {
        console.error('No agent token found in localStorage')
        setLoading(false)
        return
      }

      console.log('Agent token present. length:', token.length)

      try {
  const data = await jwtAuth.authenticatedRequest('agent', '/agents/stats', { method: 'GET' })
        if (data && (data as any).success) {
          setStats((data as any).data)
          console.log('Agent stats loaded:', (data as any).data)
          return
        }
        console.error('Unexpected stats response:', data)
      } catch (err: any) {
        console.error('Error fetching agent stats via jwtAuth:', err.message || err)
        if (err.message && err.message.includes('Authentication expired')) {
          await logout()
        }
      }

      // Fallback mock data
      const mockStats = {
        totalBookings: 156,
        monthlyBookings: 24,
        totalCommission: 12500,
        monthlyCommission: 2400,
        activeRoutes: 8
      }
      setStats(mockStats)
      console.log('Using mock agent stats:', mockStats)
    } catch (error) {
      console.error('Error in fetchAgentStats:', error)
      setStats({ totalBookings: 156, monthlyBookings: 24, totalCommission: 12500, monthlyCommission: 2400, activeRoutes: 8 })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/agent/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-auto">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Agent Dashboard</h1>
                <p className="text-sm text-blue-200">
                  {user.full_name || 'Nandighosh Bus Service'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.full_name}</p>
                <p className="text-xs text-blue-200">
                  {user.full_name || 'Agent'}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.full_name}!
          </h2>
          <p className="text-blue-200">
            Manage your bookings and track your performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={THEME_CLASSES.CARD_GLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Bookings
              </CardTitle>
              <Bus className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
              <p className="text-xs text-blue-200">All time bookings</p>
            </CardContent>
          </Card>

          <Card className={THEME_CLASSES.CARD_GLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.monthlyBookings}</div>
              <p className="text-xs text-blue-200">Monthly bookings</p>
            </CardContent>
          </Card>

          <Card className={THEME_CLASSES.CARD_GLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Commission
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{stats.totalCommission}</div>
              <p className="text-xs text-blue-200">All time earnings</p>
            </CardContent>
          </Card>

          <Card className={THEME_CLASSES.CARD_GLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Monthly Commission
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{stats.monthlyCommission}</div>
              <p className="text-xs text-blue-200">This month earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="booking" className="text-white data-[state=active]:bg-white/20">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-white/20">
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/20">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <Card className={THEME_CLASSES.CARD_GLASS}>
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-blue-200">
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-white/5 border-white/20 hover:bg-white/10"
                        onClick={() => {/* Switch to booking tab */}}
                      >
                        <Bus className="w-6 h-6 text-blue-400" />
                        <span className="text-white text-sm">New Booking</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-white/5 border-white/20 hover:bg-white/10"
                      >
                        <Users className="w-6 h-6 text-green-400" />
                        <span className="text-white text-sm">View Customers</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2 bg-white/5 border-white/20 hover:bg-white/10"
                      >
                        <TrendingUp className="w-6 h-6 text-yellow-400" />
                        <span className="text-white text-sm">Reports</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Summary */}
              <div className="lg:col-span-1">
                <Card className={THEME_CLASSES.CARD_GLASS}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">
                        {user.full_name || 'Business Name'}
                      </span>
                    </div>

                    <div className="pt-4">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        Active Agent
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="booking" className="mt-6">
            <BookingForm />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card className={THEME_CLASSES.CARD_GLASS}>
              <CardHeader>
                <CardTitle className="text-white">My Bookings</CardTitle>
                <CardDescription className="text-blue-200">
                  View and manage your recent bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-white text-center py-8">
                  <Bus className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <p>Booking history will be displayed here</p>
                  <p className="text-sm text-blue-200 mt-2">Integration with booking API in progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className={THEME_CLASSES.CARD_GLASS}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">{user.email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">
                    {user.full_name || 'Business Name'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">
                    Agent ID: {user.id}
                  </span>
                </div>

                <div className="pt-4">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    Active Agent
                  </Badge>
                </div>

                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {/* TODO: Navigate to profile edit */}}
                >
                  <Settings className="w-4 h-4 mr-2" />
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
