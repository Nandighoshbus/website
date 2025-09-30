// Quick environment check script
console.log('=== ENVIRONMENT VARIABLES CHECK ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'NOT SET')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('=====================================')

// Extract project ID from URL
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (match) {
    console.log('Supabase Project ID:', match[1])
    console.log('Dashboard URL: https://supabase.com/dashboard/project/' + match[1])
  }
}
