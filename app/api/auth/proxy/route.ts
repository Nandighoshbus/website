import { NextRequest, NextResponse } from 'next/server'

// DEPRECATED: This proxy route is no longer needed and should not be used
// The proper solution is to configure the Site URL in Supabase Dashboard
// This route is kept temporarily for backward compatibility but will be removed

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This authentication proxy is deprecated. Please ensure your Site URL is configured in Supabase Dashboard → Authentication → URL Configuration.',
      deprecated: true,
      instructions: 'Set Site URL to your production domain (e.g., https://nandighoshbus.com) in Supabase Dashboard'
    },
    { status: 410 } // Gone
  )
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
