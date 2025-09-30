import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Server-side auth using Supabase URL:', supabaseUrl)

// Create client for authentication
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Server-side sign-in attempt for:', email)
    
    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Server-side sign-in error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    console.log('Server-side sign-in successful for user:', data.user?.id)
    return NextResponse.json({ data, error: null })
    
  } catch (error: any) {
    console.error('Server-side sign-in exception:', error)
    return NextResponse.json(
      { error: error.message || 'Sign-in failed' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
