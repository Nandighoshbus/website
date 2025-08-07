"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string, userData: { full_name: string; phone: string }) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await auth.signIn(email, password)
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; phone: string }) => {
    setLoading(true)
    const result = await auth.signUp(email, password, userData)
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('Starting signOut process...')
      
      // Clear local state immediately to prevent UI issues
      setUser(null)
      setSession(null)
      
      const result = await auth.signOut()
      
      if (result.error) {
        console.error('SignOut error:', result.error)
        // Even if there's an error, we've already cleared local state
        // This ensures the user appears signed out in the UI
      } else {
        console.log('SignOut successful')
      }
      
      setLoading(false)
      return result
    } catch (error) {
      console.error('SignOut catch error:', error)
      // Ensure local state is cleared even if there's an error
      setUser(null)
      setSession(null)
      setLoading(false)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    const result = await auth.resetPassword(email)
    return result
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
