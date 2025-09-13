'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { jwtAuth, User } from '@/lib/jwtAuth'

interface AdminAuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AdminAuthContext: Checking authentication...')
        
        if (jwtAuth.isAuthenticated('admin')) {
          const userData = jwtAuth.getUser('admin')
          console.log('AdminAuthContext: Found user data:', userData)
          
          if (userData && ['admin', 'super_admin'].includes(userData.role)) {
            console.log('AdminAuthContext: User is valid admin, setting user state')
            setUser(userData)
          } else {
            console.log('AdminAuthContext: Invalid user role, logging out')
            jwtAuth.logout('admin')
            setUser(null)
          }
        } else {
          console.log('AdminAuthContext: No authentication found')
          setUser(null)
        }
      } catch (error) {
        console.error('AdminAuthContext: Error checking auth:', error)
        jwtAuth.logout('admin')
        setUser(null)
      } finally {
        console.log('AdminAuthContext: Authentication check complete, setting loading to false')
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await jwtAuth.adminLogin(email, password)
      console.log('AdminAuthContext: Login result:', result)
      
      if (result.success && result.data) {
        console.log('AdminAuthContext: Setting user:', result.data.user)
        setUser(result.data.user)
        return result
      } else {
        console.error('AdminAuthContext: Login failed:', result.message || result.error)
        const errorMessage = result.message || result.error || 'Login failed'
        if (result.retryAfter) {
          throw new Error(`${errorMessage}. Please try again in ${Math.ceil(result.retryAfter / 60)} minutes.`)
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('AdminAuthContext: Login error:', error)
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    jwtAuth.logout('admin')
    setUser(null)
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
