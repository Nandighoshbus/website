'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { jwtAuth, User } from '@/lib/jwtAuth'

interface AgentAuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined)

export function AgentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (jwtAuth.isAuthenticated('agent')) {
          const userData = jwtAuth.getUser('agent')
          if (userData && userData.role === 'agent') {
            setUser(userData)
          } else {
            jwtAuth.logout('agent')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        jwtAuth.logout('agent')
        setUser(null)
      } finally {
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
      
      if (result.success && result.data) {
        setUser(result.data.user)
        return { success: true }
      } else {
        setUser(null)
        return { success: false, error: result.message || 'Login failed' }
      }
    } catch (error: any) {
      setUser(null)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    jwtAuth.logout('agent')
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
