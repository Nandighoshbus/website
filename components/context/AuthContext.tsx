"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth, db } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  is_active: boolean
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string, userData: { 
    full_name: string; 
    first_name?: string; 
    last_name?: string; 
    phone: string 
  }) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session from server only
    const getInitialSession = async () => {
      try {
        const { session } = await auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        // Profile fetch in background (optional, non-blocking)
        if (session?.user) {
          fetchUserProfile(session.user.id).catch(err => {
            console.log('Profile fetch failed (non-critical):', err)
          })
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
    
    // No client-side auth state listening
  }, [])

  // Fetch user profile from user_profiles table (optional, non-blocking)
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await db.getUserProfile(userId)
      if (error) {
        console.log('Profile fetch error (non-critical):', error)
        setUserProfile(null)
      } else if (profile) {
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    } catch (error) {
      console.log('Profile fetch exception (non-critical):', error)
      setUserProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await auth.signIn(email, password)
      
      // Manually update state after server-side sign-in
      if (result.data?.user) {
        setUser(result.data.user)
        setSession(result.data.session)
        
        // Profile fetch in background
        fetchUserProfile(result.data.user.id).catch(err => {
          console.log('Profile fetch failed (non-critical):', err)
        })
      }
      
      setLoading(false)
      return result
    } catch (error) {
      console.error('AuthContext: Sign-in exception:', error)
      setLoading(false)
      return { data: null, error: { message: 'Sign-in failed' } }
    }
  }

  const signUp = async (email: string, password: string, userData: { 
    full_name: string; 
    first_name?: string; 
    last_name?: string; 
    phone: string 
  }) => {
    setLoading(true)
    try {
      // Sign-up only verifies email/password through Supabase auth
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        setLoading(false)
        return { data: null, error }
      }

      // Profile creation is optional and non-blocking
      if (data?.user) {
        db.createUserProfile(data.user.id, {
          full_name: userData.full_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: email,
          phone: userData.phone,
          role: 'customer'
        }).catch(profileError => {
          console.log('Profile creation failed (non-critical):', profileError)
        })
      }

      setLoading(false)
      return { data, error: null }
    } catch (error: any) {
      setLoading(false)
      return { data: null, error: { message: error.message || 'Registration failed' } }
    }
  }

  const signOut = async () => {
    console.log('AuthContext: Starting sign-out')
    setLoading(true)
    
    // Clear state immediately (optimistic update)
    setUser(null)
    setUserProfile(null)
    setSession(null)
    
    try {
      // Call server-side sign-out
      await auth.signOut()
      console.log('AuthContext: Sign-out complete')
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('AuthContext: Sign-out error (non-critical):', error)
      setLoading(false)
      // Always return success - state already cleared
      return { error: null }
    }
  }

  const resetPassword = async (email: string) => {
    const result = await auth.resetPassword(email)
    return result
  }

  const value: AuthContextType = {
    user,
    userProfile,
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
