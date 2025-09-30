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

// Create Supabase client with CORS-friendly configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'nandighosh-auth-token',
    // Use pkce flow for better CORS compatibility
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'X-Client-Info': 'nandighosh-bus@1.0.0',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
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
  // Scalable sign-up: Direct Supabase client with enhanced error handling
  signUp: async (email: string, password: string, userData: { full_name: string, first_name?: string, last_name?: string, phone: string }) => {
    checkSupabaseConfig()
    
    console.log('Auth: Starting scalable direct sign-up')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone
          }
        }
      })
      
      if (error) {
        console.error('Auth: Sign-up error:', error)
        
        // Enhanced error handling
        if (error.message?.includes('User already registered')) {
          return {
            data: null,
            error: {
              message: 'An account with this email already exists. Please sign in instead.',
              __isAuthError: true
            }
          }
        }
        
        if (error.message?.includes('Password should be')) {
          return {
            data: null,
            error: {
              message: 'Password must be at least 6 characters long.',
              __isAuthError: true
            }
          }
        }
        
        if (error.message?.includes('Invalid email')) {
          return {
            data: null,
            error: {
              message: 'Please enter a valid email address.',
              __isAuthError: true
            }
          }
        }
        
        return { data, error }
      }
      
      if (data?.user) {
        console.log('Auth: Direct sign-up successful for user:', data.user.id)
      }
      
      return { data, error }
    } catch (signupError: any) {
      console.error('Auth: Sign-up exception:', signupError)
      return {
        data: null,
        error: {
          message: signupError.message || 'Registration failed',
          __isAuthError: true
        }
      }
    }
  },

  // CORS-friendly sign-in with fallback to server-side proxy
  signIn: async (email: string, password: string) => {
    checkSupabaseConfig()
    
    console.log('Auth: Starting CORS-friendly authentication with fallback')
    
    // STRATEGY 1: Try server-side proxy first (bypasses CORS completely)
    try {
      console.log('Auth: Trying server-side proxy authentication')
      const proxyResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      if (proxyResponse.ok) {
        const result = await proxyResponse.json()
        console.log('Auth: Server-side proxy authentication successful')
        return result
      } else {
        const errorResult = await proxyResponse.json()
        console.log('Auth: Server-side proxy failed, trying direct client:', errorResult.error)
      }
    } catch (proxyError: any) {
      console.log('Auth: Server-side proxy error, trying direct client:', proxyError.message)
    }
    
    // STRATEGY 2: Try direct Supabase client (may have CORS issues)
    try {
      console.log('Auth: Trying direct Supabase client authentication')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Auth: Direct client sign-in error:', error)
        
        // Enhanced error handling with specific messages
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
        
        // CORS errors - provide specific guidance
        const isCorsError = error.message?.includes('NetworkError') || 
                           error.message?.includes('CORS') || 
                           error.message?.includes('fetch') ||
                           error.message?.includes('Failed to fetch') ||
                           (error as any).status === 0
        
        if (isCorsError) {
          const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
          return {
            data: null,
            error: {
              message: `CORS Error: Please configure Supabase Site URL to: ${currentDomain}\n\nSteps:\n1. Go to Supabase Dashboard\n2. Settings → Authentication → URL Configuration\n3. Set Site URL to: ${currentDomain}\n4. Add to Redirect URLs: ${currentDomain}/**`,
              isCorsError: true,
              __isAuthError: true,
              name: 'AuthRetryableFetchError',
              status: 0
            }
          }
        }
        
        return { data, error }
      }
      
      if (data?.user) {
        console.log('Auth: Direct authentication successful for user:', data.user.id)
        return { data, error: null }
      }
      
    } catch (authError: any) {
      console.error('Auth: Direct authentication exception:', authError)
      
      // Enhanced network error detection
      const isNetworkError = authError.name === 'TypeError' ||
                            authError.message?.includes('NetworkError') ||
                            authError.message?.includes('CORS') ||
                            authError.message?.includes('Failed to fetch')
      
      if (isNetworkError) {
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'unknown'
        return {
          data: null,
          error: {
            message: `Network/CORS Error: Configure Supabase Site URL to: ${currentDomain}\n\nBoth server-side proxy and direct client failed. This is likely a CORS configuration issue.`,
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
        message: 'All authentication methods failed. Please contact support.',
        __isAuthError: true
      }
    }
  },

  // Pure client-side signout - NO server calls to avoid 403 errors
  signOut: async () => {
    console.log('Auth: Starting pure client-side signout (no server calls)')
    
    try {
      // STEP 1: Force complete local storage cleanup
      if (typeof window !== 'undefined') {
        console.log('Auth: Clearing all authentication storage')
        
        // Clear specific auth keys first
        const authKeys = [
          'nandighosh-auth-token',
          'supabase.auth.token',
          'sb-lcxmwghgehhrabhaqgxl-auth-token',
          'sb-auth-token'
        ]
        
        authKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
            console.log(`Auth: Cleared localStorage key: ${key}`)
          }
        })
        
        // Clear any remaining auth-related keys
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
            localStorage.removeItem(key)
            console.log(`Auth: Cleared additional key: ${key}`)
          }
        })
        
        // Clear sessionStorage completely
        sessionStorage.clear()
        console.log('Auth: Cleared sessionStorage')
        
        // Clear any cookies (if any)
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            console.log(`Auth: Cleared cookie: ${name}`)
          }
        })
      }
      
      // STEP 2: Reset Supabase client internal state (without server call)
      try {
        // Force the client to forget the current session internally
        // This is a hack but it works without server calls
        if (supabase?.auth) {
          // Clear the internal session state
          try {
            (supabase.auth as any)._currentSession = null;
            (supabase.auth as any)._currentUser = null;
          } catch (stateError) {
            console.log('Auth: Internal state reset failed (continuing)')
          }
        }
        console.log('Auth: Reset Supabase client internal state')
      } catch (clientError) {
        console.log('Auth: Client state reset not needed or failed (continuing)')
      }
      
      console.log('Auth: Pure client-side signout completed successfully')
      return { error: null }
      
    } catch (error: any) {
      console.log('Auth: Client-side signout error (but continuing):', error.message)
      // Always return success - we did our best to clean up
      return { error: null }
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
