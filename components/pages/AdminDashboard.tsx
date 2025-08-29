'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, Edit, Plus, Trash2, Users, Bus, MapPin, Calendar, CreditCard, UserCheck, UserPlus } from 'lucide-react'
import { useAdminAuth } from '@/components/context/AdminAuthContext'
import { supabase } from '@/lib/supabase'

// TypeScript interfaces
interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'agent' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface BusData {
  id: string;
  bus_number: string;
  model: string;
  capacity: number;
  bus_type: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
}

interface RouteData {
  id: string;
  route_name: string;
  origin_city: string;
  destination_city: string;
  distance_km: number;
  estimated_duration: string;
  base_fare: number;
  operating_days: string[];
  is_active: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  passenger_name: string;
  route_name: string;
  journey_date: string;
  seats_booked: number;
  total_amount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

interface AgentRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_name?: string;
  business_type?: string;
  experience_years?: string;
  documents?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  requested_at: string;
  reviewed_at?: string;
}

interface Agent {
  id: string;
  user_id: string;
  agent_code: string;
  business_name: string;
  business_type?: string;
  contact_person?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  commission_rate: number;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StatCard {
  title: string;
  value: number | string;
  Icon: React.ComponentType<any>;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  onSave: (data: any) => void;
}

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  onSave: (data: any) => void;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [buses, setBuses] = useState<BusData[]>([])
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [agentRequests, setAgentRequests] = useState<AgentRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Use the scalable authentication context
  const { user: currentUser, isLoading: authLoading, logout } = useAdminAuth()

  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchData()
    }
  }, [currentUser, authLoading])

  // Show loading while authentication is being verified
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (handled by auth context)
  if (!currentUser) {
    return null
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get auth token from session
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        console.error('No auth token found')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all data in parallel
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const [usersRes, busesRes, routesRes, bookingsRes, agentRequestsRes, agentsRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/admin/users`, { headers }),
        fetch(`${baseUrl}/api/v1/admin/buses`, { headers }),
        fetch(`${baseUrl}/api/v1/admin/routes`, { headers }),
        fetch(`${baseUrl}/api/v1/admin/bookings`, { headers }),
        fetch(`${baseUrl}/api/v1/admin/agent-requests`, { headers }),
        fetch(`${baseUrl}/api/v1/admin/agents`, { headers })
      ])

      // Process responses
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data || [])
      }

      if (busesRes.ok) {
        const busesData = await busesRes.json()
        setBuses(busesData.data || [])
      }

      if (routesRes.ok) {
        const routesData = await routesRes.json()
        setRoutes(routesData.data || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.data || [])
      }

      if (agentRequestsRes.ok) {
        const agentRequestsData = await agentRequestsRes.json()
        setAgentRequests(agentRequestsData.data || [])
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        console.log('Agents API Response:', agentsData)
        setAgents(agentsData.data || [])
      } else {
        console.error('Failed to fetch agents:', agentsRes.status, agentsRes.statusText)
        const errorData = await agentsRes.json().catch(() => ({}))
        console.error('Agents API Error:', errorData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    const confirmMessage = type === 'agent' 
      ? `Are you sure you want to deactivate this ${type}? This will make the agent inactive but preserve their data.`
      : `Are you sure you want to delete this ${type}?`
    
    if (!confirm(confirmMessage)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        console.error('No session token available')
        alert('Authentication error. Please login again.')
        return
      }

      // Fix URL construction for delete operations
      const getEndpoint = (type: string) => {
        switch(type) {
          case 'bus': return 'buses'
          case 'route': return 'routes'
          case 'user': return 'users'
          case 'booking': return 'bookings'
          case 'agent': return 'agents'
          default: return `${type}s`
        }
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/v1/admin/${getEndpoint(type)}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchData() // Refresh data
        const successMessage = type === 'agent' 
          ? 'Agent deactivated successfully'
          : `${type} deleted successfully`
        alert(successMessage)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Failed to ${type === 'agent' ? 'deactivate' : 'delete'} ${type}`
        alert(errorMessage)
        console.error(`Delete ${type} error:`, errorData)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      alert(`Error ${type === 'agent' ? 'deactivating' : 'deleting'} ${type}`)
    }
  }

  const handleEdit = (type: string, item: any) => {
    setSelectedEntity({ type, ...item })
    setIsEditModalOpen(true)
  }

  const handleAdd = (type: string) => {
    setSelectedEntity({ type })
    setIsAddModalOpen(true)
  }

  const handleApproveAgent = async (request: AgentRequest) => {
    const password = prompt('Enter a password for the new agent account:')
    if (!password) return

    const adminNotes = prompt('Add any notes for this approval (optional):') || ''

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        alert('Authentication error. Please login again.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/agent-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          password,
          admin_notes: adminNotes
        })
      })

      if (response.ok) {
        alert('Agent request approved successfully!')
        fetchData() // Refresh data
      } else {
        const error = await response.json()
        alert(`Failed to approve agent: ${error.message}`)
      }
    } catch (error) {
      console.error('Error approving agent:', error)
      alert('Failed to approve agent request')
    }
  }

  const handleRejectAgent = async (request: AgentRequest) => {
    const adminNotes = prompt('Reason for rejection:')
    if (!adminNotes) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        alert('Authentication error. Please login again.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/agent-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          admin_notes: adminNotes
        })
      })

      if (response.ok) {
        alert('Agent request rejected')
        fetchData() // Refresh data
      } else {
        const error = await response.json()
        alert(`Failed to reject agent: ${error.message}`)
      }
    } catch (error) {
      console.error('Error rejecting agent:', error)
      alert('Failed to reject agent request')
    }
  }

  const viewAgentDetails = (request: AgentRequest) => {
    const details = `
Name: ${request.full_name}
Email: ${request.email}
Phone: ${request.phone}
Address: ${request.address}, ${request.city}, ${request.state} - ${request.pincode}
Business: ${request.business_name || 'N/A'}
Business Type: ${request.business_type || 'N/A'}
Experience: ${request.experience_years || 'N/A'}
Documents: ${request.documents || 'N/A'}
Reason: ${request.reason}
Status: ${request.status}
Requested: ${new Date(request.requested_at).toLocaleString()}
${request.admin_notes ? `Admin Notes: ${request.admin_notes}` : ''}
${request.reviewed_at ? `Reviewed: ${new Date(request.reviewed_at).toLocaleString()}` : ''}
    `
    alert(details)
  }

  const handleSave = async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        console.error('No session token available')
        return
      }

      const isEdit = data.id
      
      // Fix URL construction for bus type (bus -> buses, not buss)
      const getEndpoint = (type: string) => {
        switch(type) {
          case 'bus': return 'buses'
          case 'route': return 'routes'
          case 'user': return 'users'
          case 'booking': return 'bookings'
          case 'agent': return 'agents'
          default: return `${type}s`
        }
      }
      
      const endpoint = getEndpoint(data.type)
      const baseUrl3 = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const url = isEdit 
        ? `${baseUrl3}/api/v1/admin/${endpoint}/${data.id}`
        : `${baseUrl3}/api/v1/admin/${endpoint}`

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        fetchData()
        setIsEditModalOpen(false)
        setIsAddModalOpen(false)
        alert(`${data.type} ${isEdit ? 'updated' : 'created'} successfully`)
      } else {
        alert(`Failed to ${isEdit ? 'update' : 'create'} ${data.type}`)
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving data')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color = "blue" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}-600`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage all aspects of Nandighosh Bus Service</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                logout() // Use the scalable auth logout function
                window.location.href = '/admin/login'
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 lg:w-[800px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="approved-agents">Agents</TabsTrigger>
            <TabsTrigger value="agents">Agent Requests</TabsTrigger>
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard 
                title="Total Users" 
                value={users.length} 
                icon={Users} 
                color="blue" 
              />
              <StatCard 
                title="Active Agents" 
                value={agents.filter(agent => agent.is_active).length} 
                icon={UserCheck} 
                color="indigo" 
              />
              <StatCard 
                title="Active Buses" 
                value={buses.filter(bus => bus.status === 'active').length} 
                icon={Bus} 
                color="green" 
              />
              <StatCard 
                title="Available Routes" 
                value={routes.length} 
                icon={MapPin} 
                color="purple" 
              />
              <StatCard 
                title="Total Bookings" 
                value={bookings.length} 
                icon={Calendar} 
                color="orange" 
              />
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest bookings and user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Booking #{booking.booking_reference}</p>
                        <p className="text-sm text-gray-600">
                          {booking.passenger_name} - {booking.route_name}
                        </p>
                      </div>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button onClick={() => handleAdd('user')}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit('user', user)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete('user', user.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Agents Tab */}
          <TabsContent value="approved-agents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Agent Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Export</Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Code</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No approved agents found. Agents appear here after approving agent registration requests.
                        </TableCell>
                      </TableRow>
                    ) : (
                      agents.map((agent) => {
                        console.log('Rendering agent:', agent);
                        return (
                          <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.agent_code || 'N/A'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{agent.business_name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{agent.business_type || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{agent.contact_person || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{agent.email || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{agent.phone || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{agent.city || 'N/A'}, {agent.state || 'N/A'}</p>
                              <p className="text-gray-600">{agent.pincode || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">{agent.commission_rate || 0}%</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">₹{agent.current_balance || 0}</p>
                              <p className="text-gray-600">Limit: ₹{agent.credit_limit || 0}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit('agent', agent)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete('agent', agent.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Requests Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Agent Registration Requests
                </CardTitle>
                <CardDescription>
                  Review and manage agent registration requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentRequests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No agent requests found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.full_name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.business_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApproveAgent(request)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleRejectAgent(request)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => viewAgentDetails(request)}
                                className="ml-2"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buses Tab */}
          <TabsContent value="buses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bus Fleet Management</h2>
              <Button onClick={() => handleAdd('bus')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Bus
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses.map((bus) => (
                      <TableRow key={bus.id}>
                        <TableCell className="font-medium">{bus.bus_number}</TableCell>
                        <TableCell>{bus.model}</TableCell>
                        <TableCell>{bus.capacity}</TableCell>
                        <TableCell>
                          <Badge>{bus.bus_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>
                            {bus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit('bus', bus)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete('bus', bus.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Route Management</h2>
              <Button onClick={() => handleAdd('route')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Route
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Details</TableHead>
                      <TableHead>Distance & Duration</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>Operating Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.route_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.origin_city} → {item.destination_city}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{item.distance_km} km</p>
                            <p className="text-gray-600">{item.estimated_duration}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium text-green-600">₹{item.base_fare}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(item.operating_days || []).map((day: string) => (
                              <Badge key={day} variant="outline" className="text-xs px-1 py-0">
                                {day.slice(0, 3).toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit('route', item)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete('route', item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Booking Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Export</Button>
                <Button onClick={() => handleAdd('booking')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Booking
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                        <TableCell>{booking.passenger_name}</TableCell>
                        <TableCell>{booking.route_name}</TableCell>
                        <TableCell>{new Date(booking.journey_date).toLocaleDateString()}</TableCell>
                        <TableCell>{booking.seats_booked}</TableCell>
                        <TableCell>₹{booking.total_amount}</TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'cancelled' ? 'destructive' : 'secondary'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit('booking', booking)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete('booking', booking.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Manage database operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Optimize Tables
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-medium">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Buses:</span>
                    <span className="font-medium">{buses.filter(b => b.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Routes:</span>
                    <span className="font-medium">{routes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Bookings:</span>
                    <span className="font-medium">
                      {bookings.filter(b => 
                        new Date(b.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entity={selectedEntity}
        onSave={handleSave}
      />

      {/* Add Modal */}
      <AddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        entityType={selectedEntity?.type}
        onSave={handleSave}
      />
    </div>
  )
}

// Edit Modal Component
function EditModal({ isOpen, onClose, entity, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (entity) {
      setFormData({ ...entity })
    }
  }, [entity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!entity) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {entity.type}</DialogTitle>
          <DialogDescription>Make changes to the {entity.type} details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {entity.type === 'agent' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent_code">Agent Code</Label>
                  <Input
                    id="agent_code"
                    value={formData.agent_code || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name || ''}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    value={formData.business_type || ''}
                    onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate || ''}
                    onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.credit_limit || ''}
                    onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="current_balance">Current Balance (₹)</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    value={formData.current_balance || ''}
                    onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <Select 
                    value={formData.is_active ? 'true' : 'false'} 
                    onValueChange={(value) => setFormData({...formData, is_active: value === 'true'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {entity.type === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {entity.type === 'route' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route_name">Route Name</Label>
                  <Input
                    id="route_name"
                    value={formData.route_name || ''}
                    onChange={(e) => setFormData({...formData, route_name: e.target.value})}
                    placeholder="e.g., Bhubaneswar to Cuttack"
                  />
                </div>
                <div>
                  <Label htmlFor="origin_city">Origin City</Label>
                  <Input
                    id="origin_city"
                    value={formData.origin_city || ''}
                    onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                    placeholder="e.g., Bhubaneswar"
                  />
                </div>
                <div>
                  <Label htmlFor="destination_city">Destination City</Label>
                  <Input
                    id="destination_city"
                    value={formData.destination_city || ''}
                    onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                    placeholder="e.g., Cuttack"
                  />
                </div>
                <div>
                  <Label htmlFor="distance_km">Distance (km)</Label>
                  <Input
                    id="distance_km"
                    type="number"
                    value={formData.distance_km || ''}
                    onChange={(e) => setFormData({...formData, distance_km: e.target.value})}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_duration">Duration</Label>
                  <Input
                    id="estimated_duration"
                    value={formData.estimated_duration || ''}
                    onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
                    placeholder="e.g., 1 hour"
                  />
                </div>
                <div>
                  <Label htmlFor="base_fare">Base Fare (₹)</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    step="0.01"
                    value={formData.base_fare || ''}
                    onChange={(e) => setFormData({...formData, base_fare: e.target.value})}
                    placeholder="e.g., 50.00"
                  />
                </div>
              </div>
              
              {/* Operating Days Selection */}
              <div className="mt-4">
                <Label>Operating Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        checked={(formData.operating_days || []).includes(day)}
                        onChange={(e) => {
                          const currentDays = formData.operating_days || [];
                          const updatedDays = e.target.checked
                            ? [...currentDays, day]
                            : currentDays.filter((d: string) => d !== day);
                          setFormData({...formData, operating_days: updatedDays});
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`day-${day}`} className="text-sm capitalize cursor-pointer">
                        {day.slice(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the days when this route operates
                </p>
              </div>
            </>
          )}
          
          {entity.type === 'bus' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bus_number">Bus Number</Label>
                  <Input
                    id="bus_number"
                    value={formData.bus_number || ''}
                    onChange={(e) => setFormData({...formData, bus_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="bus_type">Bus Type</Label>
                  <Select value={formData.bus_type} onValueChange={(value) => setFormData({...formData, bus_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac">AC</SelectItem>
                      <SelectItem value="non_ac">Non-AC</SelectItem>
                      <SelectItem value="sleeper">Sleeper</SelectItem>
                      <SelectItem value="semi_sleeper">Semi Sleeper</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Bus Active Status Toggle */}
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bus_is_active"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="bus_is_active" className="text-sm cursor-pointer">
                    Bus is Active
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inactive buses will not be available for booking
                </p>
              </div>
            </>
          )}

          {/* Route Active Status Toggle */}
          {entity.type === 'route' && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="route_is_active"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="route_is_active" className="text-sm cursor-pointer">
                  Route is Active
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inactive routes will not be available for booking
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add Modal Component
function AddModal({ isOpen, onClose, entityType, onSave }: AddModalProps) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, type: entityType })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New {entityType}</DialogTitle>
          <DialogDescription>Create a new {entityType} entry</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {entityType === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {entityType === 'route' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route_name">Route Name</Label>
                  <Input
                    id="route_name"
                    value={formData.route_name || ''}
                    onChange={(e) => setFormData({...formData, route_name: e.target.value})}
                    placeholder="e.g., Bhubaneswar to Cuttack"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="origin_city">Origin City</Label>
                  <Input
                    id="origin_city"
                    value={formData.origin_city || ''}
                    onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                    placeholder="e.g., Bhubaneswar"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination_city">Destination City</Label>
                  <Input
                    id="destination_city"
                    value={formData.destination_city || ''}
                    onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                    placeholder="e.g., Cuttack"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="distance_km">Distance (km)</Label>
                  <Input
                    id="distance_km"
                    type="number"
                    value={formData.distance_km || ''}
                    onChange={(e) => setFormData({...formData, distance_km: e.target.value})}
                    placeholder="e.g., 30"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_duration">Duration</Label>
                  <Input
                    id="estimated_duration"
                    value={formData.estimated_duration || ''}
                    onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
                    placeholder="e.g., 1 hour"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="base_fare">Base Fare (₹)</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    step="0.01"
                    value={formData.base_fare || ''}
                    onChange={(e) => setFormData({...formData, base_fare: e.target.value})}
                    placeholder="e.g., 50.00"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {entityType === 'bus' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bus_number">Bus Number</Label>
                  <Input
                    id="bus_number"
                    value={formData.bus_number || ''}
                    onChange={(e) => setFormData({...formData, bus_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model/Name</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bus_type">Bus Type</Label>
                  <Select value={formData.bus_type} onValueChange={(value) => setFormData({...formData, bus_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac">AC</SelectItem>
                      <SelectItem value="non_ac">Non-AC</SelectItem>
                      <SelectItem value="sleeper">Sleeper</SelectItem>
                      <SelectItem value="semi_sleeper">Semi Sleeper</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {entityType === 'agent' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent_code">Agent Code</Label>
                  <Input
                    id="agent_code"
                    value={formData.agent_code || ''}
                    onChange={(e) => setFormData({...formData, agent_code: e.target.value})}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name || ''}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    value={formData.business_type || ''}
                    onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate || ''}
                    onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.credit_limit || ''}
                    onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="current_balance">Current Balance (₹)</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    value={formData.current_balance || ''}
                    onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <Select 
                    value={formData.is_active ? 'true' : 'false'} 
                    onValueChange={(value) => setFormData({...formData, is_active: value === 'true'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create {entityType}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
