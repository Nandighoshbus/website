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
import { AlertCircle, CheckCircle, Edit, Plus, Trash2, Users, Bus, MapPin, Calendar, CreditCard, UserCheck } from 'lucide-react'
import AdminDashboardAgentRegistrations from '@/components/admin/AdminDashboardAgentRegistrations'
import { useAdminAuth } from '@/components/context/AdminAuthContext'

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
  is_active: boolean;
  created_at: string;
}

interface BookingData {
  id: string;
  booking_reference: string;
  passenger_name: string;
  route_name: string;
  journey_date: string;
  seats_booked: number;
  total_amount: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  created_at: string;
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
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Use the scalable authentication context
  const { user: currentUser, isLoading: authLoading, logout } = useAdminAuth()

  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchAllData()
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

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken') // Updated to use adminToken
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, busesRes, routesRes, bookingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/users`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/buses`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/routes`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/bookings`, { headers })
      ])

      if (usersRes.ok) setUsers((await usersRes.json()).data || [])
      if (busesRes.ok) setBuses((await busesRes.json()).data || [])
      if (routesRes.ok) setRoutes((await routesRes.json()).data || [])
      if (bookingsRes.ok) setBookings((await bookingsRes.json()).data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/${type}s/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchAllData() // Refresh data
        alert(`${type} deleted successfully`)
      } else {
        alert(`Failed to delete ${type}`)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      alert(`Error deleting ${type}`)
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

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('adminToken')
      const isEdit = data.id
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/${data.type}s/${data.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/admin/${data.type}s`

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        fetchAllData()
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
          <TabsList className="grid w-full grid-cols-7 lg:w-[700px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agents">Agent Requests</TabsTrigger>
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Users" 
                value={users.length} 
                icon={Users} 
                color="blue" 
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

          {/* Agent Requests Tab */}
          <TabsContent value="agents" className="space-y-6">
            <AdminDashboardAgentRegistrations userRole={currentUser?.role || 'admin'} />
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
                      <TableHead>Route Name</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.route_name}</TableCell>
                        <TableCell>{route.origin_city}</TableCell>
                        <TableCell>{route.destination_city}</TableCell>
                        <TableCell>{route.distance_km} km</TableCell>
                        <TableCell>{route.estimated_duration}</TableCell>
                        <TableCell>
                          <Badge variant={route.is_active ? 'default' : 'secondary'}>
                            {route.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit('route', route)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete('route', route.id)}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create {entityType}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
