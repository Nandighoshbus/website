'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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
        
        // Get current Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('AgentAuthContext: Found session:', session.user)
          
          // Check if user has agent role
          const userRole = session.user.user_metadata?.role
          console.log('AgentAuthContext: User role:', userRole)
          
          if (userRole === 'agent') {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              is_active: true
            }
            console.log('AgentAuthContext: Setting user:', userData)
            setUser(userData)
          } else {
            console.log('AgentAuthContext: Invalid user role, logging out')
            await supabase.auth.signOut()
            setUser(null)
          }
        } else {
          console.log('AgentAuthContext: No session found')
          setUser(null)
        }
      } catch (error) {
        console.error('AgentAuthContext: Error checking auth:', error)
        await supabase.auth.signOut()
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
      
      // Use Supabase for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error || !data.user) {
        console.error('AgentAuthContext: Login failed:', error?.message)
        return { success: false, error: error?.message || 'Login failed' }
      }
      
      // Check if user has agent role
      const userRole = data.user.user_metadata?.role
      console.log('AgentAuthContext: User role after login:', userRole)
      
      if (userRole === 'agent') {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: userRole,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          is_active: true
        }
        console.log('AgentAuthContext: Setting user:', userData)
        setUser(userData)
        return { success: true }
      } else {
        console.error('AgentAuthContext: User does not have agent role:', userRole)
        await supabase.auth.signOut()
        return { success: false, error: 'Access denied. This account does not have agent privileges.' }
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
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('AgentAuthContext: Logout error:', error)
    }
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
