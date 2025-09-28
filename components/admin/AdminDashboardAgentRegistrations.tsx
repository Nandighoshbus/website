'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Clock, User, Phone, Mail, Eye, UserCheck, UserX, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// TypeScript interfaces
interface AgentRegistration {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  experience_years: number | null
  branch_location: string
  custom_branch?: string
  emergency_contact: string
  expected_joining_date: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  email_verified: boolean
  created_at: string
  reviewed_at?: string
  admin_notes?: string
  rejection_reason?: string
}

interface AdminDashboardAgentRegistrationsProps {
  userRole?: string
}

const AdminDashboardAgentRegistrations: React.FC<AdminDashboardAgentRegistrationsProps> = ({ 
  userRole = 'admin' 
}) => {
  const [registrations, setRegistrations] = useState<AgentRegistration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<AgentRegistration | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for development
  const mockRegistrations: AgentRegistration[] = [
    {
      id: '1',
      full_name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91-1234567890',
      address: 'Bhubaneswar, Odisha',
      experience_years: 5,
      branch_location: 'Bhubaneswar',
      emergency_contact: '+91-1234567891',
      expected_joining_date: '2025-09-01',
      status: 'pending',
      email_verified: true,
      created_at: '2025-08-09T10:30:00Z'
    },
    {
      id: '2',
      full_name: 'Priya Sahoo',
      email: 'priya.sahoo@email.com',
      phone: '+91-8765432109',
      address: 'Cuttack, Odisha',
      experience_years: 3,
      branch_location: 'Cuttack',
      emergency_contact: '+91-8765432110',
      expected_joining_date: '2025-09-15',
      status: 'pending',
      email_verified: false,
      created_at: '2025-08-08T15:45:00Z'
    }
  ]

  // Fetch registrations data
  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No admin session found')
        setRegistrations(mockRegistrations)
        return
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      const response = await fetch(`${baseURL}/api/v1/agents/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations || [])
      } else {
        console.error('Failed to fetch registrations:', response.status, response.statusText)
        setRegistrations(mockRegistrations)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations(mockRegistrations)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchRegistrations()
  }, [])

  // Handle registration action (approve/reject)
  const handleRegistrationAction = async (action: 'approve' | 'reject') => {
    if (!selectedRegistration) return

    try {
      setActionLoading(true)
      
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Admin session expired. Please login again.')
        return
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      const endpoint = action === 'approve' 
        ? `${baseURL}/api/v1/agents/approve/${selectedRegistration.id}`
        : `${baseURL}/api/v1/agents/reject/${selectedRegistration.id}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes.trim() || undefined,
          reason: action === 'reject' ? rejectionReason : undefined
        })
      })

      if (response.ok) {
        setRegistrations(prevRegs => 
          prevRegs.map(reg => 
            reg.id === selectedRegistration.id 
              ? { 
                  ...reg, 
                  status: action === 'approve' ? 'approved' : 'rejected',
                  reviewedAt: new Date().toISOString(),
                  adminNotes: adminNotes.trim() || undefined,
                  rejectionReason: action === 'reject' ? rejectionReason : undefined
                }
              : reg
          )
        )
        
        setIsActionModalOpen(false)
        setIsDetailModalOpen(false)
        setSelectedRegistration(null)
        setAdminNotes('')
        setRejectionReason('')
        
        alert(`Registration ${action}d successfully!`)
        fetchRegistrations()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to ${action} registration`)
      }
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error)
      alert(`Error ${action}ing registration. Please try again.`)
    } finally {
      setActionLoading(false)
    }
  }

  // Open action modal
  const openActionModal = (registration: AgentRegistration, action: 'approve' | 'reject') => {
    setSelectedRegistration(registration)
    setActionType(action)
    setIsActionModalOpen(true)
  }

  // View registration details
  const viewDetails = (registration: AgentRegistration) => {
    setSelectedRegistration(registration)
    setIsDetailModalOpen(true)
  }

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Mail }
    }
    
    const variant = variants[status as keyof typeof variants] || variants.pending
    const Icon = variant.icon
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent registrations...</p>
        </div>
      </div>
    )
  }

  const filteredRegistrations = registrations.filter(reg => 
    reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 mr-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations.length}</p>
                <p className="text-sm text-gray-600">Total Registrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 mr-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'approved').length}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500 mr-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'under_review').length}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Agent Registration Requests
              </CardTitle>
              <CardDescription>
                Review and manage agent applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Registrations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Details</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No agent registrations found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{registration.full_name}</p>
                          <p className="text-sm text-gray-600">{registration.experience_years ? `${registration.experience_years} years experience` : 'No experience specified'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{registration.email}</p>
                          <p className="text-gray-600">{registration.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={registration.status} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(registration.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewDetails(registration)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {registration.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openActionModal(registration, 'approve')}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openActionModal(registration, 'reject')}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Registration Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedRegistration?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="mt-1">{selectedRegistration.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1">{selectedRegistration.email}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="mt-1">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="mt-1">{selectedRegistration.address}</p>
                </div>
                <div>
                  <Label>Branch Location</Label>
                  <p className="mt-1">{selectedRegistration.branch_location}</p>
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  <p className="mt-1">{selectedRegistration.emergency_contact}</p>
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  <p className="mt-1">{selectedRegistration.experience_years || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Expected Joining Date</Label>
                  <p className="mt-1">{new Date(selectedRegistration.expected_joining_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Email Verified</Label>
                  <p className="mt-1">{selectedRegistration.email_verified ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label>Status:</Label>
                <StatusBadge status={selectedRegistration.status} />
              </div>
              
              {selectedRegistration.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{selectedRegistration.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Approve ${selectedRegistration?.full_name}'s registration?`
                : `Reject ${selectedRegistration?.full_name}'s registration?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'reject' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Select onValueChange={setRejectionReason} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incomplete_documents">Incomplete Documents</SelectItem>
                    <SelectItem value="invalid_license">Invalid License</SelectItem>
                    <SelectItem value="insufficient_experience">Insufficient Experience</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="adminNotes">Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleRegistrationAction(actionType!)}
              disabled={actionLoading || (actionType === 'reject' && !rejectionReason)}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboardAgentRegistrations