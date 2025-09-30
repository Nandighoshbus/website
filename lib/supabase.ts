import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables:')
  console.error('Current environment:', process.env.NODE_ENV)
  console.error('Current domain:', typeof window !== 'undefined' ? window.location.origin : 'Server-side')
  
  if (typeof window !== 'undefined') {
    // Show user-friendly error in browser with deployment info
    const currentDomain = window.location.origin
    alert(`Application configuration error on ${currentDomain}. Please ensure environment variables are set in Render dashboard.`)
  }
  
  throw new Error('Missing required Supabase environment variables. Please configure in Render dashboard.')
}

// Create Supabase client for frontend with proper CORS handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'nandighosh-auth-token',
    // Use implicit flow for password-based authentication (PKCE is for OAuth)
    flowType: 'implicit'
  },
  global: {
    headers: {
      'X-Client-Info': 'nandighosh-bus@1.0.0',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  },
  db: {
    schema: 'public'
  }
})

// Runtime check for production usage
const checkSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is invalid')
  }
}

// Authentication helper functions
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: { full_name: string, phone: string }) => {
    checkSupabaseConfig()
    
    // Try signup without metadata first to avoid trigger issues
    const { data, error } = await supabase.auth.signUp({
      email,
      password
      // Removed options.data to avoid database trigger failures
    })
    return { data, error }
  },

  // Sign in user with enhanced CORS error handling
  signIn: async (email: string, password: string) => {
    checkSupabaseConfig()
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        // Enhanced CORS error detection
        const isCorsError = error.message?.includes('NetworkError') || 
                           error.message?.includes('CORS') || 
                           error.message?.includes('fetch') ||
                           error.message?.includes('Failed to fetch') ||
                           (error as any).status === 0
        
        if (isCorsError) {
          return {
            data: null,
            error: {
              message: 'Connection failed. Please ensure your deployment domain is configured in Supabase settings. Contact support if this persists.',
              isCorsError: true,
              __isAuthError: true,
              name: 'AuthRetryableFetchError',
              status: 0
            }
          }
        }
        
        // Handle other Supabase errors
        if (error.message?.includes('Invalid login credentials')) {
          return {
            data: null,
            error: {
              message: 'Invalid email or password. Please check your credentials and try again.',
              __isAuthError: true
            }
          }
        }
        
        if (error.message?.includes('Email not confirmed')) {
          return {
            data: null,
            error: {
              message: 'Please verify your email address before signing in.',
              __isAuthError: true
            }
          }
        }
        
        return { data, error }
      }
      
      if (data?.user) {
        return { data, error: null }
      }
      
    } catch (authError: any) {
      // Enhanced network error detection
      const isNetworkError = authError.name === 'TypeError' ||
                            authError.message?.includes('NetworkError') ||
                            authError.message?.includes('CORS') ||
                            authError.message?.includes('Failed to fetch')
      
      if (isNetworkError) {
        return {
          data: null,
          error: {
            message: 'Connection failed. Please ensure your deployment domain is configured in Supabase settings. Contact support if this persists.',
            isCorsError: true,
            __isAuthError: true,
            name: 'AuthRetryableFetchError',
            status: 0
          }
        }
      }
      
      return {
        data: null,
        error: {
          message: authError.message || 'Authentication service unavailable',
          __isAuthError: true
        }
      }
    }
    
    // Fallback error
    return {
      data: null,
      error: {
        message: 'Authentication failed for unknown reason',
        __isAuthError: true
      }
    }
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

  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
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
