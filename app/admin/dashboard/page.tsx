'use client'

import { AdminAuthProvider, withAdminAuth } from '@/components/context/AdminAuthContext'
import AdminDashboard from '@/components/pages/AdminDashboard'

// Protect the AdminDashboard with authentication
const ProtectedAdminDashboard = withAdminAuth(AdminDashboard, ['admin', 'super_admin'])

export default function AdminDashboardPage() {
  return (
    <AdminAuthProvider>
      <ProtectedAdminDashboard />
    </AdminAuthProvider>
  )
}
