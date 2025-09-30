import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Debug logging
    console.log('=== Sign-In API Route Called ===')
    console.log('Supabase URL:', supabaseUrl ? 'Set ✓' : 'Missing ✗')
    console.log('Service Key:', supabaseServiceKey ? 'Set ✓' : 'Missing ✗')
    
    const { email, password } = await request.json()
    console.log('Sign-in attempt for email:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    // Check if environment variables are present
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables!')
      return NextResponse.json(
        { error: { message: 'Server configuration error - missing credentials' } },
        { status: 500 }
      )
    }

    // Create admin client for server-side authentication
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('Supabase admin client created')

    // Sign in using admin client
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Server-side sign-in error:')
      console.error('Error message:', error.message)
      console.error('Error status:', error.status)
      console.error('Full error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: { message: error.message, details: error.status } },
        { status: 401 }
      )
    }

    console.log('✅ Sign-in successful for:', email)
    // Return the session data
    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error('Server-side sign-in exception:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Sign-in failed' } },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
