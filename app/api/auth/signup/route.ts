import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, password, userData } = await request.json()

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

    // Sign up using admin client
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    })

    if (error) {
      console.error('Server-side sign-up error:', error)
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 400 }
      )
    }

    // Return the user data
    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error('Server-side sign-up exception:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Sign-up failed' } },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
