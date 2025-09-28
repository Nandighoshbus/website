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
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      // If user exists, fetch their profile from user_profiles table
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event)
      setSession(session)
      setUser(session?.user ?? null)
      
      // If user exists, fetch their profile
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await db.getUserProfile(userId)
      if (error) {
        console.error('AuthContext: Error fetching user profile:', error)
      } else {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await auth.signIn(email, password)
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, userData: { 
    full_name: string; 
    first_name?: string; 
    last_name?: string; 
    phone: string 
  }) => {
    setLoading(true)
    try {
      // First create user in Supabase Auth
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        setLoading(false)
        return { data: null, error }
      }

      if (data?.user) {
        // Create user profile in user_profiles table with separate first/last names
        const { error: profileError } = await db.createUserProfile(data.user.id, {
          full_name: userData.full_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: email,
          phone: userData.phone,
          role: 'customer'
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't fail the signup if profile creation fails
        }
      }

      setLoading(false)
      return { data, error: null }
    } catch (error: any) {
      setLoading(false)
      return { data: null, error: { message: error.message || 'Registration failed' } }
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('Starting signOut process...')
      
      // Clear local state immediately to prevent UI issues
      setUser(null)
      setUserProfile(null)
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
      setUserProfile(null)
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
