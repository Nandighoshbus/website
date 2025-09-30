import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    // Create admin client for server-side authentication
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Sign in using admin client
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Server-side sign-in error:', error)
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 401 }
      )
    }

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
