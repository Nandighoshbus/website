import { createClient } from '@supabase/supabase-js'

// Simple environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase client for database queries only (NO client-side auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false
  }
})

// Server-side only authentication functions
export const auth = {
  // Server-side sign-up (no client fallback)
  signUp: async (email: string, password: string, userData: { full_name: string, first_name?: string, last_name?: string, phone: string }) => {
    console.log('Auth: Starting server-side sign-up')
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userData: {
            full_name: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone
          }
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log('Auth: Server-side sign-up successful')
        return result
      } else {
        console.error('Auth: Server-side sign-up failed:', result)
        return { data: null, error: result.error || { message: 'Sign-up failed' } }
      }
    } catch (error: any) {
      console.error('Auth: Server-side sign-up error:', error)
      return { data: null, error: { message: error.message || 'Sign-up failed' } }
    }
  },

  // Server-side sign-in (no client auth)
  signIn: async (email: string, password: string) => {
    console.log('Auth: Starting server-side sign-in')
    console.log('Auth: Calling /api/auth/signin')
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Auth: Response status:', response.status)

      if (!response.ok) {
        const result = await response.json()
        console.error('Auth: Sign-in failed with status', response.status, ':', result)
        return { data: null, error: result.error || { message: 'Invalid credentials' } }
      }

      const result = await response.json()
      console.log('Auth: Sign-in successful')
      return result
    } catch (error: any) {
      console.error('Auth: Network error during sign-in:', error)
      return { 
        data: null, 
        error: { 
          message: 'Network error - check if dev server is running and API routes are accessible',
          details: error.message 
        } 
      }
    }
  },

  // Server-side sign-out only
  signOut: async () => {
    console.log('Auth: Server-side sign-out - clearing all auth data')
    
    try {
      // Clear all possible localStorage keys
      if (typeof window !== 'undefined') {
        // Get token before clearing (if exists)
        const token = localStorage.getItem('nandighosh-auth-token')
        
        // Call server-side sign-out if token exists
        if (token) {
          try {
            await fetch('/api/auth/signout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken: token }),
            })
          } catch (e) {
            console.log('Server-side signout call failed (non-critical):', e)
          }
        }
        
        // Clear all auth-related localStorage keys
        localStorage.removeItem('nandighosh-auth-token')
        localStorage.removeItem('nandighosh-user')
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
        
        // Clear all keys that might be related to auth
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        console.log('Auth: All localStorage cleared')
      }
      
      return { error: null }
    } catch (error: any) {
      console.error('Auth: Sign-out error:', error)
      // Always return success for sign-out
      return { error: null }
    }
  },

  // Server-side session check
  getSession: async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        return result
      }
      
      return { session: null, error: { message: 'No session' } }
    } catch (error: any) {
      return { session: null, error: { message: error.message || 'Session check failed' } }
    }
  },

  // Placeholder for compatibility (not used)
  getCurrentUser: async () => {
    console.warn('getCurrentUser called - use server-side session instead')
    return { user: null, error: { message: 'Use server-side auth' } }
  },

  // Placeholder for compatibility (not used)
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    console.warn('onAuthStateChange called - not supported in server-side only mode')
    return { data: { subscription: { unsubscribe: () => {} } } }
  },

  // Server-side password reset
  resetPassword: async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Password reset failed' } }
    }
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

  // Get user profile (server-side auth only)
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) {
        console.log('getUserProfile error:', error)
      }
      
      return { data, error }
    } catch (error: any) {
      console.log('getUserProfile exception:', error)
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
