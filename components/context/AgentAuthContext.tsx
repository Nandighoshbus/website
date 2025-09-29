'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { jwtAuth } from '@/lib/jwtAuth'

interface User {
  id: string
  email: string
  role: string
  full_name?: string
  is_active: boolean
}

interface AgentAuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined)

export function AgentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AgentAuthContext: Checking authentication...')
        
        // Use the new async authentication check with automatic token refresh
        const isAuthenticated = await jwtAuth.isAuthenticatedAsync('agent')
        
        if (isAuthenticated) {
          const userData = jwtAuth.getUser('agent')
          console.log('AgentAuthContext: Found user data:', userData)
          
          if (userData && userData.role === 'agent') {
            console.log('AgentAuthContext: User is valid agent, setting user state')
            setUser(userData)
          } else {
            console.log('AgentAuthContext: Invalid user role, logging out')
            jwtAuth.logout('agent')
            setUser(null)
          }
        } else {
          console.log('AgentAuthContext: No valid authentication found (token expired or refresh failed)')
          setUser(null)
        }
      } catch (error) {
        console.error('AgentAuthContext: Error checking auth:', error)
        jwtAuth.logout('agent')
        setUser(null)
      } finally {
        console.log('AgentAuthContext: Authentication check complete')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('AgentAuthContext: Starting login for:', email)
      
      const result = await jwtAuth.agentLogin(email, password)
      console.log('AgentAuthContext: Login result:', result)
      
      if (result.success && result.data) {
        console.log('AgentAuthContext: Setting user:', result.data.user)
        setUser(result.data.user)
        return result
      } else {
        console.error('AgentAuthContext: Login failed:', result.message || result.error)
        setUser(null)
        return { success: false, error: result.message || result.error || 'Login failed' }
      }
    } catch (error: any) {
      console.error('AgentAuthContext: Login error:', error)
      setUser(null)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    console.log('AgentAuthContext: Logging out')
    setUser(null)
    jwtAuth.logout('agent')
  }, [])

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('AgentAuthContext: Refreshing token')
    try {
      const refreshed = await jwtAuth.refreshToken('agent')
      if (refreshed) {
        // Update user data after successful refresh
        const userData = jwtAuth.getUser('agent')
        if (userData) {
          setUser(userData)
        }
        console.log('AgentAuthContext: Token refresh successful')
        return true
      } else {
        console.log('AgentAuthContext: Token refresh failed, logging out')
        setUser(null)
        return false
      }
    } catch (error) {
      console.error('AgentAuthContext: Token refresh error:', error)
      setUser(null)
      return false
    }
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken
  }

  return (
    <AgentAuthContext.Provider value={value}>
      {children}
    </AgentAuthContext.Provider>
  )
}

export function useAgentAuth() {
  const context = useContext(AgentAuthContext)
  if (context === undefined) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider')
  }
  return context
}
