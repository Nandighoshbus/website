import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Authentication helper functions
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: { full_name: string, phone: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
          role: 'passenger'
        }
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    try {
      // First check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No active session to sign out from')
        // Still return success since user is already signed out
        return { error: null }
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        // Check if it's the "Auth session missing" error
        if (error.message?.includes('Auth session missing')) {
          console.log('Session already cleared, treating as successful signout')
          return { error: null }
        }
        console.error('Supabase signOut error:', error)
        return { error }
      }
      
      console.log('Successfully signed out')
      return { error: null }
    } catch (error) {
      console.error('SignOut catch error:', error)
      // If it's a session missing error, treat it as success
      if (error && typeof error === 'object' && 'message' in error) {
        if ((error as any).message?.includes('Auth session missing')) {
          console.log('Session missing error caught, treating as successful signout')
          return { error: null }
        }
      }
      return { error }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }
}

// Database helper functions
export const db = {
  // Create user profile after signup
  createUserProfile: async (userId: string, profileData: {
    full_name: string
    email: string
    phone: string
    role?: string
  }) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role || 'passenger'
      }])
      .select()
    return { data, error }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  // Get routes
  getRoutes: async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)
    return { data, error }
  },

  // Search routes
  searchRoutes: async (source: string, destination: string) => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .ilike('source_city', `%${source}%`)
      .ilike('destination_city', `%${destination}%`)
      .eq('is_active', true)
    return { data, error }
  }
}
