import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: null },
        { status: 200 }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Sign out the user
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken)

    if (error) {
      console.error('Server-side sign-out error:', error)
    }

    // Always return success for sign-out
    return NextResponse.json({ error: null }, { status: 200 })
  } catch (error: any) {
    console.error('Server-side sign-out exception:', error)
    // Always return success for sign-out
    return NextResponse.json({ error: null }, { status: 200 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
