import { createClient } from '@supabase/supabase-js'

// Simple environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Simple Supabase client - no complex configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nandighosh-auth-token'
  }
})

// Simple authentication functions
export const auth = {
  // Simple sign-up
  signUp: async (email: string, password: string, userData: { full_name: string, first_name?: string, last_name?: string, phone: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone
        }
      }
    })
    
    return { data, error }
  },

  // Simple sign-in
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  },

  // Simple sign-out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }
}

// Database helper functions
export const db = {
  // Create user profile after signup - matches signup form exactly
  createUserProfile: async (userId: string, profileData: {
    full_name?: string
    first_name?: string
    last_name?: string
    email: string
    phone: string
    role?: string
  }) => {
    // Use provided first/last names or split full_name
    const firstName = profileData.first_name || (profileData.full_name ? profileData.full_name.trim().split(' ')[0] : '') || null
    const lastName = profileData.last_name || (profileData.full_name ? profileData.full_name.trim().split(' ').slice(1).join(' ') : '') || null
    const fullName = profileData.full_name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) || null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        email: profileData.email || null,
        phone: profileData.phone || null,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: profileData.role || 'customer',
        is_verified: false,
        is_active: true,
        preferences: {},
        // Explicitly set unused fields to NULL
        date_of_birth: null,
        gender: null,
        avatar_url: null,
        address: null,
        emergency_contact: null
      }])
      .select()
    return { data, error }
  },

  // Get user profile with proper authentication
  getUserProfile: async (userId: string) => {
    try {
      // Ensure we have a valid session before making the request
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No active session for getUserProfile')
        return { data: null, error: { message: 'No active session' } }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('getUserProfile error:', error)
      }
      
      return { data, error }
    } catch (error: any) {
      console.error('getUserProfile exception:', error)
      return { data: null, error: { message: error.message || 'Failed to fetch user profile' } }
    }
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
