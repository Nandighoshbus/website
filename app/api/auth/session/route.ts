import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Return null session if no auth header (not an error, just not logged in)
    if (!authHeader) {
      return NextResponse.json(
        { session: null, error: null },
        { status: 200 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create client to validate session
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { session: null, error: null },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { session: { user }, error: null },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { session: null, error: null },
      { status: 200 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
