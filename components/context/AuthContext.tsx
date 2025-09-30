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
      console.log('AuthContext: Fetching user profile for user:', userId)
      
      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: profile, error } = await db.getUserProfile(userId)
      if (error) {
        console.error('AuthContext: Error fetching user profile:', error)
        if (error.message?.includes('No API key found')) {
          console.error('AuthContext: API key issue - session may not be properly established')
          // Try to refresh the session
          const { session } = await auth.getSession()
          if (session) {
            console.log('AuthContext: Session exists, retrying profile fetch')
            // Retry once more
            const { data: retryProfile, error: retryError } = await db.getUserProfile(userId)
            if (!retryError && retryProfile) {
              setUserProfile(retryProfile)
              return
            }
          }
        }
        setUserProfile(null)
      } else if (profile) {
        console.log('AuthContext: User profile loaded successfully')
        setUserProfile(profile)
      } else {
        console.log('AuthContext: No user profile found for user:', userId)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('AuthContext: Exception fetching user profile:', error)
      setUserProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('AuthContext: Starting scalable direct sign-in process')
      const result = await auth.signIn(email, password)
      
      if (result.error) {
        console.error('AuthContext: Sign-in failed:', result.error)
        
        // Enhanced error handling with better user messages
        if (result.error.message?.includes('Invalid login credentials')) {
          result.error.message = 'Invalid email or password. Please check your credentials and try again.'
        } else if (result.error.message?.includes('Email not confirmed')) {
          result.error.message = 'Please verify your email address before signing in.'
        } else if (result.error.message?.includes('Too many requests')) {
          result.error.message = 'Too many login attempts. Please wait a few minutes and try again.'
        } else if (result.error.message?.includes('CORS') || (result.error as any).isCorsError) {
          result.error.message = 'Connection issue detected. Please ensure your Supabase Site URL is configured correctly for this domain.'
        } else if (result.error.message?.includes('deployment domain')) {
          result.error.message = 'Authentication service configuration issue. Please contact support.'
        }
      } else if (result.data?.user) {
        console.log('AuthContext: Sign-in successful for user:', result.data.user.id)
      }
      
      setLoading(false)
      return result
    } catch (error) {
      console.error('AuthContext: Sign-in exception:', error)
      setLoading(false)
      return { 
        data: null, 
        error: { 
          message: 'Authentication service unavailable. Please check your internet connection and try again.' 
        } 
      }
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
      console.log('AuthContext: Starting scalable direct sign-up process')
      
      // Use the scalable auth.signUp with direct Supabase client
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        console.error('AuthContext: Sign-up failed:', error)
        setLoading(false)
        return { data: null, error }
      }

      if (data?.user) {
        console.log('AuthContext: Sign-up successful for user:', data.user.id)
        
        // Create user profile after successful signup
        try {
          const { error: profileError } = await db.createUserProfile(data.user.id, {
            full_name: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: email,
            phone: userData.phone,
            role: 'customer'
          })

          if (profileError) {
            console.log('AuthContext: Profile creation failed:', profileError.message)
            // Don't fail the signup if profile creation fails
          } else {
            console.log('AuthContext: User profile created successfully')
          }
        } catch (profileError) {
          console.log('AuthContext: Profile creation exception:', profileError)
          // Don't fail signup for profile issues
        }
      }

      setLoading(false)
      return { data, error: null }
    } catch (error: any) {
      console.error('AuthContext: Sign-up exception:', error)
      setLoading(false)
      return { data: null, error: { message: error.message || 'Registration failed' } }
    }
  }

  const signOut = async () => {
    console.log('AuthContext: Starting PURE CLIENT-SIDE signOut (no server calls)')
    
    // Clear React state IMMEDIATELY
    setUser(null)
    setUserProfile(null)
    setSession(null)
    setLoading(true)
    
    try {
      // Use pure client-side signout (NO server calls = NO 403 errors)
      await auth.signOut()
      
      console.log('AuthContext: Pure client-side signOut completed')
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setLoading(false)
      
      // Force page reload to ensure complete cleanup and fresh state
      console.log('AuthContext: Forcing page reload for complete cleanup')
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      
      return { error: null }
      
    } catch (error) {
      console.log('AuthContext: SignOut exception (forcing cleanup anyway):', error)
      
      // Force cleanup even on exception
      setUser(null)
      setUserProfile(null)
      setSession(null)
      setLoading(false)
      
      // Force page reload even on error to ensure cleanup
      if (typeof window !== 'undefined') {
        console.log('AuthContext: Forcing page reload after error')
        window.location.reload()
      }
      
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
